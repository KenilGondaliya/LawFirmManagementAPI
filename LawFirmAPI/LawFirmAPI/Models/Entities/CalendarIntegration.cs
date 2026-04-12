// Models/Entities/CalendarIntegration.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("calendar_integrations")]
    public class CalendarIntegration
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        public long FirmId { get; set; }
        
        [MaxLength(20)]
        public string Provider { get; set; } = string.Empty;
        
        public string? AccessToken { get; set; }
        
        public string? RefreshToken { get; set; }
        
        public DateTime? ExpiresAt { get; set; }
        
        [MaxLength(255)]
        public string? CalendarId { get; set; }
        
        public bool SyncEnabled { get; set; } = true;
        
        public DateTime? LastSyncAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}