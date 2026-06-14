// Services/SettingsService.cs - ULTIMATE FIX - NO JSON DESERIALIZATION

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;
        private readonly IEmailService _emailService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SettingsService(ApplicationDbContext context, IFileService fileService, IEmailService emailService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _fileService = fileService;
            _emailService = emailService;
            _httpContextAccessor = httpContextAccessor;
        }

        // ==================== Profile Settings ====================

        public async Task<UserProfileDto> GetProfile(long userId, long firmId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                PhoneNumber = user.PhoneNumber,
                ProfileImageUrl = user.ProfileImageUrl,
                IsEmailVerified = user.IsEmailVerified,
                LastLoginAt = user.LastLoginAt,
                Roles = new List<string>()
            };
        }

        public async Task<UserProfileDto> UpdateProfile(long userId, long firmId, UpdateProfileDto updateDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            if (updateDto.FirstName != null) user.FirstName = updateDto.FirstName;
            if (updateDto.LastName != null) user.LastName = updateDto.LastName;
            if (updateDto.PhoneNumber != null) user.PhoneNumber = updateDto.PhoneNumber;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return await GetProfile(userId, firmId);
        }

        public async Task<string> UploadAvatar(long userId, long firmId, IFormFile file)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            // Delete old avatar if exists
            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
            {
                ((FileService)_fileService).DeleteFile(user.ProfileImageUrl);
            }

            // Save new file (returns relative path)
            var relativePath = await ((FileService)_fileService).SaveFile(file, "avatars");

            // ✅ Build absolute URL using the request context
            var request = _httpContextAccessor.HttpContext?.Request;
            var baseUrl = $"{request?.Scheme}://{request?.Host}";
            var absoluteUrl = $"{baseUrl}{relativePath}";

            Console.WriteLine($"Relative path: {relativePath}");
            Console.WriteLine($"Absolute URL: {absoluteUrl}");

            // Store absolute URL in database
            user.ProfileImageUrl = absoluteUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return absoluteUrl;
        }

        public async Task<bool> RemoveAvatar(long userId, long firmId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
            {
                // Cast to concrete FileService to avoid ambiguous method resolution
                ((FileService)_fileService).DeleteFile(user.ProfileImageUrl);
                user.ProfileImageUrl = null;
                await _context.SaveChangesAsync();
            }
            return true;
        }

        // ==================== Team Management ====================

        public async Task<List<TeamMemberDto>> GetTeamMembers(long firmId)
        {
            var userFirms = await _context.UserFirms
                .Include(uf => uf.User)
                .Where(uf => uf.FirmId == firmId && uf.Status != UserFirmStatus.REMOVED)
                .ToListAsync();

            var members = new List<TeamMemberDto>();
            foreach (var uf in userFirms)
            {
                members.Add(new TeamMemberDto
                {
                    Id = uf.Id,
                    UserId = uf.UserId,
                    Email = uf.User?.Email ?? string.Empty,
                    FirstName = uf.User?.FirstName ?? string.Empty,
                    LastName = uf.User?.LastName ?? string.Empty,
                    FullName = uf.User != null ? $"{uf.User.FirstName} {uf.User.LastName}".Trim() : string.Empty,
                    Role = uf.Role.ToString(),
                    Status = uf.Status.ToString(),
                    JoinedAt = uf.JoinedAt,
                    InvitedAt = uf.InvitedAt,
                    ProfileImageUrl = uf.User?.ProfileImageUrl
                });
            }
            return members;
        }

        public async Task<List<RoleDto>> GetRoles(long firmId)
        {
            var roles = new List<RoleDto>();
            foreach (FirmRole role in Enum.GetValues(typeof(FirmRole)))
            {
                roles.Add(new RoleDto
                {
                    Name = role.ToString(),
                    Description = GetRoleDescription(role),
                    Permissions = GetPermissionsForRole(role)
                });
            }
            return roles;
        }

        public async Task<TeamMemberDto> UpdateMemberRole(long firmId, long userId, string role)
        {
            var userFirm = await _context.UserFirms.FirstOrDefaultAsync(uf => uf.FirmId == firmId && uf.UserId == userId);
            if (userFirm == null) throw new KeyNotFoundException("Team member not found");

            if (!Enum.TryParse<FirmRole>(role, true, out var newRole))
                throw new ArgumentException("Invalid role");

            userFirm.Role = newRole;
            userFirm.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var members = await GetTeamMembers(firmId);
            return members.First(m => m.UserId == userId);
        }

        public async Task<bool> RemoveTeamMember(long firmId, long userId)
        {
            var userFirm = await _context.UserFirms.FirstOrDefaultAsync(uf => uf.FirmId == firmId && uf.UserId == userId);
            if (userFirm == null) return false;
            if (userFirm.Role == FirmRole.OWNER) throw new InvalidOperationException("Cannot remove the firm owner");

            userFirm.Status = UserFirmStatus.REMOVED;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<InviteResponseDto> InviteMember(long firmId, long invitedBy, InviteUserDto inviteDto)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == inviteDto.Email);
            long userId;

            if (existingUser != null)
            {
                userId = existingUser.Id;
                var existingMember = await _context.UserFirms.AnyAsync(uf => uf.UserId == userId && uf.FirmId == firmId);
                if (existingMember) throw new InvalidOperationException("User is already a member of this firm");
            }
            else
            {
                var username = inviteDto.Email.Split('@')[0];
                var baseUsername = username;
                var counter = 1;

                while (await _context.Users.AnyAsync(u => u.Username == username))
                {
                    username = $"{baseUsername}{counter}";
                    counter++;
                }

                var tempPassword = GenerateRandomPassword();
                var newUser = new User
                {
                    Email = inviteDto.Email,
                    Username = username,
                    PasswordHash = HashPassword(tempPassword),
                    FirstName = inviteDto.FirstName,
                    LastName = inviteDto.LastName,
                    IsEmailVerified = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                userId = newUser.Id;
                await _emailService.SendWelcomeEmail(inviteDto.Email, tempPassword, inviteDto.FirstName);
            }

            if (!Enum.TryParse<FirmRole>(inviteDto.Role, true, out var role))
                role = FirmRole.STAFF;

            var userFirm = new UserFirm
            {
                UserId = userId,
                FirmId = firmId,
                Role = role,
                Status = UserFirmStatus.PENDING,
                InvitedBy = invitedBy,
                InvitedAt = DateTime.UtcNow
            };

            _context.UserFirms.Add(userFirm);
            await _context.SaveChangesAsync();
            await _emailService.SendInvitationEmail(inviteDto.Email, inviteDto.FirstName, firmId);

            return new InviteResponseDto
            {
                UserId = userId,
                Email = inviteDto.Email,
                Name = $"{inviteDto.FirstName} {inviteDto.LastName}".Trim(),
                Role = role.ToString(),
                Status = "PENDING"
            };
        }

        public async Task<bool> CancelInvitation(long firmId, long userFirmId)
        {
            var userFirm = await _context.UserFirms.FirstOrDefaultAsync(uf => uf.Id == userFirmId && uf.FirmId == firmId);
            if (userFirm == null) return false;

            _context.UserFirms.Remove(userFirm);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetTeamMemberCount(long firmId)
        {
            return await _context.UserFirms.CountAsync(uf => uf.FirmId == firmId && uf.Status == UserFirmStatus.ACTIVE);
        }

        // ==================== Firm Settings ====================

        public async Task<FirmSettingsDto> GetFirmSettings(long firmId)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            if (firm == null) return null;

            var settings = await _context.FirmSettings.FirstOrDefaultAsync(fs => fs.FirmId == firmId);

            return new FirmSettingsDto
            {
                Id = firm.Id,
                Name = firm.Name,
                LegalName = firm.LegalName,
                Email = firm.Email,
                Phone = firm.Phone,
                Website = firm.Website,
                AddressLine1 = firm.AddressLine1,
                AddressLine2 = firm.AddressLine2,
                City = firm.City,
                State = firm.State,
                PostalCode = firm.PostalCode,
                Country = firm.Country,
                TaxNumber = firm.TaxNumber,
                RegistrationNumber = firm.RegistrationNumber,
                LogoUrl = firm.LogoUrl,
                Timezone = settings?.Timezone ?? "UTC",
                DateFormat = settings?.DateFormat ?? "MM/DD/YYYY",
                Currency = settings?.Currency ?? "USD"
            };
        }

        public async Task<FirmSettingsDto> UpdateFirmSettings(long firmId, UpdateFirmSettingsDto updateDto)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            if (firm == null) return null;

            if (updateDto.Name != null) firm.Name = updateDto.Name;
            if (updateDto.LegalName != null) firm.LegalName = updateDto.LegalName;
            if (updateDto.Email != null) firm.Email = updateDto.Email;
            if (updateDto.Phone != null) firm.Phone = updateDto.Phone;
            if (updateDto.Website != null) firm.Website = updateDto.Website;
            if (updateDto.AddressLine1 != null) firm.AddressLine1 = updateDto.AddressLine1;
            if (updateDto.AddressLine2 != null) firm.AddressLine2 = updateDto.AddressLine2;
            if (updateDto.City != null) firm.City = updateDto.City;
            if (updateDto.State != null) firm.State = updateDto.State;
            if (updateDto.PostalCode != null) firm.PostalCode = updateDto.PostalCode;
            if (updateDto.Country != null) firm.Country = updateDto.Country;
            if (updateDto.TaxNumber != null) firm.TaxNumber = updateDto.TaxNumber;
            if (updateDto.RegistrationNumber != null) firm.RegistrationNumber = updateDto.RegistrationNumber;

            firm.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return await GetFirmSettings(firmId);
        }

        public async Task<BrandingDto> GetBranding(long firmId)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            if (firm == null) return null;

            return new BrandingDto
            {
                LogoUrl = firm.LogoUrl,
                PrimaryColor = null,
                SecondaryColor = null
            };
        }

        public async Task<BrandingDto> UpdateBranding(long firmId, UpdateBrandingDto updateDto)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            if (firm == null) return null;

            if (updateDto.Logo != null)
            {
                if (!string.IsNullOrEmpty(firm.LogoUrl))
                    ((FileService)_fileService).DeleteFile(firm.LogoUrl);

                var filePath = await ((FileService)_fileService).SaveFile(updateDto.Logo, "branding");
                firm.LogoUrl = $"/uploads/branding/{System.IO.Path.GetFileName(filePath)}";
            }

            await _context.SaveChangesAsync();
            return new BrandingDto
            {
                LogoUrl = firm.LogoUrl,
                PrimaryColor = updateDto.PrimaryColor,
                SecondaryColor = updateDto.SecondaryColor
            };
        }

        // ==================== Plan & Billing ====================

        public async Task<CurrentPlanDto> GetCurrentPlan(long firmId)
        {
            var subscription = await _context.FirmSubscriptions
                .Include(s => s.Plan)
                .FirstOrDefaultAsync(s => s.FirmId == firmId && s.Status == "ACTIVE");

            var firm = await _context.Firms.FindAsync(firmId);

            if (subscription == null || subscription.Plan == null)
            {
                return new CurrentPlanDto
                {
                    PlanName = "Basic",
                    PlanCode = "basic",
                    Status = firm?.SubscriptionStatus.ToString() ?? "TRIAL",
                    BillingCycle = "N/A",
                    StartDate = firm?.CreatedAt ?? DateTime.UtcNow,
                    NextBillingDate = null,
                    EndDate = firm?.TrialEndDate,
                    AutoRenew = false,
                    FeaturesList = GetFeaturesByPlanCode("basic")
                };
            }

            return new CurrentPlanDto
            {
                PlanName = subscription.Plan.Name,
                PlanCode = subscription.Plan.Code,
                Status = subscription.Status,
                BillingCycle = subscription.BillingCycle,
                StartDate = subscription.StartDate,
                NextBillingDate = subscription.NextBillingDate,
                EndDate = subscription.EndDate,
                AutoRenew = subscription.AutoRenew,
                FeaturesList = GetFeaturesByPlanCode(subscription.Plan.Code)
            };
        }

        public async Task<List<PlanDto>> GetAvailablePlans()
        {
            var plans = await _context.SubscriptionPlans
                .Where(p => p.IsActive)
                .ToListAsync();

            var result = new List<PlanDto>();

            foreach (var plan in plans)
            {
                result.Add(new PlanDto
                {
                    Id = plan.Id,
                    Name = plan.Name,
                    Code = plan.Code,
                    Description = plan.Description,
                    PriceMonthly = plan.PriceMonthly,
                    PriceYearly = plan.PriceYearly,
                    MaxUsers = plan.MaxUsers ?? 0,
                    MaxStorageMb = plan.MaxStorageMb ?? 0,
                    FeaturesList = GetFeaturesByPlanCode(plan.Code),
                    IsPopular = plan.Code == "pro"
                });
            }

            return result;
        }

        // ✅ COMPLETELY AVOID JSON DESERIALIZATION - Use hardcoded features based on plan code
        private List<string> GetFeaturesByPlanCode(string planCode)
        {
            return planCode?.ToLower() switch
            {
                "basic" => new List<string> {
                    "Up to 5 users",
                    "1GB storage",
                    "Basic support",
                    "Core features",
                    "Email support"
                },
                "pro" => new List<string> {
                    "Up to 50 users",
                    "10GB storage",
                    "Priority support",
                    "Advanced features",
                    "Analytics dashboard",
                    "API access",
                    "Email & Chat support"
                },
                "enterprise" => new List<string> {
                    "Unlimited users",
                    "100GB storage",
                    "24/7 phone support",
                    "Custom features",
                    "Dedicated account manager",
                    "SLA guarantee",
                    "On-premise option"
                },
                _ => new List<string> { "Basic features", "Email support" }
            };
        }

        public async Task<CurrentPlanDto> ChangePlan(long firmId, string planCode, string billingCycle)
        {
            var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Code == planCode && p.IsActive);
            if (plan == null) throw new ArgumentException("Invalid plan");

            var subscription = await _context.FirmSubscriptions.FirstOrDefaultAsync(s => s.FirmId == firmId);
            var isYearly = billingCycle.ToLower() == "yearly";
            var startDate = DateTime.UtcNow;
            var nextBillingDate = isYearly ? startDate.AddYears(1) : startDate.AddMonths(1);

            if (subscription == null)
            {
                subscription = new FirmSubscription
                {
                    FirmId = firmId,
                    PlanId = plan.Id,
                    BillingCycle = isYearly ? "YEARLY" : "MONTHLY",
                    StartDate = startDate,
                    NextBillingDate = nextBillingDate,
                    Status = "ACTIVE",
                    AutoRenew = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.FirmSubscriptions.Add(subscription);
            }
            else
            {
                subscription.PlanId = plan.Id;
                subscription.BillingCycle = isYearly ? "YEARLY" : "MONTHLY";
                subscription.NextBillingDate = nextBillingDate;
                subscription.Status = "ACTIVE";
                subscription.UpdatedAt = DateTime.UtcNow;
            }

            var firm = await _context.Firms.FindAsync(firmId);
            if (firm != null)
            {
                firm.SubscriptionStatus = SubscriptionStatus.ACTIVE;
                firm.MaxUsers = plan.MaxUsers ?? 0;
                firm.MaxStorageMb = plan.MaxStorageMb ?? 0;
            }

            await _context.SaveChangesAsync();
            return await GetCurrentPlan(firmId);
        }

        public async Task<CurrentPlanDto> CancelSubscription(long firmId)
        {
            var subscription = await _context.FirmSubscriptions.FirstOrDefaultAsync(s => s.FirmId == firmId && s.Status == "ACTIVE");
            if (subscription != null)
            {
                subscription.Status = "CANCELLED";
                subscription.AutoRenew = false;
                subscription.UpdatedAt = DateTime.UtcNow;
            }

            var firm = await _context.Firms.FindAsync(firmId);
            if (firm != null) firm.SubscriptionStatus = SubscriptionStatus.CANCELED;

            await _context.SaveChangesAsync();
            return await GetCurrentPlan(firmId);
        }

        public async Task<List<PaymentMethodDto>> GetPaymentMethods(long firmId) => new List<PaymentMethodDto>();

        public async Task<PaymentMethodDto> AddPaymentMethod(long firmId, AddPaymentMethodDto addDto)
        {
            return new PaymentMethodDto
            {
                Id = 1,
                Type = "card",
                LastFour = "4242",
                ExpiryMonth = "12",
                ExpiryYear = "2025",
                CardholderName = "John Doe",
                IsDefault = true
            };
        }

        public async Task<bool> RemovePaymentMethod(long firmId, long paymentMethodId) => true;

        // ==================== User Preferences ====================

        public async Task<UserPreferencesDto> GetUserPreferences(long userId, long firmId)
        {
            var preferences = await _context.UserPreferences.FirstOrDefaultAsync(up => up.UserId == userId && up.FirmId == firmId);

            if (preferences == null)
            {
                preferences = new UserPreference
                {
                    UserId = userId,
                    FirmId = firmId,
                    Theme = "light",
                    Language = "en",
                    NotificationsEnabled = true,
                    EmailNotifications = true,
                    PushNotifications = true,
                    CalendarView = "month",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.UserPreferences.Add(preferences);
                await _context.SaveChangesAsync();
            }

            return new UserPreferencesDto
            {
                Theme = preferences.Theme,
                Language = preferences.Language,
                NotificationsEnabled = preferences.NotificationsEnabled,
                EmailNotifications = preferences.EmailNotifications,
                PushNotifications = preferences.PushNotifications,
                CalendarView = preferences.CalendarView,
                DashboardLayout = null
            };
        }

        public async Task<UserPreferencesDto> UpdateUserPreferences(long userId, long firmId, UpdateUserPreferencesDto updateDto)
        {
            var preferences = await _context.UserPreferences.FirstOrDefaultAsync(up => up.UserId == userId && up.FirmId == firmId);

            if (preferences == null)
            {
                preferences = new UserPreference
                {
                    UserId = userId,
                    FirmId = firmId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserPreferences.Add(preferences);
            }

            if (updateDto.Theme != null) preferences.Theme = updateDto.Theme;
            if (updateDto.Language != null) preferences.Language = updateDto.Language;
            if (updateDto.NotificationsEnabled.HasValue) preferences.NotificationsEnabled = updateDto.NotificationsEnabled.Value;
            if (updateDto.EmailNotifications.HasValue) preferences.EmailNotifications = updateDto.EmailNotifications.Value;
            if (updateDto.PushNotifications.HasValue) preferences.PushNotifications = updateDto.PushNotifications.Value;
            if (updateDto.CalendarView != null) preferences.CalendarView = updateDto.CalendarView;

            preferences.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return await GetUserPreferences(userId, firmId);
        }

        // ==================== Audit Logs ====================

        public async Task<AuditLogsResponseDto> GetAuditLogs(long firmId, int page, int pageSize, string? action, string? entityType)
        {
            var query = _context.AuditLogs.Include(a => a.User).Where(a => a.FirmId == firmId);

            if (!string.IsNullOrEmpty(action)) query = query.Where(a => a.Action == action);
            if (!string.IsNullOrEmpty(entityType)) query = query.Where(a => a.EntityType == entityType);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var auditLogs = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var logs = new List<AuditLogDto>();
            foreach (var a in auditLogs)
            {
                logs.Add(new AuditLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    OldValues = a.OldValues,
                    NewValues = a.NewValues,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}".Trim() : "System",
                    IpAddress = a.IpAddress,
                    CreatedAt = a.CreatedAt
                });
            }

            return new AuditLogsResponseDto
            {
                Logs = logs,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        // ==================== Usage Statistics ====================

        public async Task<int> GetMatterCount(long firmId)
        {
            return await _context.Matters.CountAsync(m => m.FirmId == firmId && m.DeletedAt == null);
        }

        public async Task<int> GetContactCount(long firmId)
        {
            return await _context.Contacts.CountAsync(c => c.FirmId == firmId && c.DeletedAt == null);
        }

        public async Task<long> GetStorageUsed(long firmId)
        {
            var totalBytes = await _context.Documents.Where(d => d.FirmId == firmId).SumAsync(d => d.FileSize);
            return totalBytes / (1024 * 1024);
        }

        public async Task<UsageStatisticsDto> GetUsageStatistics(long firmId)
        {
            var currentUsers = await GetTeamMemberCount(firmId);
            var currentMatters = await GetMatterCount(firmId);
            var currentContacts = await GetContactCount(firmId);
            var currentStorage = await GetStorageUsed(firmId);
            var plan = await GetCurrentPlan(firmId);

            var userLimit = plan.PlanCode == "basic" ? 5 : plan.PlanCode == "pro" ? 50 : 999;
            var matterLimit = plan.PlanCode == "basic" ? 100 : plan.PlanCode == "pro" ? 500 : 9999;
            var contactLimit = plan.PlanCode == "basic" ? 500 : plan.PlanCode == "pro" ? 2000 : 99999;
            var storageLimit = plan.PlanCode == "basic" ? 1024 : plan.PlanCode == "pro" ? 10240 : 102400;

            return new UsageStatisticsDto
            {
                Users = new UserUsageDto
                {
                    Current = currentUsers,
                    Limit = userLimit,
                    Remaining = Math.Max(0, userLimit - currentUsers),
                    Percentage = userLimit > 0 ? (double)currentUsers / userLimit * 100 : 0
                },
                Matters = new MatterUsageDto
                {
                    Current = currentMatters,
                    Limit = matterLimit,
                    Remaining = Math.Max(0, matterLimit - currentMatters),
                    Percentage = matterLimit > 0 ? (double)currentMatters / matterLimit * 100 : 0
                },
                Contacts = new ContactUsageDto
                {
                    Current = currentContacts,
                    Limit = contactLimit,
                    Remaining = Math.Max(0, contactLimit - currentContacts),
                    Percentage = contactLimit > 0 ? (double)currentContacts / contactLimit * 100 : 0
                },
                Storage = new StorageUsageDto
                {
                    CurrentMb = currentStorage,
                    LimitMb = storageLimit,
                    RemainingMb = Math.Max(0, storageLimit - currentStorage),
                    Percentage = storageLimit > 0 ? (double)currentStorage / storageLimit * 100 : 0
                }
            };
        }

        // ==================== Helper Methods ====================

        private string GenerateRandomPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 12).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private string GetRoleDescription(FirmRole role)
        {
            return role switch
            {
                FirmRole.OWNER => "Full access to all firm features and settings",
                FirmRole.ADMIN => "Manage users and firm settings",
                FirmRole.MANAGER => "Manage matters, contacts, and tasks",
                FirmRole.STAFF => "Create and edit matters, contacts, tasks",
                FirmRole.VIEWER => "Read-only access to firm data",
                _ => "Standard user access"
            };
        }

        private List<string> GetPermissionsForRole(FirmRole role)
        {
            return role switch
            {
                FirmRole.OWNER => new List<string> { "*" },
                FirmRole.ADMIN => new List<string> { "user.*", "settings.*", "matter.*", "contact.*", "task.*", "document.*", "calendar.*", "billing.view" },
                FirmRole.MANAGER => new List<string> { "matter.*", "contact.*", "task.*", "document.*", "calendar.*", "billing.view" },
                FirmRole.STAFF => new List<string> { "matter.view", "matter.create", "matter.edit", "contact.view", "contact.create", "contact.edit", "task.*", "document.upload", "calendar.*" },
                FirmRole.VIEWER => new List<string> { "matter.view", "contact.view", "task.view", "document.view", "calendar.view" },
                _ => new List<string>()
            };
        }
    }
}