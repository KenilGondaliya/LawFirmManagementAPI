// Models/Entities/DashboardWidget.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("dashboard_widgets")]
    public class DashboardWidget
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string WidgetName { get; set; } = string.Empty;
        
        [Column(TypeName = "json")]
        public string? WidgetConfig { get; set; }
        
        public int Position { get; set; }
        
        public bool IsVisible { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}

