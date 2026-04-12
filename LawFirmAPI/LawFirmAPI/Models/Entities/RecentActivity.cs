// Models/Entities/RecentActivity.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("recent_activities")]
    public class RecentActivity
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        public long? UserId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string ActivityType { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? EntityType { get; set; }
        
        public long? EntityId { get; set; }
        
        [MaxLength(255)]
        public string? EntityName { get; set; }
        
        public string? Description { get; set; }
        
        [Column(TypeName = "json")]
        public string? Metadata { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}

