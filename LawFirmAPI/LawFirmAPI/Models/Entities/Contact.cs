// Models/Entities/Contact.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("contacts")]
    public class Contact : BaseEntity
    {
        public long FirmId { get; set; }
        
        public long? ContactTypeId { get; set; }
        
        [MaxLength(20)]
        public string? Prefix { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? MiddleName { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string? Suffix { get; set; }
        
        [MaxLength(100)]
        public string? Nickname { get; set; }
        
        [MaxLength(255)]
        public string? CompanyName { get; set; }
        
        [MaxLength(100)]
        public string? Title { get; set; }
        
        [MaxLength(100)]
        public string? Department { get; set; }
        
        [MaxLength(255)]
        public string? Email { get; set; }
        
        [MaxLength(255)]
        public string? AlternativeEmail { get; set; }
        
        [MaxLength(50)]
        public string? Phone { get; set; }
        
        [MaxLength(50)]
        public string? AlternativePhone { get; set; }
        
        [MaxLength(50)]
        public string? Fax { get; set; }
        
        [MaxLength(255)]
        public string? Website { get; set; }
        
        public DateTime? DateOfBirth { get; set; }
        
        [MaxLength(20)]
        public string? Gender { get; set; }
        
        [MaxLength(20)]
        public string? MaritalStatus { get; set; }
        
        public DateTime? Anniversary { get; set; }
        
        [MaxLength(100)]
        public string? Nationality { get; set; }
        
        [MaxLength(100)]
        public string? TaxId { get; set; }
        
        [MaxLength(100)]
        public string? IdentificationNumber { get; set; }
        
        [MaxLength(50)]
        public string? IdentificationType { get; set; }
        
        public bool IsClient { get; set; } = false;
        
        public bool IsOpponent { get; set; } = false;
        
        public bool IsWitness { get; set; } = false;
        
        public bool IsJudge { get; set; } = false;
        
        public bool IsAdvocate { get; set; } = false;
        
        public bool IsImportant { get; set; } = false;
        
        public string? Notes { get; set; }
        
        public string? ProfileImageUrl { get; set; }
        
        public long? CreatedBy { get; set; }
        
        public long? UpdatedBy { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(ContactTypeId))]
        public virtual ContactType? ContactType { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
        
        public virtual ICollection<ContactAddress> Addresses { get; set; } = new List<ContactAddress>();
        
        public virtual ICollection<ContactPhone> Phones { get; set; } = new List<ContactPhone>();
        
        public virtual ICollection<ContactEmail> Emails { get; set; } = new List<ContactEmail>();
        
        public virtual ICollection<MatterParty> MatterParties { get; set; } = new List<MatterParty>();
        
        // public virtual ICollection<ContactRelationship> Relationships { get; set; } = new List<ContactRelationship>();
        
        public virtual ICollection<ContactTag> ContactTags { get; set; } = new List<ContactTag>();

    }
}

