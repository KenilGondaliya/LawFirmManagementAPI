// Models/Entities/ContactEmail.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    // Models/Entities/ContactEmail.cs

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

        private DateTime _createdAt;
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
    }
}

