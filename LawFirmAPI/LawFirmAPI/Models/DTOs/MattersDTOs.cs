// Models/DTOs/MattersDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
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
        public string? ClientReference { get; set; }
        public DateTime? ClosedDate { get; set; }
    }

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
}