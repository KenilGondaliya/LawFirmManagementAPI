// Models/Entities/MatterNote.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("matter_notes")]
    public class MatterNote
    {
        [Key]
        public long Id { get; set; }
        
        public long MatterId { get; set; }
        
        public long UserId { get; set; }
        
        [Required]
        public string Note { get; set; } = string.Empty;
        
        public bool IsPrivate { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}

