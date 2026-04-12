// Models/Entities/UserFirm.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    public enum FirmRole
    {
        OWNER,
        ADMIN,
        MANAGER,
        STAFF,
        VIEWER
    }
    
    public enum UserFirmStatus
    {
        PENDING,
        ACTIVE,
        SUSPENDED,
        REMOVED
    }
    
    [Table("user_firms")]
    public class UserFirm
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        public long FirmId { get; set; }
        
        public FirmRole Role { get; set; } = FirmRole.STAFF;
        
        public bool IsPrimary { get; set; } = false;
        
        public long? InvitedBy { get; set; }
        
        public DateTime InvitedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? JoinedAt { get; set; }
        
        public UserFirmStatus Status { get; set; } = UserFirmStatus.PENDING;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Remove navigation properties to avoid circular references
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(InvitedBy))]
        public virtual User? Inviter { get; set; }
    }
}