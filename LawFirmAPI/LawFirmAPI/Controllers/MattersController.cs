// Controllers/MattersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/matters")]
    [Authorize]
    public class MattersController : ControllerBase
    {
        private readonly IMattersService _mattersService;
        private readonly IFirmContextService _firmContextService;

        public MattersController(IMattersService mattersService, IFirmContextService firmContextService)
        {
            _mattersService = mattersService;
            _firmContextService = firmContextService;
        }

        // Basic Matter Operations
        [HttpGet]
        public async Task<IActionResult> GetAllMatters([FromQuery] string? status, [FromQuery] string? priority, [FromQuery] string? search)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetAllMatters(firmId, status, priority, search);
            return Ok(matters);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMatterById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matter = await _mattersService.GetMatterById(id, firmId);
            if (matter == null)
                return NotFound(new { message = "Matter not found" });
            return Ok(matter);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMatter([FromBody] CreateMatterDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var matter = await _mattersService.CreateMatter(firmId, userId, createDto);
            return Ok(new { message = "Matter created successfully", matterId = matter.Id, matter });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMatter(long id, [FromBody] UpdateMatterDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matter = await _mattersService.UpdateMatter(id, firmId, updateDto);
            return Ok(new { message = "Matter updated successfully", matter });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMatter(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.DeleteMatter(id, firmId);
            if (!result)
                return NotFound(new { message = "Matter not found" });
            return Ok(new { message = "Matter deleted successfully" });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateMatterStatus(long id, [FromQuery] string status)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matter = await _mattersService.UpdateMatterStatus(id, firmId, status);
            return Ok(new { message = "Matter status updated", matter });
        }

        // Matter Types
        [HttpGet("types")]
        public async Task<IActionResult> GetMatterTypes()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var types = await _mattersService.GetMatterTypes(firmId);
            return Ok(types);
        }

        [HttpPost("types")]
        public async Task<IActionResult> CreateMatterType([FromBody] CreateMatterTypeDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var type = await _mattersService.CreateMatterType(firmId, createDto);
            return Ok(new { message = "Matter type created successfully", type });
        }

        [HttpGet("litigation")]
        public async Task<IActionResult> GetLitigationMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetAllMatters(firmId, null, null, null);
            // Filter by matter type category = LITIGATION
            return Ok(matters);
        }

        [HttpGet("non-litigation")]
        public async Task<IActionResult> GetNonLitigationMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetAllMatters(firmId, null, null, null);
            // Filter by matter type category = NON_LITIGATION
            return Ok(matters);
        }

        // Matter Parties
        [HttpGet("{id}/parties")]
        public async Task<IActionResult> GetMatterParties(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var parties = await _mattersService.GetMatterParties(id, firmId);
            return Ok(parties);
        }

        [HttpPost("{id}/parties")]
        public async Task<IActionResult> AddMatterParty(long id, [FromBody] AddMatterPartyDto partyDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var party = await _mattersService.AddMatterParty(id, firmId, partyDto);
            return Ok(new { message = "Party added successfully", party });
        }

        [HttpDelete("{id}/parties/{partyId}")]
        public async Task<IActionResult> RemoveMatterParty(long id, long partyId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.RemoveMatterParty(id, firmId, partyId);
            if (!result)
                return NotFound(new { message = "Party not found" });
            return Ok(new { message = "Party removed successfully" });
        }

        // Matter Notes
        [HttpGet("{id}/notes")]
        public async Task<IActionResult> GetMatterNotes(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var notes = await _mattersService.GetMatterNotes(id, firmId, userId);
            return Ok(notes);
        }

        [HttpPost("{id}/notes")]
        public async Task<IActionResult> AddMatterNote(long id, [FromBody] AddMatterNoteDto noteDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var note = await _mattersService.AddMatterNote(id, firmId, userId, noteDto);
            return Ok(new { message = "Note added successfully", note });
        }

        [HttpDelete("notes/{noteId}")]
        public async Task<IActionResult> DeleteMatterNote(long noteId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.DeleteMatterNote(noteId, firmId);
            if (!result)
                return NotFound(new { message = "Note not found" });
            return Ok(new { message = "Note deleted successfully" });
        }

        // Practice Areas
        [HttpGet("practice-areas")]
        public async Task<IActionResult> GetPracticeAreas()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var areas = await _mattersService.GetPracticeAreas(firmId);
            return Ok(areas);
        }

        [HttpPost("practice-areas")]
        public async Task<IActionResult> CreatePracticeArea([FromBody] CreatePracticeAreaDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var area = await _mattersService.CreatePracticeArea(firmId, createDto);
            return Ok(new { message = "Practice area created successfully", area });
        }

        // Filters
        [HttpGet("open")]
        public async Task<IActionResult> GetOpenMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetAllMatters(firmId, "OPEN", null, null);
            return Ok(matters);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetAllMatters(firmId, "PENDING", null, null);
            return Ok(matters);
        }

        [HttpGet("closed")]
        public async Task<IActionResult> GetClosedMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetAllMatters(firmId, "CLOSED", null, null);
            return Ok(matters);
        }

        // Statistics
        [HttpGet("stats")]
        public async Task<IActionResult> GetMatterStats()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var stats = await _mattersService.GetMatterStats(firmId);
            return Ok(stats);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var stats = await _mattersService.GetMatterStats(firmId);
            return Ok(stats);
        }
    }
}