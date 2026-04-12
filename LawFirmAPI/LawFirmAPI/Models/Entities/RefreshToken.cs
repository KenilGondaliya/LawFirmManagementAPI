// Models/Entities/RefreshToken.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("refresh_tokens")]
    public class RefreshToken
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        public long? FirmId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Token { get; set; } = string.Empty;
        
        public DateTime ExpiresAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool Revoked { get; set; } = false;
        
        [MaxLength(500)]
        public string? ReplacedByToken { get; set; }
        
        [MaxLength(45)]
        public string? CreatedByIp { get; set; }
        
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        
        public bool IsActive => !Revoked && !IsExpired;
        
        // Navigation properties
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}