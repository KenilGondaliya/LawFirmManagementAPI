using LawFirmAPI.Models.Entities;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public interface IPaymentService
    {
        Task<bool> CreateSubscription(Firm firm, SubscriptionPlan plan, bool isYearly);
        Task<bool> ProcessPayment(decimal amount, string paymentMethodId);
    }
}