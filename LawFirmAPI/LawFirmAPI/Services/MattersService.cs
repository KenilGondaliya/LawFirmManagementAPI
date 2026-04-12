// Services/MattersService.cs
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
        Task<List<MatterDto>> GetAllMatters(long firmId, string? status, string? priority, string? search);
        Task<MatterDto?> GetMatterById(long id, long firmId);
        Task<MatterDto> CreateMatter(long firmId, long userId, CreateMatterDto createDto);
        Task<MatterDto> UpdateMatter(long id, long firmId, UpdateMatterDto updateDto);
        Task<bool> DeleteMatter(long id, long firmId);
        Task<MatterDto> UpdateMatterStatus(long id, long firmId, string status);
        Task<List<MatterTypeDto>> GetMatterTypes(long firmId);
        Task<MatterTypeDto> CreateMatterType(long firmId, CreateMatterTypeDto createDto);
        Task<List<MatterPartyDto>> GetMatterParties(long matterId, long firmId);
        Task<MatterPartyDto> AddMatterParty(long matterId, long firmId, AddMatterPartyDto partyDto);
        Task<bool> RemoveMatterParty(long matterId, long firmId, long partyId);
        Task<List<MatterNoteDto>> GetMatterNotes(long matterId, long firmId, long userId);
        Task<MatterNoteDto> AddMatterNote(long matterId, long firmId, long userId, AddMatterNoteDto noteDto);
        Task<bool> DeleteMatterNote(long noteId, long firmId);
        Task<List<PracticeAreaDto>> GetPracticeAreas(long firmId);
        Task<PracticeAreaDto> CreatePracticeArea(long firmId, CreatePracticeAreaDto createDto);
        Task<DashboardMatterStatsDto> GetMatterStats(long firmId);
    }

    public class MattersService : IMattersService
    {
        private readonly ApplicationDbContext _context;

        public MattersService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MatterDto>> GetAllMatters(long firmId, string? status, string? priority, string? search)
        {
            var query = _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.OriginatingAdvocate)
                .Include(m => m.ResponsibleAdvocate)
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
                    (m.Description != null && m.Description.Contains(search)));
            }

            var matters = await query
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => MapToDto(m))
                .ToListAsync();

            return matters;
        }

        public async Task<MatterDto?> GetMatterById(long id, long firmId)
        {
            var matter = await _context.Matters
                .Include(m => m.MatterType)
                .Include(m => m.OriginatingAdvocate)
                .Include(m => m.ResponsibleAdvocate)
                .Include(m => m.MatterParties)
                .ThenInclude(mp => mp.Contact)
                .Include(m => m.MatterNotes)
                .ThenInclude(mn => mn.User)
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId && m.DeletedAt == null);

            return matter != null ? MapToDto(matter) : null;
        }

        public async Task<MatterDto> CreateMatter(long firmId, long userId, CreateMatterDto createDto)
        {
            // Generate matter number
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
                CourtId = createDto.CourtId,
                JudicialDistrictId = createDto.JudicialDistrictId,
                ClientReference = createDto.ClientReference,
                IsConfidential = createDto.IsConfidential,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Matters.Add(matter);
            await _context.SaveChangesAsync();

            // Add parties
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

            // Add to recent activities
            AddRecentActivity(firmId, userId, "CREATE", "Matter", matter.Id, matter.Title, $"Created matter: {matter.Title}");

            return MapToDto(matter);
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
            if (updateDto.ClientReference != null)
                matter.ClientReference = updateDto.ClientReference;
            if (updateDto.ClosedDate.HasValue)
                matter.ClosedDate = updateDto.ClosedDate;

            matter.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(matter);
        }

        public async Task<bool> DeleteMatter(long id, long firmId)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId && m.DeletedAt == null);

            if (matter == null)
                return false;

            matter.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<MatterDto> UpdateMatterStatus(long id, long firmId, string status)
        {
            var matter = await _context.Matters
                .FirstOrDefaultAsync(m => m.Id == id && m.FirmId == firmId && m.DeletedAt == null);

            if (matter == null)
                throw new KeyNotFoundException("Matter not found");

            matter.Status = status;
            if (status == "CLOSED" && !matter.ClosedDate.HasValue)
                matter.ClosedDate = DateTime.UtcNow;

            matter.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(matter);
        }

        public async Task<List<MatterTypeDto>> GetMatterTypes(long firmId)
        {
            var types = await _context.MatterTypes
                .Where(mt => mt.FirmId == firmId && mt.IsActive)
                .Select(mt => new MatterTypeDto
                {
                    Id = mt.Id,
                    Name = mt.Name,
                    Category = mt.Category,
                    Description = mt.Description,
                    IsActive = mt.IsActive
                })
                .ToListAsync();

            return types;
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

        public async Task<List<MatterPartyDto>> GetMatterParties(long matterId, long firmId)
        {
            var parties = await _context.MatterParties
                .Include(mp => mp.Contact)
                .Where(mp => mp.MatterId == matterId)
                .Select(mp => new MatterPartyDto
                {
                    Id = mp.Id,
                    ContactId = mp.ContactId,
                    ContactName = mp.Contact != null ? $"{mp.Contact.FirstName} {mp.Contact.LastName}" : null,
                    PartyType = mp.PartyType,
                    RoleDescription = mp.RoleDescription,
                    IsPrimary = mp.IsPrimary
                })
                .ToListAsync();

            return parties;
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

        public async Task<List<MatterNoteDto>> GetMatterNotes(long matterId, long firmId, long userId)
        {
            var notes = await _context.MatterNotes
                .Include(mn => mn.User)
                .Where(mn => mn.MatterId == matterId && (!mn.IsPrivate || mn.UserId == userId))
                .OrderByDescending(mn => mn.CreatedAt)
                .Select(mn => new MatterNoteDto
                {
                    Id = mn.Id,
                    Note = mn.Note,
                    IsPrivate = mn.IsPrivate,
                    UserName = mn.User != null ? $"{mn.User.FirstName} {mn.User.LastName}" : null,
                    CreatedAt = mn.CreatedAt,
                    UpdatedAt = mn.UpdatedAt
                })
                .ToListAsync();

            return notes;
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

        public async Task<List<PracticeAreaDto>> GetPracticeAreas(long firmId)
        {
            var areas = await _context.PracticeAreas
                .Where(pa => pa.FirmId == firmId && pa.IsActive)
                .Select(pa => new PracticeAreaDto
                {
                    Id = pa.Id,
                    Name = pa.Name,
                    Description = pa.Description,
                    Color = pa.Color,
                    IsActive = pa.IsActive
                })
                .ToListAsync();

            return areas;
        }

        public async Task<PracticeAreaDto> CreatePracticeArea(long firmId, CreatePracticeAreaDto createDto)
        {
            var practiceArea = new PracticeArea
            {
                FirmId = firmId,
                Name = createDto.Name,
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

        public async Task<DashboardMatterStatsDto> GetMatterStats(long firmId)
        {
            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && m.DeletedAt == null)
                .ToListAsync();

            var stats = new DashboardMatterStatsDto
            {
                Total = matters.Count,
                Open = matters.Count(m => m.Status == "OPEN"),
                Pending = matters.Count(m => m.Status == "PENDING"),
                Closed = matters.Count(m => m.Status == "CLOSED"),
                Archived = matters.Count(m => m.Status == "ARCHIVED"),
                HighPriority = matters.Count(m => m.Priority == "HIGH"),
                UrgentPriority = matters.Count(m => m.Priority == "URGENT"),
                Litigation = matters.Count(m => m.MatterTypeId > 0), // Would need join with MatterType
                NonLitigation = 0 // Would need join with MatterType
            };

            return stats;
        }

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
                ClientReference = m.ClientReference,
                IsConfidential = m.IsConfidential,
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt
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
        }
    }
}