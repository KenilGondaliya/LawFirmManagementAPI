// Models/Entities/User.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("users")]
    public class User : BaseEntity
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? FirstName { get; set; }
        
        [MaxLength(100)]
        public string? LastName { get; set; }
        
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        public string? ProfileImageUrl { get; set; }
        
        public bool IsEmailVerified { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
        
        public bool IsLocked { get; set; } = false;
        
        public DateTime? LockoutEndDate { get; set; }
        
        public int AccessFailedCount { get; set; } = 0;
        
        public DateTime? LastLoginAt { get; set; }
        
        [MaxLength(45)]
        public string? LastLoginIp { get; set; }
        
        public long? CreatedBy { get; set; }
        
    }
}