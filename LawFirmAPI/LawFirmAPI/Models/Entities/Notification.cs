// Models/Entities/Notification.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("notifications")]
    public class Notification
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        
        public string? Message { get; set; }
        
        [MaxLength(50)]
        public string? NotificationType { get; set; }
        
        [MaxLength(50)]
        public string? RelatedEntityType { get; set; }
        
        public long? RelatedEntityId { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public DateTime? ReadAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}