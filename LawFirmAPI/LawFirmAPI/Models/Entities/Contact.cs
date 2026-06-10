using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("contacts")]
    public class Contact : BaseEntity
    {
        [Key]
        public long Id { get; set; }
        
        public Guid Uuid { get; set; } = Guid.NewGuid();
        
        public long FirmId { get; set; }
        
        // Basic Info
        [MaxLength(50)]
        public string? Prefix { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? MiddleName { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? Suffix { get; set; }
        
        [MaxLength(100)]
        public string? Nickname { get; set; }
        
        // Professional
        [MaxLength(200)]
        public string? CompanyName { get; set; }
        
        [MaxLength(200)]
        public string? Title { get; set; }
        
        [MaxLength(100)]
        public string? Department { get; set; }
        
        // Contact
        [MaxLength(255)]
        [EmailAddress]
        public string? Email { get; set; }
        
        [MaxLength(255)]
        [EmailAddress]
        public string? AlternativeEmail { get; set; }
        
        [MaxLength(50)]
        [Phone]
        public string? Phone { get; set; }
        
        [MaxLength(50)]
        [Phone]
        public string? AlternativePhone { get; set; }
        
        [MaxLength(50)]
        public string? Fax { get; set; }
        
        [MaxLength(500)]
        public string? Website { get; set; }
        
        // Personal
        public DateTime? DateOfBirth { get; set; }
        
        [MaxLength(20)]
        public string? Gender { get; set; }
        
        [MaxLength(20)]
        public string? MaritalStatus { get; set; }
        
        public DateTime? Anniversary { get; set; }
        
        [MaxLength(100)]
        public string? Nationality { get; set; }
        
        // Legal
        [MaxLength(50)]
        public string? TaxId { get; set; }
        
        [MaxLength(100)]
        public string? IdentificationNumber { get; set; }
        
        [MaxLength(50)]
        public string? IdentificationType { get; set; }
        
        // Flags
        public bool IsClient { get; set; }
        public bool IsOpponent { get; set; }
        public bool IsWitness { get; set; }
        public bool IsJudge { get; set; }
        public bool IsAdvocate { get; set; }
        public bool IsImportant { get; set; }
        
        // Additional
        public string? Notes { get; set; }
        public string? ProfileImageUrl { get; set; }
        
        // Foreign Keys
        public long? ContactTypeId { get; set; }
        
        // Navigation Properties
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(ContactTypeId))]
        public virtual ContactType? ContactType { get; set; }
        
        public virtual ICollection<ContactAddress> Addresses { get; set; } = new List<ContactAddress>();
        public virtual ICollection<ContactPhone> Phones { get; set; } = new List<ContactPhone>();
        public virtual ICollection<ContactEmail> Emails { get; set; } = new List<ContactEmail>();
        
        // ✅ Tags navigation property (many-to-many)
        public virtual ICollection<ContactTag> Tags { get; set; } = new List<ContactTag>();
        
        // Metadata
        public long? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
    }
}