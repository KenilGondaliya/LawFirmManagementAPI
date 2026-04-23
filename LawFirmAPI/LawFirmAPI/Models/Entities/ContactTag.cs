// Models/Entities/ContactTag.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    // Models/Entities/ContactTag.cs

    [Table("contact_tags")]
    public class ContactTag
    {
        [Key]
        public long Id { get; set; }

        public long ContactId { get; set; }

        public long TagId { get; set; }

        private DateTime _createdAt;
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }

        [ForeignKey(nameof(TagId))]
        public virtual Tag? Tag { get; set; }
    }
}