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
    public interface IMattersService
    {
        // Basic CRUD
        Task<List<MatterDto>> GetAllMatters(long firmId, string? status, string? priority, string? search, int page, int pageSize);
        Task<MatterDto?> GetMatterById(long id, long firmId);
        Task<MatterDto> CreateMatter(long firmId, long userId, CreateMatterDto createDto);
        Task<MatterDto> UpdateMatter(long id, long firmId, UpdateMatterDto updateDto);
        Task<bool> DeleteMatter(long id, long firmId);
        Task<MatterDto> UpdateMatterStatus(long id, long firmId, string status);

        // Matter Types
        Task<List<MatterTypeDto>> GetMatterTypes(long firmId);
        Task<MatterTypeDto> CreateMatterType(long firmId, CreateMatterTypeDto createDto);
        Task<MatterTypeDto> UpdateMatterType(long id, long firmId, UpdateMatterTypeDto updateDto);
        Task<bool> DeleteMatterType(long id, long firmId);

        // Matter Parties
        Task<List<MatterPartyDto>> GetMatterParties(long matterId, long firmId);
        Task<MatterPartyDto> AddMatterParty(long matterId, long firmId, AddMatterPartyDto partyDto);
        Task<MatterPartyDto> UpdateMatterParty(long partyId, long firmId, UpdateMatterPartyDto updateDto);
        Task<bool> RemoveMatterParty(long matterId, long firmId, long partyId);

        // Matter Notes
        Task<List<MatterNoteDto>> GetMatterNotes(long matterId, long firmId, long userId);
        Task<MatterNoteDto> AddMatterNote(long matterId, long firmId, long userId, AddMatterNoteDto noteDto);
        Task<MatterNoteDto> UpdateMatterNote(long noteId, long firmId, UpdateMatterNoteDto updateDto);
        Task<bool> DeleteMatterNote(long noteId, long firmId);

        // Practice Areas
        Task<List<PracticeAreaDto>> GetPracticeAreas(long firmId);
        Task<PracticeAreaDto> CreatePracticeArea(long firmId, CreatePracticeAreaDto createDto);
        Task<PracticeAreaDto> UpdatePracticeArea(long id, long firmId, UpdatePracticeAreaDto updateDto);
        Task<bool> DeletePracticeArea(long id, long firmId);

        // Courts
        Task<List<CourtDto>> GetCourts(long firmId, string? search, string? state);
        Task<CourtDto> CreateCourt(long firmId, CreateCourtDto createDto);
        Task<CourtDto> UpdateCourt(long id, long firmId, UpdateCourtDto updateDto);
        Task<bool> DeleteCourt(long id, long firmId);

        // ADD THIS: GetCourtById method
        Task<CourtDto?> GetCourtById(long id, long firmId);

        // Judicial Districts
        Task<List<JudicialDistrictDto>> GetJudicialDistricts(long firmId, string? search, string? state);
        Task<JudicialDistrictDto> CreateJudicialDistrict(long firmId, CreateJudicialDistrictDto createDto);
        Task<JudicialDistrictDto> UpdateJudicialDistrict(long id, long firmId, UpdateJudicialDistrictDto updateDto);
        Task<bool> DeleteJudicialDistrict(long id, long firmId);

        // ADD THIS: GetJudicialDistrictById method
        Task<JudicialDistrictDto?> GetJudicialDistrictById(long id, long firmId);

        // Matter Filters
        Task<List<MatterDto>> GetMattersByStatus(long firmId, string status);
        Task<List<MatterDto>> GetOpenMatters(long firmId);
        Task<List<MatterDto>> GetPendingMatters(long firmId);
        Task<List<MatterDto>> GetClosedMatters(long firmId);
        Task<List<MatterDto>> GetMattersByPriority(long firmId, string priority);
        Task<List<MatterDto>> GetLitigationMatters(long firmId);
        Task<List<MatterDto>> GetNonLitigationMatters(long firmId);
        Task<List<MatterDto>> GetMattersAssignedToUser(long firmId, long userId);
        Task<List<MatterDto>> GetMattersByClient(long firmId, long contactId);

        // Statistics
        Task<DashboardMatterStatsDto> GetMatterStats(long firmId);
        Task<List<MatterTimelineDto>> GetMatterTimeline(long matterId, long firmId);

        // Related Data
        Task<List<MatterDocumentDto>> GetMatterDocuments(long matterId, long firmId);
        Task<List<MatterTaskDto>> GetMatterTasks(long matterId, long firmId);
        Task<List<MatterEventDto>> GetMatterEvents(long matterId, long firmId);
        Task<List<MatterBillDto>> GetMatterBills(long matterId, long firmId);

        // Time Entries
        Task<List<TimeEntryDto>> GetTimeEntries(long matterId, long firmId, DateTime? startDate, DateTime? endDate);
        Task<TimeEntryDto> AddTimeEntry(long matterId, long firmId, long userId, AddTimeEntryDto entryDto);
        Task<TimeEntryDto> UpdateTimeEntry(long entryId, long firmId, UpdateTimeEntryDto updateDto);
        Task<bool> DeleteTimeEntry(long entryId, long firmId);

        // Deadlines
        Task<List<MatterDeadlineDto>> GetMatterDeadlines(long matterId, long firmId);
        Task<MatterDeadlineDto> AddDeadline(long matterId, long firmId, long userId, AddDeadlineDto deadlineDto);
        Task<bool> MarkDeadlineAsMet(long deadlineId, long firmId);

        // Bulk Operations
        Task<int> BulkUpdateStatus(long firmId, List<long> matterIds, string status);
        Task<int> BulkAssignAdvocate(long firmId, List<long> matterIds, long advocateId);
        Task<int> BulkDeleteMatters(long firmId, List<long> matterIds);

        // Search
        Task<List<MatterDto>> AdvancedSearch(long firmId, AdvancedSearchDto searchParams);

        // Export/Import
        Task<byte[]> ExportMatters(long firmId, string format, ExportFiltersDto filters);
        Task<ImportResultDto> ImportMatters(long firmId, long userId, IFormFile file);

        // Activity Logs
        Task<List<ActivityLogDto>> GetMatterActivityLogs(long matterId, long firmId, DateTime? startDate, DateTime? endDate, int limit);
    }
    public class MattersService : IMattersService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;

        public MattersService(ApplicationDbContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        // ==================== Basic CRUD ====================

        public async Task<List<MatterDto>> GetAllMatters(long firmId, string? status, string? priority, string? search, int page, int pageSize)
        {
            var query = _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.OriginatingAdvocate)
                .Include(m => m.ResponsibleAdvocate)
                .Include(m => m.PracticeArea)
                .Include(m => m.Court)
                .Include(m => m.JudicialDistrict)
                .Where(m => m.FirmId == firmId && m.DeletedAt == null);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(m => m.Status == status);

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(m => m.Priority == priority);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(m =>
                    m.Title.Contains(search) ||
                    m.MatterNumber.Contains(search) ||
                    (m.Description != null && m.Description.Contains(search)) ||
                    (m.ClientReference != null && m.ClientReference.Contains(search)));
            }

            var matters = await query
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return matters.Select(m => MapToDto(m)).ToList();
        }

        public async Task<MatterDto?> GetMatterById(long id, long firmId)
        {
            var matter = await _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.OriginatingAdvocate)
                .Include(m => m.ResponsibleAdvocate)
                .Include(m => m.PracticeArea)
                .Include(m => m.Court)
                .Include(m => m.JudicialDistrict)
                .Include(m => m.MatterParties)
                    .ThenInclude(mp => mp.Contact)
                .Include(m => m.MatterNotes)
                    .ThenInclude(mn => mn.User)
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId && m.DeletedAt == null);

            return matter != null ? MapToDto(matter) : null;
        }

        public async Task<MatterDto> CreateMatter(long firmId, long userId, CreateMatterDto createDto)
        {
            var firmSetting = await _context.FirmSettings.FirstOrDefaultAsync(fs => fs.FirmId == firmId);
            var prefix = firmSetting?.MatterPrefix ?? "MAT";
            var count = await _context.Matters.CountAsync(m => m.FirmId == firmId) + 1;
            var matterNumber = $"{prefix}-{DateTime.Now:yyyy}-{count:D4}";

            var matter = new Matter
            {
                FirmId = firmId,
                MatterNumber = matterNumber,
                MatterTypeId = createDto.MatterTypeId,
                Title = createDto.Title,
                Description = createDto.Description,
                Status = createDto.Status ?? "OPEN",
                Priority = createDto.Priority ?? "MEDIUM",
                OpenDate = createDto.OpenDate,
                PendingDate = createDto.PendingDate,
                StatuteOfLimitationsDate = createDto.StatuteOfLimitationsDate,
                EstimatedValue = createDto.EstimatedValue,
                BillingMethod = createDto.BillingMethod,
                HourlyRate = createDto.HourlyRate,
                FixedFee = createDto.FixedFee,
                OriginatingAdvocateId = createDto.OriginatingAdvocateId,
                ResponsibleAdvocateId = createDto.ResponsibleAdvocateId,
                PracticeAreaId = createDto.PracticeAreaId,
                CourtId = createDto.CourtId.HasValue && createDto.CourtId.Value > 0 ? createDto.CourtId : null,
                JudicialDistrictId = createDto.JudicialDistrictId.HasValue && createDto.JudicialDistrictId.Value > 0 ? createDto.JudicialDistrictId : null,
                ClientReference = createDto.ClientReference,
                IsConfidential = createDto.IsConfidential,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Matters.Add(matter);
            await _context.SaveChangesAsync();

            if (createDto.Parties != null)
            {
                foreach (var partyDto in createDto.Parties)
                {
                    var party = new MatterParty
                    {
                        MatterId = matter.Id,
                        ContactId = partyDto.ContactId,
                        PartyType = partyDto.PartyType,
                        RoleDescription = partyDto.RoleDescription,
                        IsPrimary = partyDto.IsPrimary,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.MatterParties.Add(party);
                }
                await _context.SaveChangesAsync();
            }

            AddRecentActivity(firmId, userId, "CREATE", "Matter", matter.Id, matter.Title, $"Created matter: {matter.Title}");

            var createdMatter = await _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.OriginatingAdvocate)
                .Include(m => m.ResponsibleAdvocate)
                .Include(m => m.PracticeArea)
                .Include(m => m.Court)
                .Include(m => m.JudicialDistrict)
                .Include(m => m.MatterParties)
                    .ThenInclude(mp => mp.Contact)
                .Include(m => m.MatterNotes)
                    .ThenInclude(mn => mn.User)
                .FirstOrDefaultAsync(m => m.Id == matter.Id);

            return MapToDto(createdMatter!);
        }

        public async Task<MatterDto> UpdateMatter(long id, long firmId, UpdateMatterDto updateDto)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId && m.DeletedAt == null);

            if (matter == null)
                throw new KeyNotFoundException("Matter not found");

            if (updateDto.Title != null)
                matter.Title = updateDto.Title;
            if (updateDto.Description != null)
                matter.Description = updateDto.Description;
            if (updateDto.Priority != null)
                matter.Priority = updateDto.Priority;
            if (updateDto.EstimatedValue.HasValue)
                matter.EstimatedValue = updateDto.EstimatedValue;
            if (updateDto.BillingMethod != null)
                matter.BillingMethod = updateDto.BillingMethod;
            if (updateDto.HourlyRate.HasValue)
                matter.HourlyRate = updateDto.HourlyRate;
            if (updateDto.FixedFee.HasValue)
                matter.FixedFee = updateDto.FixedFee;
            if (updateDto.ResponsibleAdvocateId.HasValue)
                matter.ResponsibleAdvocateId = updateDto.ResponsibleAdvocateId;
            if (updateDto.PracticeAreaId.HasValue)
                matter.PracticeAreaId = updateDto.PracticeAreaId;
            if (updateDto.CourtId.HasValue && updateDto.CourtId.Value > 0)
                matter.CourtId = updateDto.CourtId;
            else if (updateDto.CourtId.HasValue && updateDto.CourtId.Value == 0)
                matter.CourtId = null;
            if (updateDto.JudicialDistrictId.HasValue && updateDto.JudicialDistrictId.Value > 0)
                matter.JudicialDistrictId = updateDto.JudicialDistrictId;
            else if (updateDto.JudicialDistrictId.HasValue && updateDto.JudicialDistrictId.Value == 0)
                matter.JudicialDistrictId = null;
            if (updateDto.ClientReference != null)
                matter.ClientReference = updateDto.ClientReference;
            if (updateDto.ClosedDate.HasValue)
                matter.ClosedDate = updateDto.ClosedDate;

            matter.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, matter.CreatedBy, "UPDATE", "Matter", matter.Id, matter.Title, $"Updated matter: {matter.Title}");

            var updatedMatter = await _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.OriginatingAdvocate)
                .Include(m => m.ResponsibleAdvocate)
                .Include(m => m.PracticeArea)
                .Include(m => m.Court)
                .Include(m => m.JudicialDistrict)
                .Include(m => m.MatterParties)
                    .ThenInclude(mp => mp.Contact)
                .Include(m => m.MatterNotes)
                    .ThenInclude(mn => mn.User)
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId);

            return MapToDto(updatedMatter!);
        }

        public async Task<bool> DeleteMatter(long id, long firmId)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId && m.DeletedAt == null);

            if (matter == null)
                return false;

            matter.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, matter.CreatedBy, "DELETE", "Matter", matter.Id, matter.Title, $"Deleted matter: {matter.Title}");

            return true;
        }

        public async Task<MatterDto> UpdateMatterStatus(long id, long firmId, string status)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId && m.DeletedAt == null);

            if (matter == null)
                throw new KeyNotFoundException("Matter not found");

            var oldStatus = matter.Status;
            matter.Status = status;

            if (status == "CLOSED" && !matter.ClosedDate.HasValue)
                matter.ClosedDate = DateTime.UtcNow;
            else if (status == "PENDING" && !matter.PendingDate.HasValue)
                matter.PendingDate = DateTime.UtcNow;

            matter.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, matter.CreatedBy, "STATUS_CHANGE", "Matter", matter.Id, matter.Title, $"Changed status from {oldStatus} to {status}");

            var updatedMatter = await _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.OriginatingAdvocate)
                .Include(m => m.ResponsibleAdvocate)
                .Include(m => m.PracticeArea)
                .Include(m => m.Court)
                .Include(m => m.JudicialDistrict)
                .Include(m => m.MatterParties)
                    .ThenInclude(mp => mp.Contact)
                .Include(m => m.MatterNotes)
                    .ThenInclude(mn => mn.User)
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId);

            return MapToDto(updatedMatter!);
        }

        // ==================== Matter Types ====================

        public async Task<List<MatterTypeDto>> GetMatterTypes(long firmId)
        {
            var types = await _context.MatterTypes
                .Where(mt => mt.FirmId == firmId && mt.IsActive)
                .ToListAsync();

            return types.Select(mt => new MatterTypeDto
            {
                Id = mt.Id,
                Name = mt.Name,
                Category = mt.Category,
                Description = mt.Description,
                IsActive = mt.IsActive
            }).ToList();
        }

        public async Task<MatterTypeDto> CreateMatterType(long firmId, CreateMatterTypeDto createDto)
        {
            var matterType = new MatterType
            {
                FirmId = firmId,
                Name = createDto.Name,
                Category = createDto.Category,
                Description = createDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.MatterTypes.Add(matterType);
            await _context.SaveChangesAsync();

            return new MatterTypeDto
            {
                Id = matterType.Id,
                Name = matterType.Name,
                Category = matterType.Category,
                Description = matterType.Description,
                IsActive = matterType.IsActive
            };
        }

        public async Task<MatterTypeDto> UpdateMatterType(long id, long firmId, UpdateMatterTypeDto updateDto)
        {
            var matterType = await _context.MatterTypes
                .FirstOrDefaultAsync(mt => mt.Id == id && mt.FirmId == firmId);

            if (matterType == null)
                throw new KeyNotFoundException("Matter type not found");

            if (updateDto.Name != null)
                matterType.Name = updateDto.Name;
            if (updateDto.Description != null)
                matterType.Description = updateDto.Description;
            if (updateDto.IsActive.HasValue)
                matterType.IsActive = updateDto.IsActive.Value;

            await _context.SaveChangesAsync();

            return new MatterTypeDto
            {
                Id = matterType.Id,
                Name = matterType.Name,
                Category = matterType.Category,
                Description = matterType.Description,
                IsActive = matterType.IsActive
            };
        }

        public async Task<bool> DeleteMatterType(long id, long firmId)
        {
            var matterType = await _context.MatterTypes
                .FirstOrDefaultAsync(mt => mt.Id == id && mt.FirmId == firmId);

            if (matterType == null)
                return false;

            matterType.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== Matter Parties ====================

        public async Task<List<MatterPartyDto>> GetMatterParties(long matterId, long firmId)
        {
            var parties = await _context.MatterParties
                .Include(mp => mp.Contact)
                .Where(mp => mp.MatterId == matterId)
                .ToListAsync();

            return parties.Select(mp => new MatterPartyDto
            {
                Id = mp.Id,
                ContactId = mp.ContactId,
                ContactName = mp.Contact != null ? $"{mp.Contact.FirstName} {mp.Contact.LastName}" : null,
                PartyType = mp.PartyType,
                RoleDescription = mp.RoleDescription,
                IsPrimary = mp.IsPrimary
            }).ToList();
        }

        public async Task<MatterPartyDto> AddMatterParty(long matterId, long firmId, AddMatterPartyDto partyDto)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == matterId && m.FirmId == firmId);

            if (matter == null)
                throw new KeyNotFoundException("Matter not found");

            var party = new MatterParty
            {
                MatterId = matterId,
                ContactId = partyDto.ContactId,
                PartyType = partyDto.PartyType,
                RoleDescription = partyDto.RoleDescription,
                IsPrimary = partyDto.IsPrimary,
                CreatedAt = DateTime.UtcNow
            };

            _context.MatterParties.Add(party);
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, matter.CreatedBy, "ADD_PARTY", "Matter", matter.Id, matter.Title, $"Added {partyDto.PartyType} to matter");

            return new MatterPartyDto
            {
                Id = party.Id,
                ContactId = party.ContactId,
                PartyType = party.PartyType,
                RoleDescription = party.RoleDescription,
                IsPrimary = party.IsPrimary
            };
        }

        public async Task<MatterPartyDto> UpdateMatterParty(long partyId, long firmId, UpdateMatterPartyDto updateDto)
        {
            var party = await _context.MatterParties
                .FirstOrDefaultAsync(mp => mp.Id == partyId);

            if (party == null)
                throw new KeyNotFoundException("Party not found");

            if (updateDto.PartyType != null)
                party.PartyType = updateDto.PartyType;
            if (updateDto.RoleDescription != null)
                party.RoleDescription = updateDto.RoleDescription;
            if (updateDto.IsPrimary.HasValue)
                party.IsPrimary = updateDto.IsPrimary.Value;

            await _context.SaveChangesAsync();

            return new MatterPartyDto
            {
                Id = party.Id,
                ContactId = party.ContactId,
                PartyType = party.PartyType,
                RoleDescription = party.RoleDescription,
                IsPrimary = party.IsPrimary
            };
        }

        public async Task<bool> RemoveMatterParty(long matterId, long firmId, long partyId)
        {
            var party = await _context.MatterParties
                .FirstOrDefaultAsync(mp => mp.Id == partyId && mp.MatterId == matterId);

            if (party == null)
                return false;

            _context.MatterParties.Remove(party);
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== Matter Notes ====================

        public async Task<List<MatterNoteDto>> GetMatterNotes(long matterId, long firmId, long userId)
        {
            var notes = await _context.MatterNotes
                .Include(mn => mn.User)
                .Where(mn => mn.MatterId == matterId && (!mn.IsPrivate || mn.UserId == userId))
                .OrderByDescending(mn => mn.CreatedAt)
                .ToListAsync();

            return notes.Select(mn => new MatterNoteDto
            {
                Id = mn.Id,
                Note = mn.Note,
                IsPrivate = mn.IsPrivate,
                UserName = mn.User != null ? $"{mn.User.FirstName} {mn.User.LastName}" : null,
                CreatedAt = mn.CreatedAt,
                UpdatedAt = mn.UpdatedAt
            }).ToList();
        }

        public async Task<MatterNoteDto> AddMatterNote(long matterId, long firmId, long userId, AddMatterNoteDto noteDto)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == matterId && m.FirmId == firmId);

            if (matter == null)
                throw new KeyNotFoundException("Matter not found");

            var note = new MatterNote
            {
                MatterId = matterId,
                UserId = userId,
                Note = noteDto.Note,
                IsPrivate = noteDto.IsPrivate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MatterNotes.Add(note);
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, userId, "ADD_NOTE", "Matter", matter.Id, matter.Title, $"Added note to matter");

            return new MatterNoteDto
            {
                Id = note.Id,
                Note = note.Note,
                IsPrivate = note.IsPrivate,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
        }

        public async Task<MatterNoteDto> UpdateMatterNote(long noteId, long firmId, UpdateMatterNoteDto updateDto)
        {
            var note = await _context.MatterNotes
                .FirstOrDefaultAsync(mn => mn.Id == noteId);

            if (note == null)
                throw new KeyNotFoundException("Note not found");

            if (updateDto.Note != null)
                note.Note = updateDto.Note;
            if (updateDto.IsPrivate.HasValue)
                note.IsPrivate = updateDto.IsPrivate.Value;

            note.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new MatterNoteDto
            {
                Id = note.Id,
                Note = note.Note,
                IsPrivate = note.IsPrivate,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
        }

        public async Task<bool> DeleteMatterNote(long noteId, long firmId)
        {
            var note = await _context.MatterNotes
                .FirstOrDefaultAsync(mn => mn.Id == noteId);

            if (note == null)
                return false;

            _context.MatterNotes.Remove(note);
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== Practice Areas ====================

        public async Task<List<PracticeAreaDto>> GetPracticeAreas(long firmId)
        {
            var areas = await _context.PracticeAreas
                .Where(pa => pa.FirmId == firmId && pa.IsActive)
                .ToListAsync();

            return areas.Select(pa => new PracticeAreaDto
            {
                Id = pa.Id,
                Name = pa.Name,
                Description = pa.Description,
                Color = pa.Color,
                IsActive = pa.IsActive
            }).ToList();
        }

        public async Task<PracticeAreaDto> CreatePracticeArea(long firmId, CreatePracticeAreaDto createDto)
        {
            if (createDto == null)
                throw new ArgumentNullException(nameof(createDto));

            if (string.IsNullOrWhiteSpace(createDto.Name))
                throw new ArgumentException("Practice area name is required");

            var practiceArea = new PracticeArea
            {
                FirmId = firmId,
                Name = createDto.Name.Trim(),
                Description = createDto.Description,
                Color = createDto.Color,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.PracticeAreas.Add(practiceArea);
            await _context.SaveChangesAsync();

            return new PracticeAreaDto
            {
                Id = practiceArea.Id,
                Name = practiceArea.Name,
                Description = practiceArea.Description,
                Color = practiceArea.Color,
                IsActive = practiceArea.IsActive
            };
        }

        public async Task<PracticeAreaDto> UpdatePracticeArea(long id, long firmId, UpdatePracticeAreaDto updateDto)
        {
            var practiceArea = await _context.PracticeAreas
                .FirstOrDefaultAsync(pa => pa.Id == id && pa.FirmId == firmId);

            if (practiceArea == null)
                throw new KeyNotFoundException("Practice area not found");

            if (updateDto.Name != null)
                practiceArea.Name = updateDto.Name;
            if (updateDto.Description != null)
                practiceArea.Description = updateDto.Description;
            if (updateDto.Color != null)
                practiceArea.Color = updateDto.Color;
            if (updateDto.IsActive.HasValue)
                practiceArea.IsActive = updateDto.IsActive.Value;

            await _context.SaveChangesAsync();

            return new PracticeAreaDto
            {
                Id = practiceArea.Id,
                Name = practiceArea.Name,
                Description = practiceArea.Description,
                Color = practiceArea.Color,
                IsActive = practiceArea.IsActive
            };
        }

        public async Task<bool> DeletePracticeArea(long id, long firmId)
        {
            var practiceArea = await _context.PracticeAreas
                .FirstOrDefaultAsync(pa => pa.Id == id && pa.FirmId == firmId);

            if (practiceArea == null)
                return false;

            practiceArea.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== Courts ====================

        public async Task<List<CourtDto>> GetCourts(long firmId, string? search, string? state)
        {
            var query = _context.Courts.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c =>
                    c.Name.Contains(search) ||
                    (c.City != null && c.City.Contains(search)) ||
                    (c.State != null && c.State.Contains(search)));
            }

            if (!string.IsNullOrEmpty(state))
            {
                query = query.Where(c => c.State == state);
            }

            var courts = await query
                .OrderBy(c => c.Name)
                .ToListAsync();

            return courts.Select(c => new CourtDto
            {
                Id = c.Id,
                Name = c.Name,
                Level = c.Level,
                Address = c.Address,
                City = c.City,
                State = c.State,
                Country = c.Country,
                Phone = c.Phone,
                Email = c.Email
            }).ToList();
        }

        public async Task<CourtDto> CreateCourt(long firmId, CreateCourtDto createDto)
        {
            if (string.IsNullOrWhiteSpace(createDto.Name))
                throw new ArgumentException("Court name is required");

            var existing = await _context.Courts
                .FirstOrDefaultAsync(c => c.Name.ToLower() == createDto.Name.ToLower());

            if (existing != null)
                throw new InvalidOperationException($"A court with name '{createDto.Name}' already exists");

            var court = new Court
            {
                Name = createDto.Name.Trim(),
                Level = createDto.Level,
                Address = createDto.Address,
                City = createDto.City,
                State = createDto.State,
                Country = createDto.Country ?? "India",
                Phone = createDto.Phone,
                Email = createDto.Email,
                CreatedAt = DateTime.UtcNow
            };

            _context.Courts.Add(court);
            await _context.SaveChangesAsync();

            return new CourtDto
            {
                Id = court.Id,
                Name = court.Name,
                Level = court.Level,
                Address = court.Address,
                City = court.City,
                State = court.State,
                Country = court.Country,
                Phone = court.Phone,
                Email = court.Email
            };
        }

        public async Task<CourtDto> UpdateCourt(long id, long firmId, UpdateCourtDto updateDto)
        {
            var court = await _context.Courts.FindAsync(id);

            if (court == null)
                throw new KeyNotFoundException("Court not found");

            if (!string.IsNullOrEmpty(updateDto.Name) &&
                !string.Equals(updateDto.Name, court.Name, StringComparison.OrdinalIgnoreCase))
            {
                var existing = await _context.Courts
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == updateDto.Name.ToLower() && c.Id != id);

                if (existing != null)
                    throw new InvalidOperationException($"A court with name '{updateDto.Name}' already exists");
            }

            if (updateDto.Name != null)
                court.Name = updateDto.Name;
            if (updateDto.Level != null)
                court.Level = updateDto.Level;
            if (updateDto.Address != null)
                court.Address = updateDto.Address;
            if (updateDto.City != null)
                court.City = updateDto.City;
            if (updateDto.State != null)
                court.State = updateDto.State;
            if (updateDto.Country != null)
                court.Country = updateDto.Country;
            if (updateDto.Phone != null)
                court.Phone = updateDto.Phone;
            if (updateDto.Email != null)
                court.Email = updateDto.Email;

            await _context.SaveChangesAsync();

            return new CourtDto
            {
                Id = court.Id,
                Name = court.Name,
                Level = court.Level,
                Address = court.Address,
                City = court.City,
                State = court.State,
                Country = court.Country,
                Phone = court.Phone,
                Email = court.Email
            };
        }

        public async Task<bool> DeleteCourt(long id, long firmId)
        {
            var court = await _context.Courts.FindAsync(id);

            if (court == null)
                return false;

            var hasMatters = await _context.Matters
                .AnyAsync(m => m.CourtId == id);

            if (hasMatters)
                throw new InvalidOperationException("Cannot delete court because it is referenced by one or more matters");

            _context.Courts.Remove(court);
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== Judicial Districts ====================

        public async Task<List<JudicialDistrictDto>> GetJudicialDistricts(long firmId, string? search, string? state)
        {
            var query = _context.JudicialDistricts.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d =>
                    d.Name.Contains(search) ||
                    (d.State != null && d.State.Contains(search)) ||
                    (d.Description != null && d.Description.Contains(search)));
            }

            if (!string.IsNullOrEmpty(state))
            {
                query = query.Where(d => d.State == state);
            }

            var districts = await query
                .OrderBy(d => d.Name)
                .ToListAsync();

            return districts.Select(d => new JudicialDistrictDto
            {
                Id = d.Id,
                Name = d.Name,
                State = d.State,
                Description = d.Description
            }).ToList();
        }

        public async Task<JudicialDistrictDto> CreateJudicialDistrict(long firmId, CreateJudicialDistrictDto createDto)
        {
            if (string.IsNullOrWhiteSpace(createDto.Name))
                throw new ArgumentException("Judicial district name is required");

            var existing = await _context.JudicialDistricts
                .FirstOrDefaultAsync(d =>
                    d.Name.ToLower() == createDto.Name.ToLower() &&
                    d.State == createDto.State);

            if (existing != null)
                throw new InvalidOperationException($"A judicial district with name '{createDto.Name}' in state '{createDto.State}' already exists");

            var district = new JudicialDistrict
            {
                Name = createDto.Name.Trim(),
                State = createDto.State,
                Description = createDto.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.JudicialDistricts.Add(district);
            await _context.SaveChangesAsync();

            return new JudicialDistrictDto
            {
                Id = district.Id,
                Name = district.Name,
                State = district.State,
                Description = district.Description
            };
        }

        public async Task<JudicialDistrictDto> UpdateJudicialDistrict(long id, long firmId, UpdateJudicialDistrictDto updateDto)
        {
            var district = await _context.JudicialDistricts.FindAsync(id);

            if (district == null)
                throw new KeyNotFoundException("Judicial district not found");

            if (!string.IsNullOrEmpty(updateDto.Name) &&
                !string.Equals(updateDto.Name, district.Name, StringComparison.OrdinalIgnoreCase))
            {
                var state = updateDto.State ?? district.State;
                var existing = await _context.JudicialDistricts
                    .FirstOrDefaultAsync(d =>
                        d.Name.ToLower() == updateDto.Name.ToLower() &&
                        d.State == state &&
                        d.Id != id);

                if (existing != null)
                    throw new InvalidOperationException($"A judicial district with name '{updateDto.Name}' in state '{state}' already exists");
            }

            if (updateDto.Name != null)
                district.Name = updateDto.Name;
            if (updateDto.State != null)
                district.State = updateDto.State;
            if (updateDto.Description != null)
                district.Description = updateDto.Description;

            await _context.SaveChangesAsync();

            return new JudicialDistrictDto
            {
                Id = district.Id,
                Name = district.Name,
                State = district.State,
                Description = district.Description
            };
        }

        public async Task<bool> DeleteJudicialDistrict(long id, long firmId)
        {
            var district = await _context.JudicialDistricts.FindAsync(id);

            if (district == null)
                return false;

            var hasMatters = await _context.Matters
                .AnyAsync(m => m.JudicialDistrictId == id);

            if (hasMatters)
                throw new InvalidOperationException("Cannot delete judicial district because it is referenced by one or more matters");

            _context.JudicialDistricts.Remove(district);
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== Matter Filters ====================

        public async Task<List<MatterDto>> GetMattersByStatus(long firmId, string status)
        {
            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && m.Status == status && m.DeletedAt == null)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return matters.Select(m => MapToDto(m)).ToList();
        }

        public async Task<List<MatterDto>> GetOpenMatters(long firmId)
        {
            return await GetMattersByStatus(firmId, "OPEN");
        }

        public async Task<List<MatterDto>> GetPendingMatters(long firmId)
        {
            return await GetMattersByStatus(firmId, "PENDING");
        }

        public async Task<List<MatterDto>> GetClosedMatters(long firmId)
        {
            return await GetMattersByStatus(firmId, "CLOSED");
        }

        public async Task<List<MatterDto>> GetMattersByPriority(long firmId, string priority)
        {
            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && m.Priority == priority && m.DeletedAt == null)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return matters.Select(m => MapToDto(m)).ToList();
        }

        public async Task<List<MatterDto>> GetLitigationMatters(long firmId)
        {
            var litigationTypeIds = await _context.MatterTypes
                .Where(mt => mt.FirmId == firmId && mt.Category == "LITIGATION" && mt.IsActive)
                .Select(mt => mt.Id)
                .ToListAsync();

            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && litigationTypeIds.Contains(m.MatterTypeId) && m.DeletedAt == null)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return matters.Select(m => MapToDto(m)).ToList();
        }

        public async Task<List<MatterDto>> GetNonLitigationMatters(long firmId)
        {
            var nonLitigationTypeIds = await _context.MatterTypes
                .Where(mt => mt.FirmId == firmId && mt.Category == "NON_LITIGATION" && mt.IsActive)
                .Select(mt => mt.Id)
                .ToListAsync();

            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && nonLitigationTypeIds.Contains(m.MatterTypeId) && m.DeletedAt == null)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return matters.Select(m => MapToDto(m)).ToList();
        }

        public async Task<List<MatterDto>> GetMattersAssignedToUser(long firmId, long userId)
        {
            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && m.ResponsibleAdvocateId == userId && m.DeletedAt == null)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return matters.Select(m => MapToDto(m)).ToList();
        }

        public async Task<List<MatterDto>> GetMattersByClient(long firmId, long contactId)
        {
            var matterIds = await _context.MatterParties
                .Where(mp => mp.ContactId == contactId && mp.PartyType == "CLIENT")
                .Select(mp => mp.MatterId)
                .ToListAsync();

            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && matterIds.Contains(m.Id) && m.DeletedAt == null)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return matters.Select(m => MapToDto(m)).ToList();
        }

        // ==================== Statistics ====================

        public async Task<DashboardMatterStatsDto> GetMatterStats(long firmId)
        {
            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && m.DeletedAt == null)
                .ToListAsync();

            var litigationTypeIds = await _context.MatterTypes
                .Where(mt => mt.FirmId == firmId && mt.Category == "LITIGATION" && mt.IsActive)
                .Select(mt => mt.Id)
                .ToListAsync();

            return new DashboardMatterStatsDto
            {
                Total = matters.Count,
                Open = matters.Count(m => m.Status == "OPEN"),
                Pending = matters.Count(m => m.Status == "PENDING"),
                Closed = matters.Count(m => m.Status == "CLOSED"),
                Archived = matters.Count(m => m.Status == "ARCHIVED"),
                HighPriority = matters.Count(m => m.Priority == "HIGH"),
                UrgentPriority = matters.Count(m => m.Priority == "URGENT"),
                Litigation = matters.Count(m => litigationTypeIds.Contains(m.MatterTypeId)),
                NonLitigation = matters.Count(m => !litigationTypeIds.Contains(m.MatterTypeId))
            };
        }

        public async Task<List<MatterTimelineDto>> GetMatterTimeline(long matterId, long firmId)
        {
            var activities = await _context.RecentActivities
                .Where(a => a.FirmId == firmId && a.EntityId == matterId && a.EntityType == "Matter")
                .OrderByDescending(a => a.CreatedAt)
                .Take(50)
                .Select(a => new MatterTimelineDto
                {
                    Id = a.Id,
                    ActivityType = a.ActivityType,
                    Description = a.Description,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : null,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return activities;
        }

        // ==================== Related Data ====================

        public async Task<List<MatterDocumentDto>> GetMatterDocuments(long matterId, long firmId)
        {
            var documents = await _context.Documents
                .Where(d => d.MatterId == matterId && d.FirmId == firmId && !d.IsArchived)
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => new MatterDocumentDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    FileName = d.FileName,
                    FileSize = d.FileSize,
                    UploadedAt = d.UploadedAt,
                    UploadedByName = d.Uploader != null ? $"{d.Uploader.FirstName} {d.Uploader.LastName}" : null
                })
                .ToListAsync();

            return documents;
        }

        public async Task<List<MatterTaskDto>> GetMatterTasks(long matterId, long firmId)
        {
            var tasks = await _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.MatterId == matterId && t.FirmId == firmId && t.DeletedAt == null)
                .Select(t => new MatterTaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DueDate = t.DueDate,
                    StatusName = t.Status != null ? t.Status.Name : null,
                    StatusColor = t.Status != null ? t.Status.Color : null,
                    PriorityName = t.Priority != null ? t.Priority.Name : null,
                    PriorityColor = t.Priority != null ? t.Priority.Color : null,
                    CompletedAt = t.CompletedAt
                })
                .ToListAsync();

            return tasks;
        }

        public async Task<List<MatterEventDto>> GetMatterEvents(long matterId, long firmId)
        {
            var events = await _context.CalendarEvents
                .Where(e => e.MatterId == matterId && e.FirmId == firmId && e.DeletedAt == null)
                .OrderBy(e => e.StartDateTime)
                .Select(e => new MatterEventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    StartDateTime = e.StartDateTime,
                    EndDateTime = e.EndDateTime,
                    Location = e.Location,
                    EventType = e.EventType,
                    IsAllDay = e.IsAllDay
                })
                .ToListAsync();

            return events;
        }

        public async Task<List<MatterBillDto>> GetMatterBills(long matterId, long firmId)
        {
            var bills = await _context.Bills
                .Include(b => b.Status)
                .Where(b => b.MatterId == matterId && b.FirmId == firmId && b.DeletedAt == null)
                .OrderByDescending(b => b.BillDate)
                .Select(b => new MatterBillDto
                {
                    Id = b.Id,
                    BillNumber = b.BillNumber,
                    TotalAmount = b.TotalAmount,
                    BalanceDue = b.BalanceDue,
                    DueDate = b.DueDate,
                    StatusName = b.Status != null ? b.Status.Name : null,
                    StatusColor = b.Status != null ? b.Status.Color : null
                })
                .ToListAsync();

            return bills;
        }

        // ==================== Time Entries ====================

        public async Task<List<TimeEntryDto>> GetTimeEntries(long matterId, long firmId, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.TimeEntries
                .Where(t => t.MatterId == matterId && t.FirmId == firmId);

            if (startDate.HasValue)
                query = query.Where(t => t.Date >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(t => t.Date <= endDate.Value);

            var entries = await query
                .OrderByDescending(t => t.Date)
                .Select(t => new TimeEntryDto
                {
                    Id = t.Id,
                    Date = t.Date,
                    Duration = t.Duration,
                    Description = t.Description,
                    Billable = t.Billable,
                    BillingRate = t.BillingRate,
                    Total = t.Duration * t.BillingRate,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return entries;
        }

        public async Task<TimeEntryDto> AddTimeEntry(long matterId, long firmId, long userId, AddTimeEntryDto entryDto)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == matterId && m.FirmId == firmId);

            if (matter == null)
                throw new KeyNotFoundException("Matter not found");

            var hourlyRate = entryDto.BillingRate ?? matter.HourlyRate ?? 250;

            var timeEntry = new TimeEntry
            {
                MatterId = matterId,
                FirmId = firmId,
                UserId = userId,
                Date = entryDto.Date,
                Duration = entryDto.Duration,
                Description = entryDto.Description,
                Billable = entryDto.Billable,
                BillingRate = hourlyRate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TimeEntries.Add(timeEntry);
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, userId, "ADD_TIME", "Matter", matterId, matter.Title, $"Added {entryDto.Duration}h time entry");

            return new TimeEntryDto
            {
                Id = timeEntry.Id,
                Date = timeEntry.Date,
                Duration = timeEntry.Duration,
                Description = timeEntry.Description,
                Billable = timeEntry.Billable,
                BillingRate = timeEntry.BillingRate,
                Total = timeEntry.Duration * timeEntry.BillingRate,
                CreatedAt = timeEntry.CreatedAt
            };
        }

        public async Task<TimeEntryDto> UpdateTimeEntry(long entryId, long firmId, UpdateTimeEntryDto updateDto)
        {
            var entry = await _context.TimeEntries
                .FirstOrDefaultAsync(t => t.Id == entryId && t.FirmId == firmId);

            if (entry == null)
                throw new KeyNotFoundException("Time entry not found");

            if (updateDto.Duration.HasValue)
                entry.Duration = updateDto.Duration.Value;
            if (updateDto.Description != null)
                entry.Description = updateDto.Description;
            if (updateDto.Billable.HasValue)
                entry.Billable = updateDto.Billable.Value;
            if (updateDto.BillingRate.HasValue)
                entry.BillingRate = updateDto.BillingRate.Value;

            entry.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new TimeEntryDto
            {
                Id = entry.Id,
                Date = entry.Date,
                Duration = entry.Duration,
                Description = entry.Description,
                Billable = entry.Billable,
                BillingRate = entry.BillingRate,
                Total = entry.Duration * entry.BillingRate,
                CreatedAt = entry.CreatedAt
            };
        }

        public async Task<bool> DeleteTimeEntry(long entryId, long firmId)
        {
            var entry = await _context.TimeEntries
                .FirstOrDefaultAsync(t => t.Id == entryId && t.FirmId == firmId);

            if (entry == null)
                return false;

            _context.TimeEntries.Remove(entry);
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== Deadlines ====================

        public async Task<List<MatterDeadlineDto>> GetMatterDeadlines(long matterId, long firmId)
        {
            var deadlines = await _context.MatterDeadlines
                .Where(d => d.MatterId == matterId && d.FirmId == firmId)
                .OrderBy(d => d.DeadlineDate)
                .Select(d => new MatterDeadlineDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    DeadlineDate = d.DeadlineDate,
                    IsMet = d.IsMet,
                    Notes = d.Notes,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();

            return deadlines;
        }

        public async Task<MatterDeadlineDto> AddDeadline(long matterId, long firmId, long userId, AddDeadlineDto deadlineDto)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == matterId && m.FirmId == firmId);

            if (matter == null)
                throw new KeyNotFoundException("Matter not found");

            var deadline = new MatterDeadline
            {
                MatterId = matterId,
                FirmId = firmId,
                Title = deadlineDto.Title,
                DeadlineDate = deadlineDto.DeadlineDate,
                Notes = deadlineDto.Notes,
                IsMet = false,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.MatterDeadlines.Add(deadline);
            await _context.SaveChangesAsync();

            AddRecentActivity(firmId, userId, "ADD_DEADLINE", "Matter", matterId, matter.Title, $"Added deadline: {deadlineDto.Title}");

            return new MatterDeadlineDto
            {
                Id = deadline.Id,
                Title = deadline.Title,
                DeadlineDate = deadline.DeadlineDate,
                IsMet = deadline.IsMet,
                Notes = deadline.Notes,
                CreatedAt = deadline.CreatedAt
            };
        }

        public async Task<bool> MarkDeadlineAsMet(long deadlineId, long firmId)
        {
            var deadline = await _context.MatterDeadlines
                .FirstOrDefaultAsync(d => d.Id == deadlineId && d.FirmId == firmId);

            if (deadline == null)
                return false;

            deadline.IsMet = true;
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== Bulk Operations ====================

        public async Task<int> BulkUpdateStatus(long firmId, List<long> matterIds, string status)
        {
            var matters = await _context.Matters
                .Where(m => matterIds.Contains(m.Id) && m.FirmId == firmId && m.DeletedAt == null)
                .ToListAsync();

            foreach (var matter in matters)
            {
                matter.Status = status;
                matter.UpdatedAt = DateTime.UtcNow;
            }

            return await _context.SaveChangesAsync();
        }

        public async Task<int> BulkAssignAdvocate(long firmId, List<long> matterIds, long advocateId)
        {
            var matters = await _context.Matters
                .Where(m => matterIds.Contains(m.Id) && m.FirmId == firmId && m.DeletedAt == null)
                .ToListAsync();

            foreach (var matter in matters)
            {
                matter.ResponsibleAdvocateId = advocateId;
                matter.UpdatedAt = DateTime.UtcNow;
            }

            return await _context.SaveChangesAsync();
        }

        public async Task<int> BulkDeleteMatters(long firmId, List<long> matterIds)
        {
            var matters = await _context.Matters
                .Where(m => matterIds.Contains(m.Id) && m.FirmId == firmId && m.DeletedAt == null)
                .ToListAsync();

            foreach (var matter in matters)
            {
                matter.DeletedAt = DateTime.UtcNow;
            }

            return await _context.SaveChangesAsync();
        }

        // ==================== Search ====================

        public async Task<List<MatterDto>> AdvancedSearch(long firmId, AdvancedSearchDto searchParams)
        {
            var query = _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.ResponsibleAdvocate)
                .Include(m => m.Court)
                .Include(m => m.JudicialDistrict)
                .Where(m => m.FirmId == firmId && m.DeletedAt == null);

            if (!string.IsNullOrEmpty(searchParams.Title))
                query = query.Where(m => m.Title.Contains(searchParams.Title));

            if (!string.IsNullOrEmpty(searchParams.MatterNumber))
                query = query.Where(m => m.MatterNumber.Contains(searchParams.MatterNumber));

            if (searchParams.Status != null && searchParams.Status.Any())
                query = query.Where(m => searchParams.Status.Contains(m.Status));

            if (searchParams.Priority != null && searchParams.Priority.Any())
                query = query.Where(m => searchParams.Priority.Contains(m.Priority));

            if (searchParams.PracticeAreaId != null && searchParams.PracticeAreaId.Any())
                query = query.Where(m => searchParams.PracticeAreaId.Contains(m.PracticeAreaId ?? 0));

            if (searchParams.ResponsibleAdvocateId.HasValue)
                query = query.Where(m => m.ResponsibleAdvocateId == searchParams.ResponsibleAdvocateId);

            if (!string.IsNullOrEmpty(searchParams.ClientName))
            {
                var contactIds = await _context.Contacts
                    .Where(c => c.FirstName.Contains(searchParams.ClientName) || c.LastName.Contains(searchParams.ClientName))
                    .Select(c => c.Id)
                    .ToListAsync();

                var matterIdsWithClient = await _context.MatterParties
                    .Where(mp => contactIds.Contains(mp.ContactId) && mp.PartyType == "CLIENT")
                    .Select(mp => mp.MatterId)
                    .ToListAsync();

                query = query.Where(m => matterIdsWithClient.Contains(m.Id));
            }

            if (searchParams.OpenDateFrom.HasValue)
                query = query.Where(m => m.OpenDate >= searchParams.OpenDateFrom.Value);

            if (searchParams.OpenDateTo.HasValue)
                query = query.Where(m => m.OpenDate <= searchParams.OpenDateTo.Value);

            if (searchParams.EstimatedValueMin.HasValue)
                query = query.Where(m => m.EstimatedValue >= searchParams.EstimatedValueMin);

            if (searchParams.EstimatedValueMax.HasValue)
                query = query.Where(m => m.EstimatedValue <= searchParams.EstimatedValueMax);

            var matters = await query
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return matters.Select(m => MapToDto(m)).ToList();
        }

        // ==================== Export/Import ====================

        public async Task<byte[]> ExportMatters(long firmId, string format, ExportFiltersDto filters)
        {
            var query = _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.ResponsibleAdvocate)
                .Where(m => m.FirmId == firmId && m.DeletedAt == null);

            if (!string.IsNullOrEmpty(filters.Status))
                query = query.Where(m => m.Status == filters.Status);

            if (!string.IsNullOrEmpty(filters.Priority))
                query = query.Where(m => m.Priority == filters.Priority);

            if (filters.StartDate.HasValue)
                query = query.Where(m => m.OpenDate >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(m => m.OpenDate <= filters.EndDate.Value);

            var matters = await query.ToListAsync();

            var csv = new System.Text.StringBuilder();
            csv.AppendLine("Matter Number,Title,Status,Priority,Open Date,Client Reference,Estimated Value,Billing Method,Responsible Advocate,Court,Judicial District");

            foreach (var matter in matters)
            {
                var advocateName = matter.ResponsibleAdvocate != null ? $"{matter.ResponsibleAdvocate.FirstName} {matter.ResponsibleAdvocate.LastName}" : "";
                var courtName = matter.Court?.Name ?? "";
                var districtName = matter.JudicialDistrict?.Name ?? "";
                csv.AppendLine($"\"{matter.MatterNumber}\",\"{matter.Title}\",\"{matter.Status}\",\"{matter.Priority}\",\"{matter.OpenDate:yyyy-MM-dd}\",\"{matter.ClientReference}\",\"{matter.EstimatedValue}\",\"{matter.BillingMethod}\",\"{advocateName}\",\"{courtName}\",\"{districtName}\"");
            }

            return System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        }

        public async Task<ImportResultDto> ImportMatters(long firmId, long userId, IFormFile file)
        {
            var result = new ImportResultDto();

            using var stream = new StreamReader(file.OpenReadStream());
            var content = await stream.ReadToEndAsync();
            var lines = content.Split('\n').Skip(1);

            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                try
                {
                    var parts = line.Split(',');
                    if (parts.Length < 3) continue;

                    var matter = new Matter
                    {
                        FirmId = firmId,
                        MatterNumber = $"IMP-{DateTime.Now:yyyyMMdd}-{result.Imported + 1}",
                        Title = parts[0].Trim('"'),
                        Description = parts.Length > 1 ? parts[1].Trim('"') : null,
                        Status = "OPEN",
                        Priority = "MEDIUM",
                        OpenDate = DateTime.UtcNow,
                        CreatedBy = userId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Matters.Add(matter);
                    result.Imported++;
                }
                catch (Exception)
                {
                    result.Failed++;
                }
            }

            await _context.SaveChangesAsync();
            result.Total = result.Imported + result.Failed;

            return result;
        }

        // ==================== Activity Logs ====================

        public async Task<List<ActivityLogDto>> GetMatterActivityLogs(long matterId, long firmId, DateTime? startDate, DateTime? endDate, int limit)
        {
            var query = _context.RecentActivities
                .Where(a => a.FirmId == firmId && a.EntityId == matterId && a.EntityType == "Matter");

            if (startDate.HasValue)
                query = query.Where(a => a.CreatedAt >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(a => a.CreatedAt <= endDate.Value);

            var activities = await query
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
                .Select(a => new ActivityLogDto
                {
                    Id = a.Id,
                    Action = a.ActivityType,
                    Description = a.Description,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : null,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return activities;
        }

        // ==================== Helper Methods ====================

        private MatterDto MapToDto(Matter m)
        {
            return new MatterDto
            {
                Id = m.Id,
                Uuid = m.Uuid,
                MatterNumber = m.MatterNumber,
                Title = m.Title,
                Description = m.Description,
                Status = m.Status,
                Priority = m.Priority,
                OpenDate = m.OpenDate,
                PendingDate = m.PendingDate,
                ClosedDate = m.ClosedDate,
                StatuteOfLimitationsDate = m.StatuteOfLimitationsDate,
                EstimatedValue = m.EstimatedValue,
                BillingMethod = m.BillingMethod,
                HourlyRate = m.HourlyRate,
                FixedFee = m.FixedFee,
                MatterTypeId = m.MatterTypeId,
                MatterTypeName = m.MatterType?.Name,
                MatterTypeCategory = m.MatterType?.Category,
                OriginatingAdvocateId = m.OriginatingAdvocateId,
                OriginatingAdvocateName = m.OriginatingAdvocate != null ? $"{m.OriginatingAdvocate.FirstName} {m.OriginatingAdvocate.LastName}" : null,
                ResponsibleAdvocateId = m.ResponsibleAdvocateId,
                ResponsibleAdvocateName = m.ResponsibleAdvocate != null ? $"{m.ResponsibleAdvocate.FirstName} {m.ResponsibleAdvocate.LastName}" : null,
                PracticeAreaId = m.PracticeAreaId,
                PracticeAreaName = m.PracticeArea?.Name,
                CourtId = m.CourtId,
                CourtName = m.Court?.Name,
                JudicialDistrictId = m.JudicialDistrictId,
                JudicialDistrictName = m.JudicialDistrict?.Name,
                ClientReference = m.ClientReference,
                IsConfidential = m.IsConfidential,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt,
                Parties = m.MatterParties?.Select(mp => new MatterPartyDto
                {
                    Id = mp.Id,
                    ContactId = mp.ContactId,
                    ContactName = mp.Contact != null ? $"{mp.Contact.FirstName} {mp.Contact.LastName}" : null,
                    PartyType = mp.PartyType,
                    RoleDescription = mp.RoleDescription,
                    IsPrimary = mp.IsPrimary
                }).ToList() ?? new List<MatterPartyDto>(),
                Notes = m.MatterNotes?.Select(mn => new MatterNoteDto
                {
                    Id = mn.Id,
                    Note = mn.Note,
                    IsPrivate = mn.IsPrivate,
                    UserName = mn.User != null ? $"{mn.User.FirstName} {mn.User.LastName}" : null,
                    CreatedAt = mn.CreatedAt,
                    UpdatedAt = mn.UpdatedAt
                }).ToList() ?? new List<MatterNoteDto>()
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
            _context.SaveChangesAsync().Wait();
        }

        public async Task<CourtDto?> GetCourtById(long id, long firmId)
        {
            var court = await _context.Courts.FindAsync(id);

            if (court == null)
                return null;

            return new CourtDto
            {
                Id = court.Id,
                Name = court.Name,
                Level = court.Level,
                Address = court.Address,
                City = court.City,
                State = court.State,
                Country = court.Country,
                Phone = court.Phone,
                Email = court.Email
            };
        }

        public async Task<JudicialDistrictDto?> GetJudicialDistrictById(long id, long firmId)
        {
            var district = await _context.JudicialDistricts.FindAsync(id);

            if (district == null)
                return null;

            return new JudicialDistrictDto
            {
                Id = district.Id,
                Name = district.Name,
                State = district.State,
                Description = district.Description
            };
        }
    }
}