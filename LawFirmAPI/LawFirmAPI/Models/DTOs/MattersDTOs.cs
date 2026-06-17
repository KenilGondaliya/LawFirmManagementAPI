using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    // ==================== Main Matter DTOs ====================

    public class MatterDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string MatterNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "OPEN";
        public string Priority { get; set; } = "MEDIUM";
        public DateTime OpenDate { get; set; }
        public DateTime? PendingDate { get; set; }
        public DateTime? ClosedDate { get; set; }
        public DateTime? StatuteOfLimitationsDate { get; set; }
        public decimal? EstimatedValue { get; set; }
        public string? BillingMethod { get; set; }
        public decimal? HourlyRate { get; set; }
        public decimal? FixedFee { get; set; }
        public long? MatterTypeId { get; set; }
        public string? MatterTypeName { get; set; }
        public string? MatterTypeCategory { get; set; }
        public long? OriginatingAdvocateId { get; set; }
        public string? OriginatingAdvocateName { get; set; }
        public long? ResponsibleAdvocateId { get; set; }
        public string? ResponsibleAdvocateName { get; set; }
        public long? PracticeAreaId { get; set; }
        public string? PracticeAreaName { get; set; }
        public long? CourtId { get; set; }
        public string? CourtName { get; set; }
        public long? JudicialDistrictId { get; set; }
        public string? JudicialDistrictName { get; set; }
        public string? ClientReference { get; set; }
        public bool IsConfidential { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<MatterPartyDto> Parties { get; set; } = new();
        public List<MatterNoteDto> Notes { get; set; } = new();
    }

    public class CreateMatterDto
    {
        public long MatterTypeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime OpenDate { get; set; }
        public DateTime? PendingDate { get; set; }
        public DateTime? StatuteOfLimitationsDate { get; set; }
        public decimal? EstimatedValue { get; set; }
        public string? BillingMethod { get; set; }
        public decimal? HourlyRate { get; set; }
        public decimal? FixedFee { get; set; }
        public long? OriginatingAdvocateId { get; set; }
        public long? ResponsibleAdvocateId { get; set; }
        public long? PracticeAreaId { get; set; }
        public long? CourtId { get; set; }
        public long? JudicialDistrictId { get; set; }
        public string? ClientReference { get; set; }
        public bool IsConfidential { get; set; }
        public List<AddMatterPartyDto>? Parties { get; set; }
    }

    public class UpdateMatterDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Priority { get; set; }
        public decimal? EstimatedValue { get; set; }
        public string? BillingMethod { get; set; }
        public decimal? HourlyRate { get; set; }
        public decimal? FixedFee { get; set; }
        public long? ResponsibleAdvocateId { get; set; }
        public long? PracticeAreaId { get; set; }
        public long? CourtId { get; set; }
        public long? JudicialDistrictId { get; set; }
        public string? ClientReference { get; set; }
        public DateTime? ClosedDate { get; set; }
    }

    // ==================== Matter Types DTOs ====================

    public class MatterTypeDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateMatterTypeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UpdateMatterTypeDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }

    // ==================== Matter Parties DTOs ====================

    public class MatterPartyDto
    {
        public long Id { get; set; }
        public long ContactId { get; set; }
        public string? ContactName { get; set; }
        public string PartyType { get; set; } = string.Empty;
        public string? RoleDescription { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class AddMatterPartyDto
    {
        public long ContactId { get; set; }
        public string PartyType { get; set; } = string.Empty;
        public string? RoleDescription { get; set; }
        public bool IsPrimary { get; set; } = false;
    }

    public class UpdateMatterPartyDto
    {
        public string? PartyType { get; set; }
        public string? RoleDescription { get; set; }
        public bool? IsPrimary { get; set; }
    }

    // ==================== Matter Notes DTOs ====================

    public class MatterNoteDto
    {
        public long Id { get; set; }
        public string Note { get; set; } = string.Empty;
        public bool IsPrivate { get; set; }
        public string? UserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class AddMatterNoteDto
    {
        public string Note { get; set; } = string.Empty;
        public bool IsPrivate { get; set; } = false;
    }

    public class UpdateMatterNoteDto
    {
        public string? Note { get; set; }
        public bool? IsPrivate { get; set; }
    }

    // ==================== Practice Areas DTOs ====================

    public class PracticeAreaDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreatePracticeAreaDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
    }

    public class UpdatePracticeAreaDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Color { get; set; }
        public bool? IsActive { get; set; }
    }

    // ==================== Courts DTOs ====================

    public class CourtDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Level { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }

    public class CreateCourtDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Level { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }

    public class UpdateCourtDto
    {
        public string? Name { get; set; }
        public string? Level { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
    }

    // ==================== Judicial Districts DTOs ====================

    public class JudicialDistrictDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? State { get; set; }
        public string? Description { get; set; }
    }

    public class CreateJudicialDistrictDto
    {
        public string Name { get; set; } = string.Empty;
        public string? State { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateJudicialDistrictDto
    {
        public string? Name { get; set; }
        public string? State { get; set; }
        public string? Description { get; set; }
    }

    // ==================== Statistics DTOs ====================

    public class DashboardMatterStatsDto
    {
        public int Total { get; set; }
        public int Open { get; set; }
        public int Pending { get; set; }
        public int Closed { get; set; }
        public int Archived { get; set; }
        public int HighPriority { get; set; }
        public int UrgentPriority { get; set; }
        public int Litigation { get; set; }
        public int NonLitigation { get; set; }
    }

    public class MatterTimelineDto
    {
        public long Id { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ==================== Related Data DTOs ====================

    public class MatterDocumentDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public string? UploadedByName { get; set; }
    }

    public class MatterTaskDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public string? StatusName { get; set; }
        public string? StatusColor { get; set; }
        public string? PriorityName { get; set; }
        public string? PriorityColor { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class MatterEventDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public string? Location { get; set; }
        public string EventType { get; set; } = string.Empty;
        public bool IsAllDay { get; set; }
    }

    public class MatterBillDto
    {
        public long Id { get; set; }
        public string BillNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal BalanceDue { get; set; }
        public DateTime DueDate { get; set; }
        public string? StatusName { get; set; }
        public string? StatusColor { get; set; }
    }

    // ==================== Time Entries DTOs ====================

    public class TimeEntryDto
    {
        public long Id { get; set; }
        public DateTime Date { get; set; }
        public decimal Duration { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool Billable { get; set; }
        public decimal BillingRate { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AddTimeEntryDto
    {
        public DateTime Date { get; set; }
        public decimal Duration { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool Billable { get; set; } = true;
        public decimal? BillingRate { get; set; }
    }

    public class UpdateTimeEntryDto
    {
        public decimal? Duration { get; set; }
        public string? Description { get; set; }
        public bool? Billable { get; set; }
        public decimal? BillingRate { get; set; }
    }

    // ==================== Deadlines DTOs ====================

    public class MatterDeadlineDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime DeadlineDate { get; set; }
        public bool IsMet { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AddDeadlineDto
    {
        public string Title { get; set; } = string.Empty;
        public DateTime DeadlineDate { get; set; }
        public string? Notes { get; set; }
    }

    // ==================== Search and Filter DTOs ====================

    public class AdvancedSearchDto
    {
        public string? Title { get; set; }
        public string? MatterNumber { get; set; }
        public List<string>? Status { get; set; }
        public List<string>? Priority { get; set; }
        public List<long>? PracticeAreaId { get; set; }
        public long? ResponsibleAdvocateId { get; set; }
        public string? ClientName { get; set; }
        public DateTime? OpenDateFrom { get; set; }
        public DateTime? OpenDateTo { get; set; }
        public decimal? EstimatedValueMin { get; set; }
        public decimal? EstimatedValueMax { get; set; }
    }

    public class ExportFiltersDto
    {
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class ImportResultDto
    {
        public int Total { get; set; }
        public int Imported { get; set; }
        public int Failed { get; set; }
        public List<ImportErrorDto> Errors { get; set; } = new();
    }

    public class ImportErrorDto
    {
        public int Row { get; set; }
        public string Error { get; set; } = string.Empty;
    }

    public class ActivityLogDto
    {
        public long Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BulkUpdateDto
    {
        public List<long> MatterIds { get; set; } = new();
        public string? Status { get; set; }
        public long? AdvocateId { get; set; }
    }
}