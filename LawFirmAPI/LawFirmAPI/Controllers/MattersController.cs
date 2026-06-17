using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;
using LawFirmAPI.Models.Entities;

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

        // ==================== Courts ====================

        [HttpGet("courts")]
        public async Task<IActionResult> GetCourts(
            [FromQuery] string? search,
            [FromQuery] string? state)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var courts = await _mattersService.GetCourts(firmId, search, state);
            return Ok(courts);
        }

        [HttpGet("courts/{id}")]
        public async Task<IActionResult> GetCourtById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var court = await _mattersService.GetCourtById(id, firmId);

            if (court == null)
                return NotFound(new { message = "Court not found" });

            return Ok(court);
        }

        [HttpPost("courts")]
        public async Task<IActionResult> CreateCourt([FromBody] CreateCourtDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var firmId = await _firmContextService.GetCurrentFirmId();
            var court = await _mattersService.CreateCourt(firmId, createDto);
            return CreatedAtAction(nameof(GetCourtById), new { id = court.Id }, court);
        }

        [HttpPut("courts/{id}")]
        public async Task<IActionResult> UpdateCourt(long id, [FromBody] UpdateCourtDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();

            try
            {
                var court = await _mattersService.UpdateCourt(id, firmId, updateDto);
                return Ok(court);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Court not found" });
            }
        }

        [HttpDelete("courts/{id}")]
        public async Task<IActionResult> DeleteCourt(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.DeleteCourt(id, firmId);

            if (!result)
                return NotFound(new { message = "Court not found" });

            return NoContent();
        }

        // ==================== Judicial Districts ====================

        [HttpGet("judicial-districts")]
        public async Task<IActionResult> GetJudicialDistricts(
            [FromQuery] string? search,
            [FromQuery] string? state)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var districts = await _mattersService.GetJudicialDistricts(firmId, search, state);
            return Ok(districts);
        }

        [HttpGet("judicial-districts/{id}")]
        public async Task<IActionResult> GetJudicialDistrictById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var district = await _mattersService.GetJudicialDistrictById(id, firmId);

            if (district == null)
                return NotFound(new { message = "Judicial district not found" });

            return Ok(district);
        }

        [HttpPost("judicial-districts")]
        public async Task<IActionResult> CreateJudicialDistrict([FromBody] CreateJudicialDistrictDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var firmId = await _firmContextService.GetCurrentFirmId();
            var district = await _mattersService.CreateJudicialDistrict(firmId, createDto);
            return CreatedAtAction(nameof(GetJudicialDistrictById), new { id = district.Id }, district);
        }

        [HttpPut("judicial-districts/{id}")]
        public async Task<IActionResult> UpdateJudicialDistrict(long id, [FromBody] UpdateJudicialDistrictDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();

            try
            {
                var district = await _mattersService.UpdateJudicialDistrict(id, firmId, updateDto);
                return Ok(district);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Judicial district not found" });
            }
        }

        [HttpDelete("judicial-districts/{id}")]
        public async Task<IActionResult> DeleteJudicialDistrict(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.DeleteJudicialDistrict(id, firmId);

            if (!result)
                return NotFound(new { message = "Judicial district not found" });

            return NoContent();
        }

        // ==================== Matter Types ====================

        [HttpGet("types")]
        public async Task<IActionResult> GetMatterTypes()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var types = await _mattersService.GetMatterTypes(firmId);
            return Ok(types);
        }

        [HttpGet("types/{id}")]
        public async Task<IActionResult> GetMatterTypeById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var types = await _mattersService.GetMatterTypes(firmId);
            var type = types.FirstOrDefault(t => t.Id == id);
            if (type == null)
                return NotFound(new { message = "Matter type not found" });
            return Ok(type);
        }

        [HttpPost("types")]
        public async Task<IActionResult> CreateMatterType([FromBody] CreateMatterTypeDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var type = await _mattersService.CreateMatterType(firmId, createDto);
            return Ok(new { message = "Matter type created successfully", type });
        }

        [HttpPut("types/{id}")]
        public async Task<IActionResult> UpdateMatterType(long id, [FromBody] UpdateMatterTypeDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var type = await _mattersService.UpdateMatterType(id, firmId, updateDto);
            return Ok(type);
        }

        [HttpDelete("types/{id}")]
        public async Task<IActionResult> DeleteMatterType(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.DeleteMatterType(id, firmId);
            if (!result)
                return NotFound(new { message = "Matter type not found" });
            return Ok(new { message = "Matter type deleted successfully" });
        }

        // ==================== Practice Areas ====================

        [HttpGet("practice-areas")]
        public async Task<IActionResult> GetPracticeAreas()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var areas = await _mattersService.GetPracticeAreas(firmId);
            return Ok(areas);
        }

        [HttpGet("practice-areas/{id}")]
        public async Task<IActionResult> GetPracticeAreaById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var areas = await _mattersService.GetPracticeAreas(firmId);
            var area = areas.FirstOrDefault(a => a.Id == id);
            if (area == null)
                return NotFound(new { message = "Practice area not found" });
            return Ok(area);
        }

        [HttpPost("practice-areas")]
        public async Task<IActionResult> CreatePracticeArea([FromBody] CreatePracticeAreaDto createDto)
        {
            if (createDto == null)
                return BadRequest(new { message = "Request body is empty" });

            if (string.IsNullOrWhiteSpace(createDto.Name))
                return BadRequest(new { message = "Practice area name is required" });

            try
            {
                var firmId = await _firmContextService.GetCurrentFirmId();
                var area = await _mattersService.CreatePracticeArea(firmId, createDto);
                return Ok(new { message = "Practice area created successfully", area });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("practice-areas/{id}")]
        public async Task<IActionResult> UpdatePracticeArea(long id, [FromBody] UpdatePracticeAreaDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var area = await _mattersService.UpdatePracticeArea(id, firmId, updateDto);
            return Ok(area);
        }

        [HttpDelete("practice-areas/{id}")]
        public async Task<IActionResult> DeletePracticeArea(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.DeletePracticeArea(id, firmId);
            if (!result)
                return NotFound(new { message = "Practice area not found" });
            return Ok(new { message = "Practice area deleted successfully" });
        }

        // ==================== Matter Filters ====================

        [HttpGet("open")]
        public async Task<IActionResult> GetOpenMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetOpenMatters(firmId);
            return Ok(matters);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetPendingMatters(firmId);
            return Ok(matters);
        }

        [HttpGet("closed")]
        public async Task<IActionResult> GetClosedMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetClosedMatters(firmId);
            return Ok(matters);
        }

        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetMattersByStatus(string status)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetMattersByStatus(firmId, status);
            return Ok(matters);
        }

        [HttpGet("priority/{priority}")]
        public async Task<IActionResult> GetMattersByPriority(string priority)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetMattersByPriority(firmId, priority);
            return Ok(matters);
        }

        [HttpGet("litigation")]
        public async Task<IActionResult> GetLitigationMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetLitigationMatters(firmId);
            return Ok(matters);
        }

        [HttpGet("non-litigation")]
        public async Task<IActionResult> GetNonLitigationMatters()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetNonLitigationMatters(firmId);
            return Ok(matters);
        }

        [HttpGet("assigned-to/{userId}")]
        public async Task<IActionResult> GetMattersAssignedToUser(long userId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetMattersAssignedToUser(firmId, userId);
            return Ok(matters);
        }

        [HttpGet("by-client/{contactId}")]
        public async Task<IActionResult> GetMattersByClient(long contactId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetMattersByClient(firmId, contactId);
            return Ok(matters);
        }

        // ==================== Statistics ====================

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

        // ==================== Matter Parties ====================

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

        [HttpPut("parties/{partyId}")]
        public async Task<IActionResult> UpdateMatterParty(long partyId, [FromBody] UpdateMatterPartyDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var party = await _mattersService.UpdateMatterParty(partyId, firmId, updateDto);
            return Ok(party);
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

        // ==================== Matter Notes ====================

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

        [HttpPut("notes/{noteId}")]
        public async Task<IActionResult> UpdateMatterNote(long noteId, [FromBody] UpdateMatterNoteDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var note = await _mattersService.UpdateMatterNote(noteId, firmId, updateDto);
            return Ok(note);
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

        // ==================== Timeline ====================

        [HttpGet("{id}/timeline")]
        public async Task<IActionResult> GetMatterTimeline(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var timeline = await _mattersService.GetMatterTimeline(id, firmId);
            return Ok(timeline);
        }

        // ==================== Time Entries ====================

        [HttpGet("{id}/time-entries")]
        public async Task<IActionResult> GetTimeEntries(
            long id,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var entries = await _mattersService.GetTimeEntries(id, firmId, startDate, endDate);
            return Ok(entries);
        }

        [HttpPost("{id}/time-entries")]
        public async Task<IActionResult> AddTimeEntry(long id, [FromBody] AddTimeEntryDto entryDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var entry = await _mattersService.AddTimeEntry(id, firmId, userId, entryDto);
            return Ok(new { message = "Time entry added successfully", entry });
        }

        [HttpPut("time-entries/{entryId}")]
        public async Task<IActionResult> UpdateTimeEntry(long entryId, [FromBody] UpdateTimeEntryDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var entry = await _mattersService.UpdateTimeEntry(entryId, firmId, updateDto);
            return Ok(entry);
        }

        [HttpDelete("time-entries/{entryId}")]
        public async Task<IActionResult> DeleteTimeEntry(long entryId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.DeleteTimeEntry(entryId, firmId);
            if (!result)
                return NotFound(new { message = "Time entry not found" });
            return Ok(new { message = "Time entry deleted successfully" });
        }

        // ==================== Deadlines ====================

        [HttpGet("{id}/deadlines")]
        public async Task<IActionResult> GetMatterDeadlines(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var deadlines = await _mattersService.GetMatterDeadlines(id, firmId);
            return Ok(deadlines);
        }

        [HttpPost("{id}/deadlines")]
        public async Task<IActionResult> AddDeadline(long id, [FromBody] AddDeadlineDto deadlineDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var deadline = await _mattersService.AddDeadline(id, firmId, userId, deadlineDto);
            return Ok(new { message = "Deadline added successfully", deadline });
        }

        [HttpPatch("deadlines/{deadlineId}/met")]
        public async Task<IActionResult> MarkDeadlineAsMet(long deadlineId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _mattersService.MarkDeadlineAsMet(deadlineId, firmId);
            if (!result)
                return NotFound(new { message = "Deadline not found" });
            return Ok(new { message = "Deadline marked as met" });
        }

        // ==================== Bulk Operations ====================

        [HttpPost("bulk/status")]
        public async Task<IActionResult> BulkUpdateStatus([FromBody] BulkUpdateDto bulkDto)
        {
            if (bulkDto.MatterIds == null || !bulkDto.MatterIds.Any())
                return BadRequest(new { message = "No matters selected" });

            if (string.IsNullOrEmpty(bulkDto.Status))
                return BadRequest(new { message = "Status is required" });

            var firmId = await _firmContextService.GetCurrentFirmId();
            var count = await _mattersService.BulkUpdateStatus(firmId, bulkDto.MatterIds, bulkDto.Status);
            return Ok(new { message = $"{count} matters updated", updatedCount = count });
        }

        [HttpPost("bulk/assign")]
        public async Task<IActionResult> BulkAssignAdvocate([FromBody] BulkUpdateDto bulkDto)
        {
            if (bulkDto.MatterIds == null || !bulkDto.MatterIds.Any())
                return BadRequest(new { message = "No matters selected" });

            if (!bulkDto.AdvocateId.HasValue)
                return BadRequest(new { message = "Advocate is required" });

            var firmId = await _firmContextService.GetCurrentFirmId();
            var count = await _mattersService.BulkAssignAdvocate(firmId, bulkDto.MatterIds, bulkDto.AdvocateId.Value);
            return Ok(new { message = $"{count} matters assigned", updatedCount = count });
        }

        [HttpPost("bulk/delete")]
        public async Task<IActionResult> BulkDeleteMatters([FromBody] BulkUpdateDto bulkDto)
        {
            if (bulkDto.MatterIds == null || !bulkDto.MatterIds.Any())
                return BadRequest(new { message = "No matters selected" });

            var firmId = await _firmContextService.GetCurrentFirmId();
            var count = await _mattersService.BulkDeleteMatters(firmId, bulkDto.MatterIds);
            return Ok(new { message = $"{count} matters deleted", deletedCount = count });
        }

        // ==================== Search ====================

        [HttpPost("search")]
        public async Task<IActionResult> AdvancedSearch([FromBody] AdvancedSearchDto searchParams)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.AdvancedSearch(firmId, searchParams);
            return Ok(matters);
        }

        // ==================== Export/Import ====================

        [HttpPost("export")]
        public async Task<IActionResult> ExportMatters(
            [FromBody] ExportFiltersDto filters,
            [FromQuery] string format = "csv")
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var data = await _mattersService.ExportMatters(firmId, format, filters);

            var contentType = format.ToLower() == "csv"
                ? "text/csv"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            var fileName = $"matters_export_{DateTime.Now:yyyyMMdd}.{format.ToLower()}";
            return File(data, contentType, fileName);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportMatters(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var result = await _mattersService.ImportMatters(firmId, userId, file);

            return Ok(new
            {
                message = $"Imported {result.Imported} matters, {result.Failed} failed",
                result
            });
        }

        // ==================== Activity Logs ====================

        [HttpGet("{id}/activity-logs")]
        public async Task<IActionResult> GetMatterActivityLogs(
            long id,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int limit = 50)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var logs = await _mattersService.GetMatterActivityLogs(id, firmId, startDate, endDate, limit);
            return Ok(logs);
        }

        // ==================== Basic Matter Operations (must be LAST) ====================

        [HttpGet]
        public async Task<IActionResult> GetAllMatters(
            [FromQuery] string? status,
            [FromQuery] string? priority,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _mattersService.GetAllMatters(firmId, status, priority, search, page, pageSize);
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
    }
}