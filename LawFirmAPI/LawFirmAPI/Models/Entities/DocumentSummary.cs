// Models/Entities/DocumentSummary.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("document_summaries")]
    public class DocumentSummary
    {
        [Key]
        public long Id { get; set; }
        
        public long DocumentId { get; set; }
        
        [Required]
        public string Summary { get; set; } = string.Empty;
        
        [Column(TypeName = "json")]
        public string? KeyPoints { get; set; }
        
        [MaxLength(100)]
        public string? GeneratedBy { get; set; }
        
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(DocumentId))]
        public virtual Document? Document { get; set; }
    }
}