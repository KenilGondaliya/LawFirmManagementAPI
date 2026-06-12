// Services/PaymentService.cs - Alternative using HttpClient

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using LawFirmAPI.Data;
using LawFirmAPI.Models.DTOs;
using LawFirmAPI.Models.Entities;

namespace LawFirmAPI.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly string _razorpayKeyId;
        private readonly string _razorpayKeySecret;
        private readonly HttpClient _httpClient;

        public PaymentService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _razorpayKeyId = _configuration["Razorpay:KeyId"] ?? "";
            _razorpayKeySecret = _configuration["Razorpay:KeySecret"] ?? "";
            _httpClient = new HttpClient();
            
            // Set up basic authentication
            var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_razorpayKeyId}:{_razorpayKeySecret}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);
        }

        public async Task<OrderResponseDto> CreateOrder(long firmId, CreateOrderDto createOrderDto)
        {
            var plan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == createOrderDto.PlanId && p.IsActive);
            
            if (plan == null)
                throw new Exception("Plan not found");

            var isYearly = createOrderDto.BillingCycle.ToUpper() == "YEARLY";
            var amount = isYearly ? plan.PriceYearly : plan.PriceMonthly;
            var amountInPaise = (long)(amount * 100);

            // Create order via Razorpay API
            var orderData = new
            {
                amount = amountInPaise,
                currency = "INR",
                receipt = $"firm_{firmId}_plan_{plan.Id}_{DateTime.UtcNow.Ticks}",
                payment_capture = 1
            };

            var content = new StringContent(JsonSerializer.Serialize(orderData), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("https://api.razorpay.com/v1/orders", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
                throw new Exception($"Razorpay API error: {responseContent}");
            
            var order = JsonSerializer.Deserialize<Dictionary<string, object>>(responseContent);
            
            // Save order to database
            var payment = new SubscriptionPayment
            {
                FirmId = firmId,
                RazorpayOrderId = order?["id"]?.ToString() ?? "",
                Amount = amount,
                Currency = "INR",
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow
            };
            
            _context.SubscriptionPayments.Add(payment);
            await _context.SaveChangesAsync();
            
            return new OrderResponseDto
            {
                OrderId = order?["id"]?.ToString() ?? "",
                Amount = amountInPaise,
                Currency = "INR",
                KeyId = _razorpayKeyId,
                Receipt = order?["receipt"]?.ToString() ?? ""
            };
        }

        public async Task<bool> VerifyPayment(VerifyPaymentDto verifyPaymentDto)
        {
            try
            {
                // Verify signature
                var generatedSignature = GenerateSignature(
                    verifyPaymentDto.OrderId,
                    verifyPaymentDto.PaymentId,
                    _razorpayKeySecret
                );
                
                if (generatedSignature != verifyPaymentDto.Signature)
                    return false;
                
                // Find payment record
                var payment = await _context.SubscriptionPayments
                    .FirstOrDefaultAsync(p => p.RazorpayOrderId == verifyPaymentDto.OrderId);
                
                if (payment == null)
                    return false;
                
                // Update payment status
                payment.RazorpayPaymentId = verifyPaymentDto.PaymentId;
                payment.RazorpaySignature = verifyPaymentDto.Signature;
                payment.Status = "SUCCESS";
                payment.CompletedAt = DateTime.UtcNow;
                
                // Get plan
                var plan = await _context.SubscriptionPlans
                    .FirstOrDefaultAsync(p => p.Id == verifyPaymentDto.PlanId);
                
                if (plan == null)
                    return false;
                
                // Update firm subscription
                var isYearly = verifyPaymentDto.BillingCycle.ToUpper() == "YEARLY";
                var startDate = DateTime.UtcNow;
                var endDate = isYearly ? startDate.AddYears(1) : startDate.AddMonths(1);
                
                // Check if firm already has subscription
                var existingSubscription = await _context.FirmSubscriptions
                    .FirstOrDefaultAsync(s => s.FirmId == verifyPaymentDto.FirmId && s.Status == "ACTIVE");
                
                if (existingSubscription != null)
                {
                    existingSubscription.Status = "EXPIRED";
                    existingSubscription.EndDate = DateTime.UtcNow;
                }
                
                var subscription = new FirmSubscription
                {
                    FirmId = verifyPaymentDto.FirmId,
                    PlanId = plan.Id,
                    BillingCycle = isYearly ? "YEARLY" : "MONTHLY",
                    StartDate = startDate,
                    EndDate = endDate,
                    NextBillingDate = endDate,
                    Status = "ACTIVE",
                    AutoRenew = true
                };
                
                _context.FirmSubscriptions.Add(subscription);
                
                // Update firm
                var firm = await _context.Firms.FindAsync(verifyPaymentDto.FirmId);
                if (firm != null)
                {
                    firm.SubscriptionStatus = SubscriptionStatus.ACTIVE;
                    if (plan.MaxUsers.HasValue)
                        firm.MaxUsers = plan.MaxUsers.Value;
                    if (plan.MaxStorageMb.HasValue)
                        firm.MaxStorageMb = plan.MaxStorageMb.Value;
                }
                
                await _context.SaveChangesAsync();
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Payment verification failed: {ex.Message}");
                return false;
            }
        }
        
        public async Task<SubscriptionStatusDto> GetSubscriptionStatus(long firmId)
        {
            var subscription = await _context.FirmSubscriptions
                .Include(s => s.Plan)
                .Where(s => s.FirmId == firmId && s.Status == "ACTIVE")
                .OrderByDescending(s => s.StartDate)
                .FirstOrDefaultAsync();
            
            if (subscription == null || subscription.Plan == null)
            {
                return new SubscriptionStatusDto
                {
                    PlanName = "Basic",
                    PlanCode = "basic",
                    Status = "TRIAL",
                    Features = new[] { "Up to 5 users", "1GB storage", "Basic features" }
                };
            }
            
            // Parse features from JSON
            var features = new string[] { };
            if (!string.IsNullOrEmpty(subscription.Plan.Features))
            {
                try
                {
                    features = JsonSerializer.Deserialize<string[]>(subscription.Plan.Features) ?? new string[] { };
                }
                catch { }
            }
            
            return new SubscriptionStatusDto
            {
                PlanName = subscription.Plan.Name,
                PlanCode = subscription.Plan.Code,
                Status = subscription.Status,
                BillingCycle = subscription.BillingCycle,
                StartDate = subscription.StartDate,
                NextBillingDate = subscription.NextBillingDate,
                EndDate = subscription.EndDate,
                AutoRenew = subscription.AutoRenew,
                Features = features
            };
        }
        
        public async Task<bool> CancelSubscription(long firmId)
        {
            var subscription = await _context.FirmSubscriptions
                .FirstOrDefaultAsync(s => s.FirmId == firmId && s.Status == "ACTIVE");
            
            if (subscription == null)
                return false;
            
            subscription.AutoRenew = false;
            subscription.Status = "CANCELLED";
            
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<bool> UpdateSubscriptionStatus(long subscriptionId, string status)
        {
            var subscription = await _context.FirmSubscriptions.FindAsync(subscriptionId);
            if (subscription == null)
                return false;
            
            subscription.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task CreateSubscription(Firm firm, SubscriptionPlan plan, bool isYearly)
        {
            var startDate = DateTime.UtcNow;
            var endDate = isYearly ? startDate.AddYears(1) : startDate.AddMonths(1);
            
            var subscription = new FirmSubscription
            {
                FirmId = firm.Id,
                PlanId = plan.Id,
                BillingCycle = isYearly ? "YEARLY" : "MONTHLY",
                StartDate = startDate,
                EndDate = endDate,
                NextBillingDate = endDate,
                Status = "ACTIVE",
                AutoRenew = true
            };
            
            _context.FirmSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();
        }
        
        private string GenerateSignature(string orderId, string paymentId, string secret)
        {
            var text = $"{orderId}|{paymentId}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(text));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}