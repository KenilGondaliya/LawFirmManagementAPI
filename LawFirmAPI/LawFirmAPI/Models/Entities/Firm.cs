// Models/Entities/Firm.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    public enum SubscriptionStatus
    {
        TRIAL,
        ACTIVE,
        SUSPENDED,
        CANCELED,
        EXPIRED
    }
    
    [Table("firms")]
    public class Firm : BaseEntity
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(255)]
        public string? LegalName { get; set; }
        
        [MaxLength(100)]
        public string? RegistrationNumber { get; set; }
        
        [MaxLength(100)]
        public string? TaxNumber { get; set; }
        
        [MaxLength(255)]
        public string? Email { get; set; }
        
        [MaxLength(50)]
        public string? Phone { get; set; }
        
        [MaxLength(255)]
        public string? Website { get; set; }
        
        public string? AddressLine1 { get; set; }
        
        public string? AddressLine2 { get; set; }
        
        [MaxLength(100)]
        public string? City { get; set; }
        
        [MaxLength(100)]
        public string? State { get; set; }
        
        [MaxLength(20)]
        public string? PostalCode { get; set; }
        
        [MaxLength(100)]
        public string? Country { get; set; }
        
        public string? LogoUrl { get; set; }
        
        public SubscriptionStatus SubscriptionStatus { get; set; } = SubscriptionStatus.TRIAL;
        
        public DateTime? SubscriptionStartDate { get; set; }
        
        public DateTime? SubscriptionEndDate { get; set; }
        
        public DateTime? TrialEndDate { get; set; }
        
        public int MaxUsers { get; set; } = 5;
        
        public long MaxStorageMb { get; set; } = 1024;
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual ICollection<UserFirm> UserFirms { get; set; } = new List<UserFirm>();
        
        public virtual ICollection<Matter> Matters { get; set; } = new List<Matter>();
        
        public virtual ICollection<Contact> Contacts { get; set; } = new List<Contact>();
        
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
        
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
        
        public virtual ICollection<CalendarEvent> CalendarEvents { get; set; } = new List<CalendarEvent>();
        
        public virtual ICollection<Bill> Bills { get; set; } = new List<Bill>();
        
        public virtual FirmSetting? Setting { get; set; }
        
        public virtual FirmSubscription? Subscription { get; set; }
    }
}