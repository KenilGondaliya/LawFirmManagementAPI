// Controllers/DocumentsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/documents")]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentsService _documentsService;
        private readonly IFirmContextService _firmContextService;

        public DocumentsController(IDocumentsService documentsService, IFirmContextService firmContextService)
        {
            _documentsService = documentsService;
            _firmContextService = firmContextService;
        }

        // Basic Document Operations
        [HttpGet]
        public async Task<IActionResult> GetAllDocuments(
            [FromQuery] long? matterId,
            [FromQuery] long? folderId,
            [FromQuery] string? search)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var documents = await _documentsService.GetAllDocuments(firmId, matterId, folderId, search);
            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocumentById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var document = await _documentsService.GetDocumentById(id, firmId);
            if (document == null)
                return NotFound(new { message = "Document not found" });
            return Ok(document);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentDto uploadDto)
        {
            if (uploadDto.File == null || uploadDto.File.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var document = await _documentsService.UploadDocument(firmId, userId, uploadDto);
            return Ok(new { message = "Document uploaded successfully", documentId = document.Id, document });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(long id, [FromBody] UpdateDocumentDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var document = await _documentsService.UpdateDocument(id, firmId, updateDto);
            return Ok(new { message = "Document updated successfully", document });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _documentsService.DeleteDocument(id, firmId);
            if (!result)
                return NotFound(new { message = "Document not found" });
            return Ok(new { message = "Document deleted successfully" });
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var fileBytes = await _documentsService.DownloadDocument(id, firmId);
            var document = await _documentsService.GetDocumentById(id, firmId);
            return File(fileBytes, document?.MimeType ?? "application/octet-stream", document?.FileName);
        }

        // Document Versions
        [HttpPost("{id}/versions")]
        public async Task<IActionResult> CreateVersion(long id, IFormFile file, [FromQuery] string? changeSummary)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var version = await _documentsService.CreateVersion(id, firmId, userId, file, changeSummary);
            return Ok(new { message = "New version created successfully", version });
        }

        [HttpGet("{id}/versions")]
        public async Task<IActionResult> GetDocumentVersions(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var versions = await _documentsService.GetDocumentVersions(id, firmId);
            return Ok(versions);
        }

        // Document Sharing
        [HttpPost("{id}/share")]
        public async Task<IActionResult> ShareDocument(
            long id,
            [FromQuery] long? userId,
            [FromQuery] string? email,
            [FromQuery] string permission = "VIEW",
            [FromQuery] int? expiresInDays = null)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var currentUserId = await _firmContextService.GetCurrentUserId();
            var share = await _documentsService.ShareDocument(id, firmId, currentUserId, userId, email, permission, expiresInDays);
            return Ok(new { message = "Document shared successfully", shareToken = share.ShareToken });
        }

        [HttpDelete("shares/{shareId}")]
        public async Task<IActionResult> RevokeShare(long shareId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _documentsService.RevokeShare(shareId, firmId);
            if (!result)
                return NotFound(new { message = "Share not found" });
            return Ok(new { message = "Share revoked successfully" });
        }

        // Document Comments
        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetDocumentComments(long id)
        {
            var document = await _documentsService.GetDocumentById(id, await _firmContextService.GetCurrentFirmId());
            if (document == null)
                return NotFound(new { message = "Document not found" });
            // Comments would be loaded separately
            return Ok(new List<object>());
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(long id, [FromBody] string comment)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var documentComment = await _documentsService.AddComment(id, firmId, userId, comment);
            return Ok(new { message = "Comment added successfully", comment = documentComment });
        }

        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(long commentId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _documentsService.DeleteComment(commentId, firmId);
            if (!result)
                return NotFound(new { message = "Comment not found" });
            return Ok(new { message = "Comment deleted successfully" });
        }

        // AI Features
        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetDocumentSummary(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var summary = await _documentsService.GetDocumentSummary(id, firmId);
            if (summary == null)
                return Ok(new { message = "No summary available yet. Use the summarize endpoint to generate one." });
            return Ok(summary);
        }

        [HttpPost("{id}/summarize")]
        public async Task<IActionResult> GenerateSummary(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var summary = await _documentsService.GenerateSummary(id, firmId);
            return Ok(new { message = "Summary generated successfully", summary });
        }

        // Document Types
        [HttpGet("types")]
        public async Task<IActionResult> GetDocumentTypes()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var types = await _documentsService.GetDocumentTypes(firmId);
            return Ok(types);
        }

        [HttpPost("types")]
        public async Task<IActionResult> CreateDocumentType([FromBody] CreateDocumentTypeDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var type = await _documentsService.CreateDocumentType(firmId, createDto);
            return Ok(new { message = "Document type created successfully", type });
        }

        // Folders
        [HttpGet("folders")]
        public async Task<IActionResult> GetFolders([FromQuery] long? parentFolderId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var folders = await _documentsService.GetFolders(firmId, parentFolderId);
            return Ok(folders);
        }

        [HttpPost("folders")]
        public async Task<IActionResult> CreateFolder([FromBody] CreateFolderDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var folder = await _documentsService.CreateFolder(firmId, userId, createDto);
            return Ok(new { message = "Folder created successfully", folder });
        }

        [HttpPost("{id}/move")]
        public async Task<IActionResult> MoveDocument(long id, [FromQuery] long? folderId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _documentsService.MoveDocument(id, firmId, folderId);
            if (!result)
                return NotFound(new { message = "Document not found" });
            return Ok(new { message = "Document moved successfully" });
        }

        // Templates
        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates([FromQuery] string? category)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var templates = await _documentsService.GetTemplates(firmId, category);
            return Ok(templates);
        }

        [HttpPost("templates")]
        public async Task<IActionResult> CreateTemplate([FromForm] CreateTemplateDto createDto)
        {
            if (createDto.File == null || createDto.File.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var template = await _documentsService.CreateTemplate(firmId, userId, createDto);
            return Ok(new { message = "Template created successfully", template });
        }

        [HttpDelete("templates/{templateId}")]
        public async Task<IActionResult> DeleteTemplate(long templateId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _documentsService.DeleteTemplate(templateId, firmId);
            if (!result)
                return NotFound(new { message = "Template not found" });
            return Ok(new { message = "Template deleted successfully" });
        }
    }
}