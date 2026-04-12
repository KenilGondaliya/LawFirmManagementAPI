// Models/Entities/OTPCode.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    public enum OTPType
    {
        LOGIN,
        VERIFICATION,
        PASSWORD_RESET,
        TWO_FACTOR
    }
    
    [Table("otp_codes")]
    public class OTPCode
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        public long? FirmId { get; set; }
        
        [Required]
        [MaxLength(6)]
        public string Code { get; set; } = string.Empty;
        
        public OTPType Type { get; set; }
        
        public DateTime ExpiresAt { get; set; }
        
        public DateTime? UsedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(45)]
        public string? CreatedByIp { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}