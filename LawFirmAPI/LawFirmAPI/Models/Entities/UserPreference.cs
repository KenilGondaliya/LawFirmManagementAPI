// Models/Entities/UserPreference.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("user_preferences")]
    public class UserPreference
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        public long FirmId { get; set; }
        
        [MaxLength(50)]
        public string Theme { get; set; } = "light";
        
        [MaxLength(10)]
        public string Language { get; set; } = "en";
        
        public bool NotificationsEnabled { get; set; } = true;
        
        public bool EmailNotifications { get; set; } = true;
        
        public bool PushNotifications { get; set; } = true;
        
        [MaxLength(20)]
        public string CalendarView { get; set; } = "month";
        
        [Column(TypeName = "json")]
        public string? DashboardLayout { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}