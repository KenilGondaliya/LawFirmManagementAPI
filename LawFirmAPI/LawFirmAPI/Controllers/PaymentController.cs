// Controllers/PaymentController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Models.DTOs;
using LawFirmAPI.Services;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/payment")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IFirmContextService _firmContextService;

        public PaymentController(IPaymentService paymentService, IFirmContextService firmContextService)
        {
            _paymentService = paymentService;
            _firmContextService = firmContextService;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto createOrderDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _paymentService.CreateOrder(firmId, createOrderDto);
            return Ok(result);
        }

        [HttpPost("verify-payment")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentDto verifyPaymentDto)
        {
            var result = await _paymentService.VerifyPayment(verifyPaymentDto);
            if (!result)
                return BadRequest(new { message = "Payment verification failed" });
            return Ok(new { message = "Payment verified successfully" });
        }

        [HttpGet("subscription-status")]
        public async Task<IActionResult> GetSubscriptionStatus()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _paymentService.GetSubscriptionStatus(firmId);
            return Ok(result);
        }

        [HttpPost("cancel-subscription")]
        public async Task<IActionResult> CancelSubscription()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _paymentService.CancelSubscription(firmId);
            if (!result)
                return BadRequest(new { message = "Failed to cancel subscription" });
            return Ok(new { message = "Subscription cancelled successfully" });
        }
    }
}