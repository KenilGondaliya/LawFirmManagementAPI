// Models/DTOs/DocumentsDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    public class DocumentDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? MimeType { get; set; }
        public string? Extension { get; set; }
        public int Version { get; set; }
        public bool IsTemplate { get; set; }
        public bool IsArchived { get; set; }
        public long? MatterId { get; set; }
        public string? MatterTitle { get; set; }
        public long? ContactId { get; set; }
        public string? ContactName { get; set; }
        public long? DocumentTypeId { get; set; }
        public string? DocumentTypeName { get; set; }
        public long? FolderId { get; set; }
        public long UploadedBy { get; set; }
        public DateTime UploadedAt { get; set; }
        public DateTime? LastAccessedAt { get; set; }
    }

    public class UploadDocumentDto
    {
        public IFormFile File { get; set; } = null!;
        public string? Title { get; set; }
        public string? Description { get; set; }
        public long? MatterId { get; set; }
        public long? ContactId { get; set; }
        public long? DocumentTypeId { get; set; }
        public long? FolderId { get; set; }
        public bool IsTemplate { get; set; } = false;
    }

    public class UpdateDocumentDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public long? DocumentTypeId { get; set; }
        public long? FolderId { get; set; }
    }

    public class DocumentVersionDto
    {
        public long Id { get; set; }
        public int Version { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? ChangeSummary { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class DocumentShareDto
    {
        public long Id { get; set; }
        public string ShareToken { get; set; } = string.Empty;
        public string Permission { get; set; } = "VIEW";
        public DateTime? ExpiresAt { get; set; }
    }

    public class DocumentCommentDto
    {
        public long Id { get; set; }
        public string Comment { get; set; } = string.Empty;
        public long UserId { get; set; }
        public string? UserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DocumentSummaryDto
    {
        public string Summary { get; set; } = string.Empty;
        public List<string>? KeyPoints { get; set; }
        public DateTime GeneratedAt { get; set; }
    }

    public class DocumentTypeDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public bool IsTemplate { get; set; }
    }

    public class CreateDocumentTypeDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public bool IsTemplate { get; set; } = false;
    }

    public class FolderDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public long? ParentFolderId { get; set; }
        public string? Path { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<FolderDto>? SubFolders { get; set; }
        public List<DocumentDto>? Documents { get; set; }
    }

    public class CreateFolderDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public long? ParentFolderId { get; set; }
    }

    public class TemplateDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public long? DocumentTypeId { get; set; }
        public string? DocumentTypeName { get; set; }
        public string? PreviewImage { get; set; }
        public int UsageCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateTemplateDto
    {
        public IFormFile File { get; set; } = null!;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public long? DocumentTypeId { get; set; }
        public string? PreviewImage { get; set; }
        public bool IsPublic { get; set; } = false;
    }
}