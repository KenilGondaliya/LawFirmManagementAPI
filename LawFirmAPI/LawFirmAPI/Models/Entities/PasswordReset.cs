// Models/Entities/PasswordReset.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("password_resets")]
    public class PasswordReset
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Token { get; set; } = string.Empty;
        
        public DateTime ExpiresAt { get; set; }
        
        public bool Used { get; set; } = false;
        
        public DateTime? UsedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(45)]
        public string? CreatedByIp { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}

