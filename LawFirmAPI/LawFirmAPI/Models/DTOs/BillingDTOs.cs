// Models/DTOs/BillingDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    public class BillDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string BillNumber { get; set; } = string.Empty;
        public DateTime BillDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceDue { get; set; }
        public string Currency { get; set; } = "USD";
        public string? Notes { get; set; }
        public string? Terms { get; set; }
        public bool IsRecurring { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public long? MatterId { get; set; }
        public string? MatterTitle { get; set; }
        public long? ContactId { get; set; }
        public string? ClientName { get; set; }
        public long? StatusId { get; set; }
        public string? StatusName { get; set; }
        public string? StatusColor { get; set; }
        public List<BillItemDto> Items { get; set; } = new();
        public List<PaymentDto> Payments { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateBillDto
    {
        public long MatterId { get; set; }
        public long ContactId { get; set; }
        public long? StatusId { get; set; }
        public DateTime BillDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
        public string? Currency { get; set; }
        public string? Notes { get; set; }
        public string? Terms { get; set; }
        public bool IsRecurring { get; set; } = false;
        public object? RecurrencePattern { get; set; }
        public List<CreateBillItemDto>? Items { get; set; }
    }

    public class UpdateBillDto
    {
        public DateTime? DueDate { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
        public string? Notes { get; set; }
        public string? Terms { get; set; }
    }

    public class BillItemDto
    {
        public long Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TaxRate { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal Amount { get; set; }
        public decimal TotalAmount { get; set; }
        public int ItemOrder { get; set; }
    }

    public class CreateBillItemDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal TaxRate { get; set; } = 0;
        public decimal DiscountPercentage { get; set; } = 0;
        public int ItemOrder { get; set; } = 0;
    }

    public class PaymentDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string PaymentNumber { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? ReferenceNumber { get; set; }
        public string? Notes { get; set; }
        public long? ReceivedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AddPaymentDto
    {
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? ReferenceNumber { get; set; }
        public string? Notes { get; set; }
    }

    public class BillStatusDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public bool IsDefault { get; set; }
    }

    public class BillingDashboardDto
    {
        public decimal TotalBilled { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal TotalOutstanding { get; set; }
        public int OverdueBills { get; set; }
        public BillsCountDto BillsCount { get; set; } = new();
    }

    public class BillsCountDto
    {
        public int Draft { get; set; }
        public int Sent { get; set; }
        public int PartialPaid { get; set; }
        public int Paid { get; set; }
        public int Overdue { get; set; }
    }

    public class RevenueReportDto
    {
        public string Period { get; set; } = string.Empty;
        public int Year { get; set; }
        public int? Month { get; set; }
        public decimal TotalRevenue { get; set; }
        public int BillsCount { get; set; }
        public decimal AverageBillAmount { get; set; }
    }

    public class OutstandingReportDto
    {
        public decimal TotalOutstanding { get; set; }
        public decimal OverdueAmount { get; set; }
        public List<OutstandingBillDto> Bills { get; set; } = new();
    }

    public class OutstandingBillDto
    {
        public long Id { get; set; }
        public string BillNumber { get; set; } = string.Empty;
        public string? ClientName { get; set; }
        public string? MatterTitle { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public int DaysOverdue { get; set; }
    }

    public class InvoiceDto
    {
        public long Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}