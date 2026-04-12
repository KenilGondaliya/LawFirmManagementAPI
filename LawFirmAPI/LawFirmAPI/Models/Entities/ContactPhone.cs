
// Models/Entities/ContactPhone.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("contact_phones")]
    public class ContactPhone
    {
        [Key]
        public long Id { get; set; }
        
        public long ContactId { get; set; }
        
        [MaxLength(20)]
        public string PhoneType { get; set; } = "MOBILE";
        
        [Required]
        [MaxLength(50)]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [MaxLength(5)]
        public string? CountryCode { get; set; }
        
        [MaxLength(10)]
        public string? Extension { get; set; }
        
        public bool IsPrimary { get; set; } = false;
        
        public bool IsWhatsapp { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
    }
}

