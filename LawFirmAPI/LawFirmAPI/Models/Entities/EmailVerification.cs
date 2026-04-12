// Models/Entities/EmailVerification.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("email_verifications")]
    public class EmailVerification
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Token { get; set; } = string.Empty;
        
        public DateTime ExpiresAt { get; set; }
        
        public DateTime? VerifiedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}

