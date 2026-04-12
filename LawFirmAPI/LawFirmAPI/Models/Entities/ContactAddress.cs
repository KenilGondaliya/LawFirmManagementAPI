// Models/Entities/ContactAddress.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("contact_addresses")]
    public class ContactAddress
    {
        [Key]
        public long Id { get; set; }
        
        public long ContactId { get; set; }
        
        [MaxLength(20)]
        public string AddressType { get; set; } = "HOME";
        
        [Required]
        public string AddressLine1 { get; set; } = string.Empty;
        
        public string? AddressLine2 { get; set; }
        
        [MaxLength(100)]
        public string? City { get; set; }
        
        [MaxLength(100)]
        public string? State { get; set; }
        
        [MaxLength(20)]
        public string? PostalCode { get; set; }
        
        [MaxLength(100)]
        public string? Country { get; set; }
        
        public bool IsPrimary { get; set; } = false;
        
        public decimal? Latitude { get; set; }
        
        public decimal? Longitude { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
    }
}
