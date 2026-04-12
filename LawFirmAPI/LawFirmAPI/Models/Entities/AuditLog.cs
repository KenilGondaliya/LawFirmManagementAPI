// Models/Entities/AuditLog.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("audit_logs")]
    public class AuditLog
    {
        [Key]
        public long Id { get; set; }
        
        public long? UserId { get; set; }
        
        public long? FirmId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? EntityType { get; set; }
        
        public long? EntityId { get; set; }
        
        [Column(TypeName = "json")]
        public string? OldValues { get; set; }
        
        [Column(TypeName = "json")]
        public string? NewValues { get; set; }
        
        [MaxLength(45)]
        public string? IpAddress { get; set; }
        
        public string? UserAgent { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}