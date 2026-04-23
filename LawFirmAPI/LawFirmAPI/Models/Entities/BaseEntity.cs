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
        
        private DateTime _createdAt;
        public DateTime CreatedAt 
        { 
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
        
        private DateTime _updatedAt;
        public DateTime UpdatedAt 
        { 
            get => _updatedAt;
            set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
        
        private DateTime? _deletedAt;
        public DateTime? DeletedAt 
        { 
            get => _deletedAt;
            set => _deletedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }
    }
}