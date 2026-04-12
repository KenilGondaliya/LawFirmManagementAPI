// Services/BillingService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Services
{
    public interface IBillingService
    {
        Task<List<BillDto>> GetAllBills(long firmId, long? matterId, long? contactId, string? status);
        Task<BillDto?> GetBillById(long id, long firmId);
        Task<BillDto> CreateBill(long firmId, long userId, CreateBillDto createDto);
        Task<BillDto> UpdateBill(long id, long firmId, UpdateBillDto updateDto);
        Task<bool> DeleteBill(long id, long firmId);
        Task<BillDto> UpdateBillStatus(long id, long firmId, long statusId);
        Task<byte[]> GenerateBillPdf(long id, long firmId);
        Task<bool> SendBill(long id, long firmId);
        Task<List<BillItemDto>> GetBillItems(long billId, long firmId);
        Task<BillItemDto> AddBillItem(long billId, long firmId, CreateBillItemDto itemDto);
        Task<bool> RemoveBillItem(long itemId, long firmId);
        Task<List<PaymentDto>> GetPayments(long billId, long firmId);
        Task<PaymentDto> AddPayment(long billId, long firmId, long userId, AddPaymentDto paymentDto);
        Task<bool> DeletePayment(long paymentId, long firmId);
        Task<List<BillStatusDto>> GetBillStatuses(long firmId);
        Task<BillingDashboardDto> GetBillingDashboard(long firmId);
        Task<RevenueReportDto> GetRevenueReport(long firmId, string period, int year, int? month);
        Task<OutstandingReportDto> GetOutstandingReport(long firmId);
        Task<List<InvoiceDto>> GetInvoices(long firmId);
        Task<InvoiceDto> GenerateInvoice(long firmId, long billId);
    }

    public class BillingService : IBillingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPdfService _pdfService;
        private readonly IEmailService _emailService;

        public BillingService(ApplicationDbContext context, IPdfService pdfService, IEmailService emailService)
        {
            _context = context;
            _pdfService = pdfService;
            _emailService = emailService;
        }

        public async Task<List<BillDto>> GetAllBills(long firmId, long? matterId, long? contactId, string? status)
        {
            var query = _context.Bills
                .Include(b => b.Matter)
                .Include(b => b.Contact)
                .Include(b => b.Status)
                .Where(b => b.FirmId == firmId && b.DeletedAt == null);

            if (matterId.HasValue)
                query = query.Where(b => b.MatterId == matterId.Value);

            if (contactId.HasValue)
                query = query.Where(b => b.ContactId == contactId.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(b => b.Status != null && b.Status.Name == status);

            var bills = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => MapToDto(b))
                .ToListAsync();

            return bills;
        }

        public async Task<BillDto?> GetBillById(long id, long firmId)
        {
            var bill = await _context.Bills
                .Include(b => b.Matter)
                .Include(b => b.Contact)
                .Include(b => b.Status)
                .Include(b => b.Items)
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.Id == id && b.FirmId == firmId && b.DeletedAt == null);

            return bill != null ? MapToDto(bill) : null;
        }

        public async Task<BillDto> CreateBill(long firmId, long userId, CreateBillDto createDto)
        {
            var firmSetting = await _context.FirmSettings.FirstOrDefaultAsync(fs => fs.FirmId == firmId);
            var prefix = firmSetting?.InvoicePrefix ?? "INV";
            var count = await _context.Bills.CountAsync(b => b.FirmId == firmId) + 1;
            var billNumber = $"{prefix}-{DateTime.Now:yyyyMMdd}-{count:D4}";

            var bill = new Bill
            {
                FirmId = firmId,
                BillNumber = billNumber,
                MatterId = createDto.MatterId,
                ContactId = createDto.ContactId,
                StatusId = createDto.StatusId ?? 1, // Draft status
                BillDate = createDto.BillDate,
                DueDate = createDto.DueDate,
                TaxAmount = createDto.TaxAmount ?? 0,
                DiscountAmount = createDto.DiscountAmount ?? 0,
                Currency = createDto.Currency ?? "USD",
                Notes = createDto.Notes,
                Terms = createDto.Terms,
                IsRecurring = createDto.IsRecurring,
                RecurrencePattern = createDto.RecurrencePattern != null ? System.Text.Json.JsonSerializer.Serialize(createDto.RecurrencePattern) : null,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Bills.Add(bill);
            await _context.SaveChangesAsync();

            // Add items
            decimal subtotal = 0;
            if (createDto.Items != null)
            {
                foreach (var itemDto in createDto.Items)
                {
                    var item = new BillItem
                    {
                        BillId = bill.Id,
                        Description = itemDto.Description,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemDto.UnitPrice,
                        TaxRate = itemDto.TaxRate,
                        DiscountPercentage = itemDto.DiscountPercentage,
                        ItemOrder = itemDto.ItemOrder,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.BillItems.Add(item);
                    subtotal += item.Amount;
                }
            }

            // Calculate totals
            bill.Subtotal = subtotal;
            bill.TotalAmount = subtotal + bill.TaxAmount - bill.DiscountAmount;
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, userId, "CREATE", "Bill", bill.Id, bill.BillNumber, $"Created bill: {bill.BillNumber}");

            return MapToDto(bill);
        }

        public async Task<BillDto> UpdateBill(long id, long firmId, UpdateBillDto updateDto)
        {
            var bill = await _context.Bills
                .FirstOrDefaultAsync(b => b.Id == id && b.FirmId == firmId && b.DeletedAt == null);

            if (bill == null)
                throw new KeyNotFoundException("Bill not found");

            if (updateDto.DueDate.HasValue)
                bill.DueDate = updateDto.DueDate.Value;
            if (updateDto.TaxAmount.HasValue)
                bill.TaxAmount = updateDto.TaxAmount.Value;
            if (updateDto.DiscountAmount.HasValue)
                bill.DiscountAmount = updateDto.DiscountAmount.Value;
            if (updateDto.Notes != null)
                bill.Notes = updateDto.Notes;
            if (updateDto.Terms != null)
                bill.Terms = updateDto.Terms;

            // Recalculate total
            bill.TotalAmount = bill.Subtotal + bill.TaxAmount - bill.DiscountAmount;
            bill.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(bill);
        }

        public async Task<bool> DeleteBill(long id, long firmId)
        {
            var bill = await _context.Bills
                .FirstOrDefaultAsync(b => b.Id == id && b.FirmId == firmId && b.DeletedAt == null);

            if (bill == null)
                return false;

            bill.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<BillDto> UpdateBillStatus(long id, long firmId, long statusId)
        {
            var bill = await _context.Bills
                .FirstOrDefaultAsync(b => b.Id == id && b.FirmId == firmId && b.DeletedAt == null);

            if (bill == null)
                throw new KeyNotFoundException("Bill not found");

            bill.StatusId = statusId;
            
            var status = await _context.BillStatuses.FindAsync(statusId);
            if (status != null && status.Name == "Sent" && !bill.SentAt.HasValue)
                bill.SentAt = DateTime.UtcNow;
            else if (status != null && status.Name == "Paid" && !bill.PaidAt.HasValue)
                bill.PaidAt = DateTime.UtcNow;

            bill.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(bill);
        }

        public async Task<byte[]> GenerateBillPdf(long id, long firmId)
        {
            var bill = await GetBillById(id, firmId);
            if (bill == null)
                throw new KeyNotFoundException("Bill not found");

            var firm = await _context.Firms.FindAsync(firmId);
            var pdfBytes = await _pdfService.GenerateBillPdf(bill, firm);
            return pdfBytes;
        }

        public async Task<bool> SendBill(long id, long firmId)
        {
            var bill = await _context.Bills
                .Include(b => b.Contact)
                .FirstOrDefaultAsync(b => b.Id == id && b.FirmId == firmId);

            if (bill == null)
                return false;

            var pdfBytes = await GenerateBillPdf(id, firmId);
            await _emailService.SendBillEmail(bill.Contact?.Email, bill.BillNumber, pdfBytes);

            bill.SentAt = DateTime.UtcNow;
            if (bill.StatusId == 1) // Draft
                bill.StatusId = 2; // Sent

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<BillItemDto>> GetBillItems(long billId, long firmId)
        {
            var items = await _context.BillItems
                .Where(i => i.BillId == billId)
                .OrderBy(i => i.ItemOrder)
                .Select(i => new BillItemDto
                {
                    Id = i.Id,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TaxRate = i.TaxRate,
                    DiscountPercentage = i.DiscountPercentage,
                    Amount = i.Amount,
                    TotalAmount = i.TotalAmount,
                    ItemOrder = i.ItemOrder
                })
                .ToListAsync();

            return items;
        }

        public async Task<BillItemDto> AddBillItem(long billId, long firmId, CreateBillItemDto itemDto)
        {
            var bill = await _context.Bills
                .FirstOrDefaultAsync(b => b.Id == billId && b.FirmId == firmId);

            if (bill == null)
                throw new KeyNotFoundException("Bill not found");

            var item = new BillItem
            {
                BillId = billId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                TaxRate = itemDto.TaxRate,
                DiscountPercentage = itemDto.DiscountPercentage,
                ItemOrder = itemDto.ItemOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.BillItems.Add(item);
            
            // Update bill subtotal and total
            bill.Subtotal += item.Amount;
            bill.TotalAmount = bill.Subtotal + bill.TaxAmount - bill.DiscountAmount;
            
            await _context.SaveChangesAsync();

            return new BillItemDto
            {
                Id = item.Id,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TaxRate = item.TaxRate,
                DiscountPercentage = item.DiscountPercentage,
                Amount = item.Amount,
                TotalAmount = item.TotalAmount,
                ItemOrder = item.ItemOrder
            };
        }

        public async Task<bool> RemoveBillItem(long itemId, long firmId)
        {
            var item = await _context.BillItems
                .Include(i => i.Bill)
                .FirstOrDefaultAsync(i => i.Id == itemId);

            if (item == null)
                return false;

            var bill = item.Bill;
            if (bill != null)
            {
                bill.Subtotal -= item.Amount;
                bill.TotalAmount = bill.Subtotal + bill.TaxAmount - bill.DiscountAmount;
            }

            _context.BillItems.Remove(item);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<PaymentDto>> GetPayments(long billId, long firmId)
        {
            var payments = await _context.Payments
                .Where(p => p.BillId == billId && p.FirmId == firmId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentDto
                {
                    Id = p.Id,
                    Uuid = p.Uuid,
                    PaymentNumber = p.PaymentNumber,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    ReferenceNumber = p.ReferenceNumber,
                    Notes = p.Notes,
                    ReceivedBy = p.ReceivedBy,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return payments;
        }

        public async Task<PaymentDto> AddPayment(long billId, long firmId, long userId, AddPaymentDto paymentDto)
        {
            var bill = await _context.Bills
                .FirstOrDefaultAsync(b => b.Id == billId && b.FirmId == firmId);

            if (bill == null)
                throw new KeyNotFoundException("Bill not found");

            var paymentNumber = $"PAY-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}";

            var payment = new Payment
            {
                FirmId = firmId,
                BillId = billId,
                PaymentNumber = paymentNumber,
                PaymentDate = paymentDto.PaymentDate,
                Amount = paymentDto.Amount,
                PaymentMethod = paymentDto.PaymentMethod,
                ReferenceNumber = paymentDto.ReferenceNumber,
                Notes = paymentDto.Notes,
                ReceivedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            
            // Update bill paid amount
            var totalPaid = (await _context.Payments
                .Where(p => p.BillId == billId)
                .SumAsync(p => p.Amount)) + paymentDto.Amount;
            
            bill.PaidAmount = totalPaid;
            
            // Update bill status
            if (totalPaid >= bill.TotalAmount)
            {
                bill.StatusId = 4; // Paid
                bill.PaidAt = DateTime.UtcNow;
            }
            else if (totalPaid > 0)
            {
                bill.StatusId = 3; // Partial Paid
            }
            
            await _context.SaveChangesAsync();

            return new PaymentDto
            {
                Id = payment.Id,
                Uuid = payment.Uuid,
                PaymentNumber = payment.PaymentNumber,
                PaymentDate = payment.PaymentDate,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                ReferenceNumber = payment.ReferenceNumber,
                Notes = payment.Notes,
                ReceivedBy = payment.ReceivedBy,
                CreatedAt = payment.CreatedAt
            };
        }

        public async Task<bool> DeletePayment(long paymentId, long firmId)
        {
            var payment = await _context.Payments
                .Include(p => p.Bill)
                .FirstOrDefaultAsync(p => p.Id == paymentId && p.FirmId == firmId);

            if (payment == null)
                return false;

            var bill = payment.Bill;
            if (bill != null)
            {
                bill.PaidAmount -= payment.Amount;
                if (bill.PaidAmount <= 0)
                {
                    bill.StatusId = 2; // Sent
                    bill.PaidAt = null;
                }
                else if (bill.PaidAmount >= bill.TotalAmount)
                {
                    bill.StatusId = 4; // Paid
                }
                else
                {
                    bill.StatusId = 3; // Partial Paid
                }
            }

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<BillStatusDto>> GetBillStatuses(long firmId)
        {
            var statuses = await _context.BillStatuses
                .Where(bs => bs.FirmId == firmId)
                .Select(bs => new BillStatusDto
                {
                    Id = bs.Id,
                    Name = bs.Name,
                    Color = bs.Color,
                    IsDefault = bs.IsDefault
                })
                .ToListAsync();

            return statuses;
        }

        public async Task<BillingDashboardDto> GetBillingDashboard(long firmId)
        {
            var bills = await _context.Bills
                .Where(b => b.FirmId == firmId && b.DeletedAt == null)
                .ToListAsync();

            var dashboard = new BillingDashboardDto
            {
                TotalBilled = bills.Sum(b => b.TotalAmount),
                TotalPaid = bills.Sum(b => b.PaidAmount),
                TotalOutstanding = bills.Sum(b => b.BalanceDue),
                OverdueBills = bills.Count(b => b.DueDate < DateTime.UtcNow && b.BalanceDue > 0),
                BillsCount = new BillsCountDto
                {
                    Draft = bills.Count(b => b.StatusId == 1),
                    Sent = bills.Count(b => b.StatusId == 2),
                    PartialPaid = bills.Count(b => b.StatusId == 3),
                    Paid = bills.Count(b => b.StatusId == 4),
                    Overdue = bills.Count(b => b.StatusId == 5)
                }
            };

            return dashboard;
        }

        public async Task<RevenueReportDto> GetRevenueReport(long firmId, string period, int year, int? month)
        {
            var query = _context.Bills
                .Where(b => b.FirmId == firmId && b.StatusId == 4 && b.PaidAt.HasValue);

            if (period == "monthly" && month.HasValue)
            {
                query = query.Where(b => b.PaidAt!.Value.Year == year && b.PaidAt.Value.Month == month.Value);
            }
            else if (period == "yearly")
            {
                query = query.Where(b => b.PaidAt!.Value.Year == year);
            }

            var revenue = await query.SumAsync(b => b.PaidAmount);
            var paidBills = await query.ToListAsync();

            return new RevenueReportDto
            {
                Period = period,
                Year = year,
                Month = month,
                TotalRevenue = revenue,
                BillsCount = paidBills.Count,
                AverageBillAmount = paidBills.Any() ? revenue / paidBills.Count : 0
            };
        }

        public async Task<OutstandingReportDto> GetOutstandingReport(long firmId)
        {
            var outstandingBills = await _context.Bills
                .Include(b => b.Contact)
                .Include(b => b.Matter)
                .Where(b => b.FirmId == firmId && b.BalanceDue > 0 && b.DeletedAt == null)
                .Select(b => new OutstandingBillDto
                {
                    Id = b.Id,
                    BillNumber = b.BillNumber,
                    ClientName = b.Contact != null ? $"{b.Contact.FirstName} {b.Contact.LastName}" : null,
                    MatterTitle = b.Matter != null ? b.Matter.Title : null,
                    Amount = b.BalanceDue,
                    DueDate = b.DueDate,
                    DaysOverdue = b.DueDate < DateTime.UtcNow ? (DateTime.UtcNow - b.DueDate).Days : 0
                })
                .ToListAsync();

            return new OutstandingReportDto
            {
                TotalOutstanding = outstandingBills.Sum(b => b.Amount),
                OverdueAmount = outstandingBills.Where(b => b.DaysOverdue > 0).Sum(b => b.Amount),
                Bills = outstandingBills
            };
        }

        public async Task<List<InvoiceDto>> GetInvoices(long firmId)
        {
            var invoices = await _context.Invoices
                .Where(i => i.FirmId == firmId)
                .OrderByDescending(i => i.InvoiceDate)
                .Select(i => new InvoiceDto
                {
                    Id = i.Id,
                    InvoiceNumber = i.InvoiceNumber,
                    InvoiceDate = i.InvoiceDate,
                    DueDate = i.DueDate,
                    Amount = i.Amount,
                    Status = i.Status,
                    PaymentMethod = i.PaymentMethod,
                    TransactionId = i.TransactionId,
                    CreatedAt = i.CreatedAt
                })
                .ToListAsync();

            return invoices;
        }

        public async Task<InvoiceDto> GenerateInvoice(long firmId, long billId)
        {
            var bill = await _context.Bills
                .FirstOrDefaultAsync(b => b.Id == billId && b.FirmId == firmId);

            if (bill == null)
                throw new KeyNotFoundException("Bill not found");

            var invoiceNumber = $"INV-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}";

            var invoice = new Invoice
            {
                FirmId = firmId,
                InvoiceNumber = invoiceNumber,
                InvoiceDate = DateTime.UtcNow,
                DueDate = bill.DueDate,
                Amount = bill.TotalAmount,
                Status = bill.BalanceDue > 0 ? "UNPAID" : "PAID",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return new InvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                InvoiceDate = invoice.InvoiceDate,
                DueDate = invoice.DueDate,
                Amount = invoice.Amount,
                Status = invoice.Status,
                CreatedAt = invoice.CreatedAt
            };
        }

        private BillDto MapToDto(Bill b)
        {
            return new BillDto
            {
                Id = b.Id,
                Uuid = b.Uuid,
                BillNumber = b.BillNumber,
                BillDate = b.BillDate,
                DueDate = b.DueDate,
                Subtotal = b.Subtotal,
                TaxAmount = b.TaxAmount,
                DiscountAmount = b.DiscountAmount,
                TotalAmount = b.TotalAmount,
                PaidAmount = b.PaidAmount,
                BalanceDue = b.BalanceDue,
                Currency = b.Currency,
                Notes = b.Notes,
                Terms = b.Terms,
                IsRecurring = b.IsRecurring,
                SentAt = b.SentAt,
                PaidAt = b.PaidAt,
                MatterId = b.MatterId,
                MatterTitle = b.Matter?.Title,
                ContactId = b.ContactId,
                ClientName = b.Contact != null ? $"{b.Contact.FirstName} {b.Contact.LastName}" : null,
                StatusId = b.StatusId,
                StatusName = b.Status?.Name,
                StatusColor = b.Status?.Color,
                Items = b.Items.Select(i => new BillItemDto
                {
                    Id = i.Id,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TaxRate = i.TaxRate,
                    DiscountPercentage = i.DiscountPercentage,
                    Amount = i.Amount,
                    TotalAmount = i.TotalAmount,
                    ItemOrder = i.ItemOrder
                }).ToList(),
                Payments = b.Payments.Select(p => new PaymentDto
                {
                    Id = p.Id,
                    PaymentNumber = p.PaymentNumber,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    PaymentMethod = p.PaymentMethod,
                    ReferenceNumber = p.ReferenceNumber,
                    Notes = p.Notes
                }).ToList(),
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            };
        }

        private void AddRecentActivity(long firmId, long userId, string activityType, string entityType, long entityId, string entityName, string description)
        {
            var activity = new RecentActivity
            {
                FirmId = firmId,
                UserId = userId,
                ActivityType = activityType,
                EntityType = entityType,
                EntityId = entityId,
                EntityName = entityName,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };
            _context.RecentActivities.Add(activity);
            _context.SaveChanges();
        }
    }
}