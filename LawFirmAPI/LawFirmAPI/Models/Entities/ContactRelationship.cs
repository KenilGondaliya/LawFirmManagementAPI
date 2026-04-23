// Models/Entities/ContactRelationship.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    // Models/Entities/ContactRelationship.cs

    [Table("contact_relationships")]
    public class ContactRelationship
    {
        [Key]
        public long Id { get; set; }

        public long ContactId { get; set; }

        public long RelatedContactId { get; set; }

        [MaxLength(50)]
        public string RelationshipType { get; set; } = string.Empty;

        public string? Notes { get; set; }

        private DateTime _createdAt;
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private DateTime _updatedAt;
        public DateTime UpdatedAt
        {
            get => _updatedAt;
            set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }

        [ForeignKey(nameof(RelatedContactId))]
        public virtual Contact? RelatedContact { get; set; }
    }
}