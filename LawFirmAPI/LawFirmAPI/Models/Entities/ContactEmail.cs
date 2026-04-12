// Models/Entities/ContactEmail.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("contact_emails")]
    public class ContactEmail
    {
        [Key]
        public long Id { get; set; }
        
        public long ContactId { get; set; }
        
        [MaxLength(20)]
        public string EmailType { get; set; } = "PERSONAL";
        
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        public bool IsPrimary { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
    }
}

