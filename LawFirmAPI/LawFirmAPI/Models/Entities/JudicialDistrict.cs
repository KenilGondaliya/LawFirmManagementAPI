// Models/Entities/JudicialDistrict.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("judicial_districts")]
    public class JudicialDistrict
    {
        [Key]
        public long Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? State { get; set; }
        
        public string? Description { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual ICollection<Matter> Matters { get; set; } = new List<Matter>();
    }
}
