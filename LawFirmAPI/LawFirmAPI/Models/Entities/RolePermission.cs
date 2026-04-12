// Models/Entities/RolePermission.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("role_permissions")]
    public class RolePermission
    {
        [Key]
        public long Id { get; set; }
        
        public long RoleId { get; set; }
        
        public long PermissionId { get; set; }
        
        public long? GrantedBy { get; set; }
        
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(RoleId))]
        public virtual Role? Role { get; set; }
        
        [ForeignKey(nameof(PermissionId))]
        public virtual Permission? Permission { get; set; }
        
        [ForeignKey(nameof(GrantedBy))]
        public virtual User? Granter { get; set; }
    }
}