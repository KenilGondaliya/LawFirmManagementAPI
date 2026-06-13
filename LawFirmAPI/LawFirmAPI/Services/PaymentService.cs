// Services/PaymentService.cs - Complete Fixed Version

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

            var orderData = new Dictionary<string, object>
            {
                { "amount", amountInPaise },
                { "currency", "INR" },
                { "receipt", $"firm_{firmId}_plan_{plan.Id}_{DateTime.UtcNow.Ticks}" },
                { "payment_capture", 1 }
            };

            var content = new StringContent(JsonSerializer.Serialize(orderData), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("https://api.razorpay.com/v1/orders", content);
            
            var responseJson = await response.Content.ReadAsStringAsync();
            
            if (!response.IsSuccessStatusCode)
                throw new Exception($"Razorpay API error: {responseJson}");
            
            using var document = JsonDocument.Parse(responseJson);
            var root = document.RootElement;
            var razorpayOrderId = root.GetProperty("id").GetString() ?? "";

            var payment = new SubscriptionPayment
            {
                FirmId = firmId,
                RazorpayOrderId = razorpayOrderId,
                Amount = amount,
                Currency = "INR",
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow
            };

            _context.SubscriptionPayments.Add(payment);
            await _context.SaveChangesAsync();

            return new OrderResponseDto
            {
                OrderId = razorpayOrderId,
                Amount = amountInPaise,
                Currency = "INR",
                KeyId = _razorpayKeyId,
                Receipt = orderData["receipt"].ToString() ?? ""
            };
        }

        public async Task<bool> VerifyPayment(VerifyPaymentDto verifyPaymentDto)
        {
            try
            {
                Console.WriteLine($"=== Starting Payment Verification ===");
                
                // Verify signature
                var isValidSignature = VerifyRazorpaySignature(
                    verifyPaymentDto.OrderId,
                    verifyPaymentDto.PaymentId,
                    verifyPaymentDto.Signature
                );
                
                if (!isValidSignature)
                {
                    Console.WriteLine("Invalid signature - verification failed");
                    return false;
                }

                // Find payment record
                var payment = await _context.SubscriptionPayments
                    .FirstOrDefaultAsync(p => p.RazorpayOrderId == verifyPaymentDto.OrderId);

                if (payment == null)
                {
                    Console.WriteLine($"Payment record not found for OrderId: {verifyPaymentDto.OrderId}");
                    return false;
                }

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

                // Create subscription
                var isYearly = verifyPaymentDto.BillingCycle.ToUpper() == "YEARLY";
                var startDate = DateTime.UtcNow;
                var endDate = isYearly ? startDate.AddYears(1) : startDate.AddMonths(1);

                // ✅ FIX: Update existing subscription instead of creating new one
                var existingSubscription = await _context.FirmSubscriptions
                    .FirstOrDefaultAsync(s => s.FirmId == verifyPaymentDto.FirmId && s.Status == "ACTIVE");

                FirmSubscription subscription;

                if (existingSubscription != null)
                {
                    // Update existing subscription
                    Console.WriteLine($"Updating existing subscription for firm {verifyPaymentDto.FirmId}");
                    existingSubscription.PlanId = plan.Id;
                    existingSubscription.BillingCycle = isYearly ? "YEARLY" : "MONTHLY";
                    existingSubscription.StartDate = startDate;
                    existingSubscription.EndDate = endDate;
                    existingSubscription.NextBillingDate = endDate;
                    existingSubscription.Status = "ACTIVE";
                    existingSubscription.AutoRenew = true;
                    existingSubscription.UpdatedAt = DateTime.UtcNow;
                    
                    subscription = existingSubscription;
                }
                else
                {
                    // Create new subscription
                    Console.WriteLine($"Creating new subscription for firm {verifyPaymentDto.FirmId}");
                    subscription = new FirmSubscription
                    {
                        FirmId = verifyPaymentDto.FirmId,
                        PlanId = plan.Id,
                        BillingCycle = isYearly ? "YEARLY" : "MONTHLY",
                        StartDate = startDate,
                        EndDate = endDate,
                        NextBillingDate = endDate,
                        Status = "ACTIVE",
                        AutoRenew = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.FirmSubscriptions.Add(subscription);
                }

                // Save changes
                await _context.SaveChangesAsync();

                // Update firm
                var firm = await _context.Firms.FindAsync(verifyPaymentDto.FirmId);
                if (firm != null)
                {
                    firm.SubscriptionStatus = SubscriptionStatus.ACTIVE;
                    if (plan.MaxUsers.HasValue)
                        firm.MaxUsers = plan.MaxUsers.Value;
                    if (plan.MaxStorageMb.HasValue)
                        firm.MaxStorageMb = plan.MaxStorageMb.Value;
                    firm.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                Console.WriteLine("Payment verification completed successfully");
                return true;
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"Database error: {dbEx.InnerException?.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Payment verification failed: {ex.Message}");
                return false;
            }
        }
        
        private bool VerifyRazorpaySignature(string orderId, string paymentId, string signature)
        {
            try
            {
                var payload = $"{orderId}|{paymentId}";
                using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_razorpayKeySecret));
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                var expectedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
                
                return string.Equals(expectedSignature, signature, StringComparison.OrdinalIgnoreCase);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Signature verification error: {ex.Message}");
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

            var features = ParseFeaturesSafely(subscription.Plan.Features, subscription.Plan.Code);

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

        private string[] ParseFeaturesSafely(string? featuresJson, string planCode)
        {
            if (string.IsNullOrEmpty(featuresJson))
                return GetDefaultFeaturesForPlan(planCode);

            try
            {
                var features = JsonSerializer.Deserialize<string[]>(featuresJson);
                if (features != null && features.Length > 0)
                    return features;
            }
            catch { }

            return GetDefaultFeaturesForPlan(planCode);
        }

        private string[] GetDefaultFeaturesForPlan(string planCode)
        {
            return planCode?.ToLower() switch
            {
                "basic" => new[] { "Up to 5 users", "1GB storage", "Basic support", "Core features", "Email support" },
                "pro" => new[] { "Up to 50 users", "10GB storage", "Priority support", "Advanced features", "Analytics dashboard", "API access", "Email & Chat support" },
                "enterprise" => new[] { "Unlimited users", "100GB storage", "24/7 phone support", "Custom features", "Dedicated account manager", "SLA guarantee", "On-premise option" },
                _ => new[] { "Basic features", "Email support" }
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
            subscription.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateSubscriptionStatus(long subscriptionId, string status)
        {
            var subscription = await _context.FirmSubscriptions.FindAsync(subscriptionId);
            if (subscription == null)
                return false;

            subscription.Status = status;
            subscription.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task CreateSubscription(Firm firm, SubscriptionPlan plan, bool isYearly)
        {
            // Check if subscription already exists
            var existingSubscription = await _context.FirmSubscriptions
                .FirstOrDefaultAsync(s => s.FirmId == firm.Id && s.Status == "ACTIVE");

            if (existingSubscription != null)
            {
                // Update existing
                existingSubscription.PlanId = plan.Id;
                existingSubscription.BillingCycle = isYearly ? "YEARLY" : "MONTHLY";
                existingSubscription.StartDate = DateTime.UtcNow;
                existingSubscription.EndDate = isYearly ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1);
                existingSubscription.NextBillingDate = isYearly ? DateTime.UtcNow.AddYears(1) : DateTime.UtcNow.AddMonths(1);
                existingSubscription.Status = "ACTIVE";
                existingSubscription.AutoRenew = true;
                existingSubscription.UpdatedAt = DateTime.UtcNow;
            }
            else
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
                    AutoRenew = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.FirmSubscriptions.Add(subscription);
            }

            await _context.SaveChangesAsync();
        }
    }
}