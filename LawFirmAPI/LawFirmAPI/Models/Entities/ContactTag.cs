// Models/Entities/ContactTag.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("contact_tags")]
    public class ContactTag
    {
        [Key]
        public long Id { get; set; }
        
        public long ContactId { get; set; }
        
        public long TagId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
        
        [ForeignKey(nameof(TagId))]
        public virtual Tag? Tag { get; set; }
    }
}