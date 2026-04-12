
// Models/Entities/UserRole.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("user_roles")]
    public class UserRole
    {
        [Key]
        public long Id { get; set; }
        
        public long UserId { get; set; }
        
        public long RoleId { get; set; }
        
        public long? AssignedBy { get; set; }
        
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        [ForeignKey(nameof(RoleId))]
        public virtual Role? Role { get; set; }
        
        [ForeignKey(nameof(AssignedBy))]
        public virtual User? Assigner { get; set; }
    }
}