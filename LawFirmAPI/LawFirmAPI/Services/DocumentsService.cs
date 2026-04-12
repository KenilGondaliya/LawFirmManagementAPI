// Services/DocumentsService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Services
{
    public interface IDocumentsService
    {
        Task<List<DocumentDto>> GetAllDocuments(long firmId, long? matterId, long? folderId, string? search);
        Task<DocumentDto?> GetDocumentById(long id, long firmId);
        Task<DocumentDto> UploadDocument(long firmId, long userId, UploadDocumentDto uploadDto);
        Task<bool> DeleteDocument(long id, long firmId);
        Task<byte[]> DownloadDocument(long id, long firmId);
        Task<DocumentDto> UpdateDocument(long id, long firmId, UpdateDocumentDto updateDto);
        Task<DocumentVersionDto> CreateVersion(long documentId, long firmId, long userId, IFormFile file, string? changeSummary);
        Task<List<DocumentVersionDto>> GetDocumentVersions(long documentId, long firmId);
        Task<DocumentShareDto> ShareDocument(long documentId, long firmId, long userId, long? sharedWithUserId, string? sharedWithEmail, string permission, int? expiresInDays);
        Task<bool> RevokeShare(long shareId, long firmId);
        Task<DocumentCommentDto> AddComment(long documentId, long firmId, long userId, string comment);
        Task<bool> DeleteComment(long commentId, long firmId);
        Task<DocumentSummaryDto> GetDocumentSummary(long documentId, long firmId);
        Task<DocumentSummaryDto> GenerateSummary(long documentId, long firmId);
        Task<List<DocumentTypeDto>> GetDocumentTypes(long firmId);
        Task<DocumentTypeDto> CreateDocumentType(long firmId, CreateDocumentTypeDto createDto);
        Task<List<FolderDto>> GetFolders(long firmId, long? parentFolderId);
        Task<FolderDto> CreateFolder(long firmId, long userId, CreateFolderDto createDto);
        Task<bool> MoveDocument(long documentId, long firmId, long? folderId);
        Task<List<TemplateDto>> GetTemplates(long firmId, string? category);
        Task<TemplateDto> CreateTemplate(long firmId, long userId, CreateTemplateDto createDto);
        Task<bool> DeleteTemplate(long templateId, long firmId);
    }

    public class DocumentsService : IDocumentsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;
        private readonly IAISummaryService _aiSummaryService;

        public DocumentsService(ApplicationDbContext context, IFileService fileService, IAISummaryService aiSummaryService)
        {
            _context = context;
            _fileService = fileService;
            _aiSummaryService = aiSummaryService;
        }

        public async Task<List<DocumentDto>> GetAllDocuments(long firmId, long? matterId, long? folderId, string? search)
        {
            var query = _context.Documents
                .Include(d => d.Matter)
                .Include(d => d.Contact)
                .Include(d => d.DocumentType)
                .Where(d => d.FirmId == firmId && !d.IsArchived);

            if (matterId.HasValue)
                query = query.Where(d => d.MatterId == matterId.Value);

            if (folderId.HasValue)
                query = query.Where(d => d.FolderId == folderId.Value);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d => 
                    d.Title.Contains(search) || 
                    d.FileName.Contains(search) ||
                    (d.Description != null && d.Description.Contains(search)));
            }

            var documents = await query
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => MapToDto(d))
                .ToListAsync();

            return documents;
        }

        public async Task<DocumentDto?> GetDocumentById(long id, long firmId)
        {
            var document = await _context.Documents
                .Include(d => d.Matter)
                .Include(d => d.Contact)
                .Include(d => d.DocumentType)
                .FirstOrDefaultAsync(d => d.Id == id && d.FirmId == firmId);

            if (document == null)
                return null;

            // Update last accessed
            document.LastAccessedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(document);
        }

        public async Task<DocumentDto> UploadDocument(long firmId, long userId, UploadDocumentDto uploadDto)
        {
            if (uploadDto.File == null || uploadDto.File.Length == 0)
                throw new ArgumentException("No file uploaded");

            var filePath = await _fileService.SaveFile(uploadDto.File, "documents");

            var document = new Document
            {
                FirmId = firmId,
                FolderId = uploadDto.FolderId,
                DocumentTypeId = uploadDto.DocumentTypeId,
                Title = uploadDto.Title ?? uploadDto.File.FileName,
                Description = uploadDto.Description,
                FileName = uploadDto.File.FileName,
                FilePath = filePath,
                FileSize = uploadDto.File.Length,
                MimeType = uploadDto.File.ContentType,
                Extension = Path.GetExtension(uploadDto.File.FileName),
                MatterId = uploadDto.MatterId,
                ContactId = uploadDto.ContactId,
                IsTemplate = uploadDto.IsTemplate,
                UploadedBy = userId,
                UploadedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, userId, "UPLOAD", "Document", document.Id, document.Title, $"Uploaded document: {document.Title}");

            return MapToDto(document);
        }

        public async Task<bool> DeleteDocument(long id, long firmId)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id && d.FirmId == firmId);

            if (document == null)
                return false;

            _fileService.DeleteFile(document.FilePath);
            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<byte[]> DownloadDocument(long id, long firmId)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id && d.FirmId == firmId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            var fileBytes = await _fileService.GetFile(document.FilePath);
            return fileBytes;
        }

        public async Task<DocumentDto> UpdateDocument(long id, long firmId, UpdateDocumentDto updateDto)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id && d.FirmId == firmId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (updateDto.Title != null)
                document.Title = updateDto.Title;
            if (updateDto.Description != null)
                document.Description = updateDto.Description;
            if (updateDto.DocumentTypeId.HasValue)
                document.DocumentTypeId = updateDto.DocumentTypeId;
            if (updateDto.FolderId.HasValue)
                document.FolderId = updateDto.FolderId;

            await _context.SaveChangesAsync();

            return MapToDto(document);
        }

        public async Task<DocumentVersionDto> CreateVersion(long documentId, long firmId, long userId, IFormFile file, string? changeSummary)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.FirmId == firmId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            var newVersion = document.Version + 1;
            var filePath = await _fileService.SaveFile(file, "documents/versions");

            var version = new DocumentVersion
            {
                DocumentId = documentId,
                Version = newVersion,
                FileName = file.FileName,
                FilePath = filePath,
                FileSize = file.Length,
                ChangeSummary = changeSummary,
                UploadedBy = userId,
                UploadedAt = DateTime.UtcNow
            };

            _context.DocumentVersions.Add(version);
            
            // Update current document
            document.Version = newVersion;
            document.FileName = file.FileName;
            document.FilePath = filePath;
            document.FileSize = file.Length;
            document.UploadedAt = DateTime.UtcNow;
            document.UploadedBy = userId;

            await _context.SaveChangesAsync();

            return new DocumentVersionDto
            {
                Id = version.Id,
                Version = version.Version,
                FileName = version.FileName,
                FileSize = version.FileSize,
                ChangeSummary = version.ChangeSummary,
                UploadedAt = version.UploadedAt
            };
        }

        public async Task<List<DocumentVersionDto>> GetDocumentVersions(long documentId, long firmId)
        {
            var versions = await _context.DocumentVersions
                .Where(v => v.DocumentId == documentId)
                .OrderByDescending(v => v.Version)
                .Select(v => new DocumentVersionDto
                {
                    Id = v.Id,
                    Version = v.Version,
                    FileName = v.FileName,
                    FileSize = v.FileSize,
                    ChangeSummary = v.ChangeSummary,
                    UploadedAt = v.UploadedAt
                })
                .ToListAsync();

            return versions;
        }

        public async Task<DocumentShareDto> ShareDocument(long documentId, long firmId, long userId, long? sharedWithUserId, string? sharedWithEmail, string permission, int? expiresInDays)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.FirmId == firmId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            var share = new DocumentShare
            {
                DocumentId = documentId,
                SharedWithUserId = sharedWithUserId,
                SharedWithEmail = sharedWithEmail,
                Permission = permission,
                ShareToken = Guid.NewGuid().ToString(),
                ExpiresAt = expiresInDays.HasValue ? DateTime.UtcNow.AddDays(expiresInDays.Value) : null,
                SharedBy = userId,
                SharedAt = DateTime.UtcNow
            };

            _context.DocumentShares.Add(share);
            await _context.SaveChangesAsync();

            return new DocumentShareDto
            {
                Id = share.Id,
                ShareToken = share.ShareToken,
                Permission = share.Permission,
                ExpiresAt = share.ExpiresAt
            };
        }

        public async Task<bool> RevokeShare(long shareId, long firmId)
        {
            var share = await _context.DocumentShares
                .FirstOrDefaultAsync(s => s.Id == shareId);

            if (share == null)
                return false;

            _context.DocumentShares.Remove(share);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<DocumentCommentDto> AddComment(long documentId, long firmId, long userId, string comment)
        {
            var documentComment = new DocumentComment
            {
                DocumentId = documentId,
                UserId = userId,
                Comment = comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentComments.Add(documentComment);
            await _context.SaveChangesAsync();

            return new DocumentCommentDto
            {
                Id = documentComment.Id,
                Comment = documentComment.Comment,
                UserId = userId,
                CreatedAt = documentComment.CreatedAt
            };
        }

        public async Task<bool> DeleteComment(long commentId, long firmId)
        {
            var comment = await _context.DocumentComments
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
                return false;

            _context.DocumentComments.Remove(comment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<DocumentSummaryDto> GetDocumentSummary(long documentId, long firmId)
        {
            var summary = await _context.DocumentSummaries
                .FirstOrDefaultAsync(s => s.DocumentId == documentId);

            if (summary == null)
                return null;

            return new DocumentSummaryDto
            {
                Summary = summary.Summary,
                KeyPoints = summary.KeyPoints != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(summary.KeyPoints) : null,
                GeneratedAt = summary.GeneratedAt
            };
        }

        public async Task<DocumentSummaryDto> GenerateSummary(long documentId, long firmId)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.FirmId == firmId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            var fileContent = await _fileService.GetFileContent(document.FilePath);
            var summary = await _aiSummaryService.SummarizeDocument(fileContent);

            var existingSummary = await _context.DocumentSummaries
                .FirstOrDefaultAsync(s => s.DocumentId == documentId);

            if (existingSummary != null)
            {
                existingSummary.Summary = summary.Summary;
                existingSummary.KeyPoints = System.Text.Json.JsonSerializer.Serialize(summary.KeyPoints);
                existingSummary.GeneratedAt = DateTime.UtcNow;
            }
            else
            {
                var newSummary = new DocumentSummary
                {
                    DocumentId = documentId,
                    Summary = summary.Summary,
                    KeyPoints = System.Text.Json.JsonSerializer.Serialize(summary.KeyPoints),
                    GeneratedBy = "Praava AI",
                    GeneratedAt = DateTime.UtcNow
                };
                _context.DocumentSummaries.Add(newSummary);
            }

            await _context.SaveChangesAsync();

            return new DocumentSummaryDto
            {
                Summary = summary.Summary,
                KeyPoints = summary.KeyPoints,
                GeneratedAt = DateTime.UtcNow
            };
        }

        public async Task<List<DocumentTypeDto>> GetDocumentTypes(long firmId)
        {
            var types = await _context.DocumentTypes
                .Where(dt => dt.FirmId == firmId)
                .Select(dt => new DocumentTypeDto
                {
                    Id = dt.Id,
                    Name = dt.Name,
                    Category = dt.Category,
                    Description = dt.Description,
                    Icon = dt.Icon,
                    IsTemplate = dt.IsTemplate
                })
                .ToListAsync();

            return types;
        }

        public async Task<DocumentTypeDto> CreateDocumentType(long firmId, CreateDocumentTypeDto createDto)
        {
            var documentType = new DocumentType
            {
                FirmId = firmId,
                Name = createDto.Name,
                Category = createDto.Category,
                Description = createDto.Description,
                Icon = createDto.Icon,
                IsTemplate = createDto.IsTemplate,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentTypes.Add(documentType);
            await _context.SaveChangesAsync();

            return new DocumentTypeDto
            {
                Id = documentType.Id,
                Name = documentType.Name,
                Category = documentType.Category,
                Description = documentType.Description,
                Icon = documentType.Icon,
                IsTemplate = documentType.IsTemplate
            };
        }

        public async Task<List<FolderDto>> GetFolders(long firmId, long? parentFolderId)
        {
            var query = _context.Folders
                .Where(f => f.FirmId == firmId);

            if (parentFolderId.HasValue)
                query = query.Where(f => f.ParentFolderId == parentFolderId.Value);
            else
                query = query.Where(f => f.ParentFolderId == null);

            var folders = await query
                .Select(f => new FolderDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Description = f.Description,
                    ParentFolderId = f.ParentFolderId,
                    Path = f.Path,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();

            return folders;
        }

        public async Task<FolderDto> CreateFolder(long firmId, long userId, CreateFolderDto createDto)
        {
            var folder = new Folder
            {
                FirmId = firmId,
                ParentFolderId = createDto.ParentFolderId,
                Name = createDto.Name,
                Description = createDto.Description,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Folders.Add(folder);
            await _context.SaveChangesAsync();

            // Build path
            folder.Path = await BuildFolderPath(folder.Id);
            await _context.SaveChangesAsync();

            return new FolderDto
            {
                Id = folder.Id,
                Name = folder.Name,
                Description = folder.Description,
                ParentFolderId = folder.ParentFolderId,
                Path = folder.Path,
                CreatedAt = folder.CreatedAt
            };
        }

        public async Task<bool> MoveDocument(long documentId, long firmId, long? folderId)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.FirmId == firmId);

            if (document == null)
                return false;

            document.FolderId = folderId;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<TemplateDto>> GetTemplates(long firmId, string? category)
        {
            var query = _context.DocumentTemplates
                .Where(t => t.FirmId == firmId);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(t => t.DocumentType != null && t.DocumentType.Category == category);

            var templates = await query
                .Select(t => new TemplateDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description,
                    DocumentTypeId = t.DocumentTypeId,
                    DocumentTypeName = t.DocumentType != null ? t.DocumentType.Name : null,
                    PreviewImage = t.PreviewImage,
                    UsageCount = t.UsageCount,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return templates;
        }

        public async Task<TemplateDto> CreateTemplate(long firmId, long userId, CreateTemplateDto createDto)
        {
            var filePath = await _fileService.SaveFile(createDto.File, "templates");

            var template = new DocumentTemplate
            {
                FirmId = firmId,
                DocumentTypeId = createDto.DocumentTypeId,
                Name = createDto.Name,
                Description = createDto.Description,
                FilePath = filePath,
                PreviewImage = createDto.PreviewImage,
                IsPublic = createDto.IsPublic,
                UsageCount = 0,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentTemplates.Add(template);
            await _context.SaveChangesAsync();

            return new TemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                Description = template.Description,
                DocumentTypeId = template.DocumentTypeId,
                PreviewImage = template.PreviewImage,
                UsageCount = template.UsageCount,
                CreatedAt = template.CreatedAt
            };
        }

        public async Task<bool> DeleteTemplate(long templateId, long firmId)
        {
            var template = await _context.DocumentTemplates
                .FirstOrDefaultAsync(t => t.Id == templateId && t.FirmId == firmId);

            if (template == null)
                return false;

            _fileService.DeleteFile(template.FilePath);
            _context.DocumentTemplates.Remove(template);
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<string> BuildFolderPath(long folderId)
        {
            var path = new List<string>();
            var currentId = folderId;

            while (currentId > 0)
            {
                var folder = await _context.Folders.FindAsync(currentId);
                if (folder == null) break;
                path.Insert(0, folder.Name);
                currentId = folder.ParentFolderId ?? 0;
            }

            return "/" + string.Join("/", path);
        }

        private DocumentDto MapToDto(Document d)
        {
            return new DocumentDto
            {
                Id = d.Id,
                Uuid = d.Uuid,
                Title = d.Title,
                Description = d.Description,
                FileName = d.FileName,
                FileSize = d.FileSize,
                MimeType = d.MimeType,
                Extension = d.Extension,
                Version = d.Version,
                IsTemplate = d.IsTemplate,
                IsArchived = d.IsArchived,
                MatterId = d.MatterId,
                MatterTitle = d.Matter?.Title,
                ContactId = d.ContactId,
                ContactName = d.Contact != null ? $"{d.Contact.FirstName} {d.Contact.LastName}" : null,
                DocumentTypeId = d.DocumentTypeId,
                DocumentTypeName = d.DocumentType?.Name,
                FolderId = d.FolderId,
                UploadedBy = d.UploadedBy,
                UploadedAt = d.UploadedAt,
                LastAccessedAt = d.LastAccessedAt
            };
        }

        private void AddRecentActivity(long firmId, long userId, string activityType, string entityType, long entityId, string entityName, string description)
        {
            var activity = new RecentActivity
            {
                FirmId = firmId,
                UserId = userId,
                ActivityType = activityType,
                EntityType = entityType,
                EntityId = entityId,
                EntityName = entityName,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };
            _context.RecentActivities.Add(activity);
            _context.SaveChanges();
        }
    }
}