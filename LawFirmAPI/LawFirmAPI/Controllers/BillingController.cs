// Controllers/BillingController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/billing")]
    [Authorize]
    public class BillingController : ControllerBase
    {
        private readonly IBillingService _billingService;
        private readonly IFirmContextService _firmContextService;

        public BillingController(IBillingService billingService, IFirmContextService firmContextService)
        {
            _billingService = billingService;
            _firmContextService = firmContextService;
        }

        // Basic Bill Operations
        [HttpGet("bills")]
        public async Task<IActionResult> GetAllBills(
            [FromQuery] long? matterId,
            [FromQuery] long? contactId,
            [FromQuery] string? status)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var bills = await _billingService.GetAllBills(firmId, matterId, contactId, status);
            return Ok(bills);
        }

        [HttpGet("bills/{id}")]
        public async Task<IActionResult> GetBillById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var bill = await _billingService.GetBillById(id, firmId);
            if (bill == null)
                return NotFound(new { message = "Bill not found" });
            return Ok(bill);
        }

        [HttpPost("bills")]
        public async Task<IActionResult> CreateBill([FromBody] CreateBillDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var bill = await _billingService.CreateBill(firmId, userId, createDto);
            return Ok(new { message = "Bill created successfully", billId = bill.Id, bill });
        }

        [HttpPut("bills/{id}")]
        public async Task<IActionResult> UpdateBill(long id, [FromBody] UpdateBillDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var bill = await _billingService.UpdateBill(id, firmId, updateDto);
            return Ok(new { message = "Bill updated successfully", bill });
        }

        [HttpDelete("bills/{id}")]
        public async Task<IActionResult> DeleteBill(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _billingService.DeleteBill(id, firmId);
            if (!result)
                return NotFound(new { message = "Bill not found" });
            return Ok(new { message = "Bill deleted successfully" });
        }

        [HttpPatch("bills/{id}/status")]
        public async Task<IActionResult> UpdateBillStatus(long id, [FromQuery] long statusId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var bill = await _billingService.UpdateBillStatus(id, firmId, statusId);
            return Ok(new { message = "Bill status updated", bill });
        }

        [HttpGet("bills/{id}/pdf")]
        public async Task<IActionResult> GetBillPdf(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var pdfBytes = await _billingService.GenerateBillPdf(id, firmId);
            return File(pdfBytes, "application/pdf", $"bill-{id}.pdf");
        }

        [HttpPost("bills/{id}/send")]
        public async Task<IActionResult> SendBill(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _billingService.SendBill(id, firmId);
            if (!result)
                return NotFound(new { message = "Bill not found" });
            return Ok(new { message = "Bill sent successfully" });
        }

        // Bill Items
        [HttpGet("bills/{id}/items")]
        public async Task<IActionResult> GetBillItems(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var items = await _billingService.GetBillItems(id, firmId);
            return Ok(items);
        }

        [HttpPost("bills/{id}/items")]
        public async Task<IActionResult> AddBillItem(long id, [FromBody] CreateBillItemDto itemDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var item = await _billingService.AddBillItem(id, firmId, itemDto);
            return Ok(new { message = "Item added successfully", item });
        }

        [HttpDelete("bills/items/{itemId}")]
        public async Task<IActionResult> RemoveBillItem(long itemId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _billingService.RemoveBillItem(itemId, firmId);
            if (!result)
                return NotFound(new { message = "Item not found" });
            return Ok(new { message = "Item removed successfully" });
        }

        // Payments
        [HttpGet("bills/{id}/payments")]
        public async Task<IActionResult> GetPayments(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var payments = await _billingService.GetPayments(id, firmId);
            return Ok(payments);
        }

        [HttpPost("bills/{id}/payments")]
        public async Task<IActionResult> AddPayment(long id, [FromBody] AddPaymentDto paymentDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var payment = await _billingService.AddPayment(id, firmId, userId, paymentDto);
            return Ok(new { message = "Payment added successfully", payment });
        }

        [HttpDelete("payments/{paymentId}")]
        public async Task<IActionResult> DeletePayment(long paymentId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _billingService.DeletePayment(paymentId, firmId);
            if (!result)
                return NotFound(new { message = "Payment not found" });
            return Ok(new { message = "Payment deleted successfully" });
        }

        // Statuses
        [HttpGet("statuses")]
        public async Task<IActionResult> GetBillStatuses()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var statuses = await _billingService.GetBillStatuses(firmId);
            return Ok(statuses);
        }

        // Dashboard and Reports
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetBillingDashboard()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var dashboard = await _billingService.GetBillingDashboard(firmId);
            return Ok(dashboard);
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueReport(
            [FromQuery] string period = "monthly",
            [FromQuery] int year = 0,
            [FromQuery] int? month = null)
        {
            if (year == 0) year = DateTime.UtcNow.Year;
            var firmId = await _firmContextService.GetCurrentFirmId();
            var report = await _billingService.GetRevenueReport(firmId, period, year, month);
            return Ok(report);
        }

        [HttpGet("outstanding")]
        public async Task<IActionResult> GetOutstandingReport()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var report = await _billingService.GetOutstandingReport(firmId);
            return Ok(report);
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var dashboard = await _billingService.GetBillingDashboard(firmId);
            return Ok(dashboard);
        }

        [HttpGet("reports/monthly")]
        public async Task<IActionResult> GetMonthlyReport([FromQuery] int year = 0, [FromQuery] int month = 0)
        {
            if (year == 0) year = DateTime.UtcNow.Year;
            if (month == 0) month = DateTime.UtcNow.Month;
            var firmId = await _firmContextService.GetCurrentFirmId();
            var report = await _billingService.GetRevenueReport(firmId, "monthly", year, month);
            return Ok(report);
        }

        [HttpGet("reports/yearly")]
        public async Task<IActionResult> GetYearlyReport([FromQuery] int year = 0)
        {
            if (year == 0) year = DateTime.UtcNow.Year;
            var firmId = await _firmContextService.GetCurrentFirmId();
            var report = await _billingService.GetRevenueReport(firmId, "yearly", year, null);
            return Ok(report);
        }

        // Invoices (Subscription Billing)
        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var invoices = await _billingService.GetInvoices(firmId);
            return Ok(invoices);
        }

        [HttpPost("invoices/generate")]
        public async Task<IActionResult> GenerateInvoice([FromQuery] long billId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var invoice = await _billingService.GenerateInvoice(firmId, billId);
            return Ok(new { message = "Invoice generated successfully", invoice });
        }

        [HttpGet("invoices/{id}/download")]
        public async Task<IActionResult> DownloadInvoice(long id)
        {
            // Implementation would generate invoice PDF
            return Ok(new { message = "Invoice download would be implemented here" });
        }
    }
}