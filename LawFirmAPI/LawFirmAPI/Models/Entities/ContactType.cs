// Models/Entities/ContactType.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    // Models/Entities/ContactType.cs

    [Table("contact_types")]
    public class ContactType
    {
        [Key]
        public long Id { get; set; }

        public long FirmId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(7)]
        public string? Color { get; set; }

        public bool IsSystem { get; set; } = false;

        private DateTime _createdAt;
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }

        public virtual ICollection<Contact> Contacts { get; set; } = new List<Contact>();
    }
}

