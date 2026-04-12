// Models/Entities/ContactRelationship.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
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
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
        
        [ForeignKey(nameof(RelatedContactId))]
        public virtual Contact? RelatedContact { get; set; }
    }
}