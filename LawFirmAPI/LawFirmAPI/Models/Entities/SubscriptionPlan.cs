// Models/Entities/SubscriptionPlan.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("subscription_plans")]
    public class SubscriptionPlan
    {
        [Key]
        public long Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public decimal PriceMonthly { get; set; }
        
        public decimal PriceYearly { get; set; }
        
        [Column(TypeName = "json")]
        public string? Features { get; set; }
        
        public int? MaxUsers { get; set; }
        
        public int? MaxMatters { get; set; }
        
        public int? MaxContacts { get; set; }
        
        public long? MaxStorageMb { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual ICollection<FirmSubscription> FirmSubscriptions { get; set; } = new List<FirmSubscription>();
    }
}

