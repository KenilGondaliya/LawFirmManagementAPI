using LawFirmAPI.Models.Entities;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public class PaymentService : IPaymentService
    {
        public async Task<bool> CreateSubscription(Firm firm, SubscriptionPlan plan, bool isYearly)
        {
            // TODO: Implement payment processing
            await Task.CompletedTask;
            return true;
        }

        public async Task<bool> ProcessPayment(decimal amount, string paymentMethodId)
        {
            await Task.CompletedTask;
            return true;
        }
    }
}