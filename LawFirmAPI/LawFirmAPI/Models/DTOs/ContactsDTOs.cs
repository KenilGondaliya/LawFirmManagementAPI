// Models/DTOs/ContactsDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    public class ContactDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? CompanyName { get; set; }
        public string? Title { get; set; }
        public string? Department { get; set; }
        public bool IsClient { get; set; }
        public bool IsOpponent { get; set; }
        public bool IsWitness { get; set; }
        public bool IsJudge { get; set; }
        public bool IsAdvocate { get; set; }
        public bool IsImportant { get; set; }
        public string? Notes { get; set; }
        public string? ProfileImageUrl { get; set; }
        public long? ContactTypeId { get; set; }
        public string? ContactTypeName { get; set; }
        public List<ContactAddressDto> Addresses { get; set; } = new();
        public List<ContactPhoneDto> Phones { get; set; } = new();
        public List<ContactEmailDto> Emails { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContactDto
    {
        public long? ContactTypeId { get; set; }
        public string? Prefix { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string? Suffix { get; set; }
        public string? Nickname { get; set; }
        public string? CompanyName { get; set; }
        public string? Title { get; set; }
        public string? Department { get; set; }
        public string? Email { get; set; }
        public string? AlternativeEmail { get; set; }
        public string? Phone { get; set; }
        public string? AlternativePhone { get; set; }
        public string? Fax { get; set; }
        public string? Website { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? MaritalStatus { get; set; }
        public DateTime? Anniversary { get; set; }
        public string? Nationality { get; set; }
        public string? TaxId { get; set; }
        public string? IdentificationNumber { get; set; }
        public string? IdentificationType { get; set; }
        public bool IsClient { get; set; }
        public bool IsOpponent { get; set; }
        public bool IsWitness { get; set; }
        public bool IsJudge { get; set; }
        public bool IsAdvocate { get; set; }
        public bool IsImportant { get; set; }
        public string? Notes { get; set; }
        public long? SpouseContactId { get; set; }
        public List<AddRelativeDto>? Relatives { get; set; }
        public List<CreateContactAddressDto>? Addresses { get; set; }
        public List<CreateContactPhoneDto>? Phones { get; set; }
        public List<CreateContactEmailDto>? Emails { get; set; }
        public List<long>? TagIds { get; set; }
    }

    public class UpdateContactDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? CompanyName { get; set; }
        public string? Title { get; set; }
        public string? Department { get; set; }
        public bool? IsClient { get; set; }
        public bool? IsOpponent { get; set; }
        public bool? IsImportant { get; set; }
        public string? Notes { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? MaritalStatus { get; set; }
    }

    public class ContactAddressDto
    {
        public long Id { get; set; }
        public string AddressType { get; set; } = "HOME";
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class CreateContactAddressDto
    {
        public string AddressType { get; set; } = "HOME";
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ContactPhoneDto
    {
        public long Id { get; set; }
        public string PhoneType { get; set; } = "MOBILE";
        public string PhoneNumber { get; set; } = string.Empty;
        public string? CountryCode { get; set; }
        public string? Extension { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsWhatsapp { get; set; }
    }

    public class CreateContactPhoneDto
    {
        public string PhoneType { get; set; } = "MOBILE";
        public string PhoneNumber { get; set; } = string.Empty;
        public string? CountryCode { get; set; }
        public string? Extension { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsWhatsapp { get; set; }
    }

    public class ContactEmailDto
    {
        public long Id { get; set; }
        public string EmailType { get; set; } = "PERSONAL";
        public string Email { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class CreateContactEmailDto
    {
        public string EmailType { get; set; } = "PERSONAL";
        public string Email { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class ContactRelationshipDto
    {
        public long Id { get; set; }
        public long RelatedContactId { get; set; }
        public string RelationshipType { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class AddRelativeDto
    {
        public long RelatedContactId { get; set; }
        public string RelationshipType { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class TagDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
    }

    public class CreateTagDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
    }

    public class MatterBriefDto
    {
        public long Id { get; set; }
        public string MatterNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PartyType { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class TaskBriefDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
    }

    public class DocumentBriefDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }

    public class ContactStatsDto
    {
        public int Total { get; set; }
        public int Clients { get; set; }
        public int Opponents { get; set; }
        public int Witnesses { get; set; }
        public int Judges { get; set; }
        public int Advocates { get; set; }
        public int Important { get; set; }
    }
}