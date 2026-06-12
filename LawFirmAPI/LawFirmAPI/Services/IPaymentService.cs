// Services/IPaymentService.cs
using System.Threading.Tasks;
using LawFirmAPI.Models.DTOs;
using LawFirmAPI.Models.Entities;

namespace LawFirmAPI.Services
{
    public interface IPaymentService
    {
        Task<OrderResponseDto> CreateOrder(long firmId, CreateOrderDto createOrderDto);
        Task<bool> VerifyPayment(VerifyPaymentDto verifyPaymentDto);
        Task<SubscriptionStatusDto> GetSubscriptionStatus(long firmId);
        Task<bool> CancelSubscription(long firmId);
        Task<bool> UpdateSubscriptionStatus(long subscriptionId, string status);
        Task CreateSubscription(Firm firm, SubscriptionPlan plan, bool isYearly);

    }
}