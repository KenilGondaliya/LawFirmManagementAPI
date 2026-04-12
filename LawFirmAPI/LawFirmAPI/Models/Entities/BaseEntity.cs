// Models/Entities/BaseEntity.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    public abstract class BaseEntity
    {
        [Key]
        public long Id { get; set; }
        
        public Guid Uuid { get; set; } = Guid.NewGuid();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? DeletedAt { get; set; }
    }
}