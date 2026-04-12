// Services/SettingsService.cs
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
    public interface ISettingsService
    {
        // Profile Settings
        Task<UserProfileDto> GetProfile(long userId, long firmId);
        Task<UserProfileDto> UpdateProfile(long userId, long firmId, UpdateProfileDto updateDto);
        Task<string> UploadAvatar(long userId, long firmId, IFormFile file);
        Task<bool> RemoveAvatar(long userId, long firmId);

        // Team Management
        Task<List<UserResponseDto>> GetTeamMembers(long firmId);
        Task<UserResponseDto> UpdateMemberRole(long firmId, long userId, string role);
        Task<bool> RemoveTeamMember(long firmId, long userId);
        Task<List<RoleDto>> GetRoles(long firmId);
        Task<InviteResponseDto> InviteMember(long firmId, long invitedBy, InviteUserDto inviteDto);
        Task<bool> CancelInvitation(long firmId, long userFirmId);

        // Firm Settings
        Task<FirmSettingsDto> GetFirmSettings(long firmId);
        Task<FirmSettingsDto> UpdateFirmSettings(long firmId, UpdateFirmSettingsDto updateDto);
        Task<BrandingDto> GetBranding(long firmId);
        Task<BrandingDto> UpdateBranding(long firmId, UpdateBrandingDto updateDto);

        // Plan & Billing
        Task<SubscriptionDto> GetCurrentPlan(long firmId);
        Task<List<PlanDto>> GetAvailablePlans();
        Task<SubscriptionDto> ChangePlan(long firmId, string planCode, string billingCycle);
        Task<SubscriptionDto> CancelSubscription(long firmId);
        Task<List<PaymentMethodDto>> GetPaymentMethods(long firmId);
        Task<PaymentMethodDto> AddPaymentMethod(long firmId, AddPaymentMethodDto addDto);
        Task<bool> RemovePaymentMethod(long firmId, long paymentMethodId);

        // User Preferences
        Task<UserPreferencesDto> GetUserPreferences(long userId, long firmId);
        Task<UserPreferencesDto> UpdateUserPreferences(long userId, long firmId, UpdateUserPreferencesDto updateDto);

        // Audit Logs
        Task<List<AuditLogDto>> GetAuditLogs(long firmId, int page, int pageSize, string? action, string? entityType);
    }

    public class SettingsService : ISettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;

        public SettingsService(ApplicationDbContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        // Profile Settings
        public async Task<UserProfileDto> GetProfile(long userId, long firmId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
                return null;

            var userFirm = await _context.UserFirms
                .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.FirmId == firmId);

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
                LastLoginAt = user.LastLoginAt
            };
        }

        public async Task<UserProfileDto> UpdateProfile(long userId, long firmId, UpdateProfileDto updateDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

            if (updateDto.FirstName != null)
                user.FirstName = updateDto.FirstName;
            if (updateDto.LastName != null)
                user.LastName = updateDto.LastName;
            if (updateDto.PhoneNumber != null)
                user.PhoneNumber = updateDto.PhoneNumber;

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
                _fileService.DeleteFile(user.ProfileImageUrl);
            }

            var filePath = await _fileService.SaveFile(file, "avatars");
            var avatarUrl = $"/uploads/avatars/{Path.GetFileName(filePath)}";

            user.ProfileImageUrl = avatarUrl;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return avatarUrl;
        }

        public async Task<bool> RemoveAvatar(long userId, long firmId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
            {
                _fileService.DeleteFile(user.ProfileImageUrl);
                user.ProfileImageUrl = null;
                await _context.SaveChangesAsync();
            }

            return true;
        }

        // Team Management
        public async Task<List<UserResponseDto>> GetTeamMembers(long firmId)
        {
            var members = await _context.UserFirms
                .Include(uf => uf.User)
                .Where(uf => uf.FirmId == firmId)
                .Select(uf => new UserResponseDto
                {
                    Id = uf.UserId,
                    Email = uf.User != null ? uf.User.Email : string.Empty,
                    FirstName = uf.User != null ? uf.User.FirstName : string.Empty,
                    LastName = uf.User != null ? uf.User.LastName : string.Empty,
                    FullName = uf.User != null ? $"{uf.User.FirstName} {uf.User.LastName}".Trim() : string.Empty,
                    PhoneNumber = uf.User != null ? uf.User.PhoneNumber : null,
                    IsActive = uf.User != null && uf.User.IsActive,
                    LastLoginAt = uf.User != null ? uf.User.LastLoginAt : null,
                    FirmRole = uf.Role.ToString(),
                    Status = uf.Status.ToString(),
                    JoinedAt = uf.JoinedAt,
                    InvitedAt = uf.InvitedAt
                })
                .ToListAsync();

            return members;
        }

        public async Task<UserResponseDto> UpdateMemberRole(long firmId, long userId, string role)
        {
            var userFirm = await _context.UserFirms
                .FirstOrDefaultAsync(uf => uf.FirmId == firmId && uf.UserId == userId);

            if (userFirm == null)
                throw new KeyNotFoundException("Team member not found");

            if (!Enum.TryParse<FirmRole>(role, true, out var newRole))
                throw new ArgumentException("Invalid role");

            userFirm.Role = newRole;
            userFirm.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var members = await GetTeamMembers(firmId);
            return members.First(m => m.Id == userId);
        }

        public async Task<bool> RemoveTeamMember(long firmId, long userId)
        {
            var userFirm = await _context.UserFirms
                .FirstOrDefaultAsync(uf => uf.FirmId == firmId && uf.UserId == userId);

            if (userFirm == null)
                return false;

            // Cannot remove the owner
            if (userFirm.Role == FirmRole.OWNER)
                throw new InvalidOperationException("Cannot remove the firm owner");

            userFirm.Status = UserFirmStatus.REMOVED;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<RoleDto>> GetRoles(long firmId)
        {
            var roles = Enum.GetValues<FirmRole>()
                .Select(r => new RoleDto
                {
                    Name = r.ToString(),
                    Description = GetRoleDescription(r),
                    Permissions = GetPermissionsForRole(r)
                })
                .ToList();

            return roles;
        }

        public async Task<InviteResponseDto> InviteMember(long firmId, long invitedBy, InviteUserDto inviteDto)
        {
            // Check if user already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == inviteDto.Email);

            long userId;

            if (existingUser != null)
            {
                userId = existingUser.Id;
                
                // Check if already a member
                var existingMember = await _context.UserFirms
                    .AnyAsync(uf => uf.UserId == userId && uf.FirmId == firmId);
                    
                if (existingMember)
                    throw new InvalidOperationException("User is already a member of this firm");
            }
            else
            {
                // Create new user
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

                // Send welcome email
                await SendWelcomeEmail(inviteDto.Email, tempPassword, inviteDto.FirstName);
            }

            // Parse role
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

            // Send invitation email
            await SendInvitationEmail(inviteDto.Email, inviteDto.FirstName, firmId);

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
            var userFirm = await _context.UserFirms
                .FirstOrDefaultAsync(uf => uf.Id == userFirmId && uf.FirmId == firmId);

            if (userFirm == null)
                return false;

            _context.UserFirms.Remove(userFirm);
            await _context.SaveChangesAsync();

            return true;
        }

        // Firm Settings
        public async Task<FirmSettingsDto> GetFirmSettings(long firmId)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            var settings = await _context.FirmSettings
                .FirstOrDefaultAsync(fs => fs.FirmId == firmId);

            if (settings == null)
            {
                settings = new FirmSetting { FirmId = firmId };
                _context.FirmSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return new FirmSettingsDto
            {
                FirmId = firm.Id,
                FirmName = firm.Name,
                LegalName = firm.LegalName,
                RegistrationNumber = firm.RegistrationNumber,
                TaxNumber = firm.TaxNumber,
                Email = firm.Email,
                Phone = firm.Phone,
                Website = firm.Website,
                AddressLine1 = firm.AddressLine1,
                AddressLine2 = firm.AddressLine2,
                City = firm.City,
                State = firm.State,
                PostalCode = firm.PostalCode,
                Country = firm.Country,
                Timezone = settings.Timezone,
                DateFormat = settings.DateFormat,
                TimeFormat = settings.TimeFormat,
                Currency = settings.Currency,
                FiscalYearStart = settings.FiscalYearStart,
                InvoicePrefix = settings.InvoicePrefix,
                MatterPrefix = settings.MatterPrefix,
                EmailSignature = settings.EmailSignature
            };
        }

        public async Task<FirmSettingsDto> UpdateFirmSettings(long firmId, UpdateFirmSettingsDto updateDto)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            var settings = await _context.FirmSettings
                .FirstOrDefaultAsync(fs => fs.FirmId == firmId);

            if (settings == null)
            {
                settings = new FirmSetting { FirmId = firmId };
                _context.FirmSettings.Add(settings);
            }

            if (updateDto.FirmName != null)
                firm.Name = updateDto.FirmName;
            if (updateDto.LegalName != null)
                firm.LegalName = updateDto.LegalName;
            if (updateDto.RegistrationNumber != null)
                firm.RegistrationNumber = updateDto.RegistrationNumber;
            if (updateDto.TaxNumber != null)
                firm.TaxNumber = updateDto.TaxNumber;
            if (updateDto.Email != null)
                firm.Email = updateDto.Email;
            if (updateDto.Phone != null)
                firm.Phone = updateDto.Phone;
            if (updateDto.Website != null)
                firm.Website = updateDto.Website;
            if (updateDto.AddressLine1 != null)
                firm.AddressLine1 = updateDto.AddressLine1;
            if (updateDto.AddressLine2 != null)
                firm.AddressLine2 = updateDto.AddressLine2;
            if (updateDto.City != null)
                firm.City = updateDto.City;
            if (updateDto.State != null)
                firm.State = updateDto.State;
            if (updateDto.PostalCode != null)
                firm.PostalCode = updateDto.PostalCode;
            if (updateDto.Country != null)
                firm.Country = updateDto.Country;

            if (updateDto.Timezone != null)
                settings.Timezone = updateDto.Timezone;
            if (updateDto.DateFormat != null)
                settings.DateFormat = updateDto.DateFormat;
            if (updateDto.TimeFormat != null)
                settings.TimeFormat = updateDto.TimeFormat;
            if (updateDto.Currency != null)
                settings.Currency = updateDto.Currency;
            if (updateDto.FiscalYearStart.HasValue)
                settings.FiscalYearStart = updateDto.FiscalYearStart;
            if (updateDto.InvoicePrefix != null)
                settings.InvoicePrefix = updateDto.InvoicePrefix;
            if (updateDto.MatterPrefix != null)
                settings.MatterPrefix = updateDto.MatterPrefix;
            if (updateDto.EmailSignature != null)
                settings.EmailSignature = updateDto.EmailSignature;

            firm.UpdatedAt = DateTime.UtcNow;
            settings.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetFirmSettings(firmId);
        }

        public async Task<BrandingDto> GetBranding(long firmId)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            
            return new BrandingDto
            {
                LogoUrl = firm.LogoUrl,
                PrimaryColor = null, // Would come from a branding table
                SecondaryColor = null
            };
        }

        public async Task<BrandingDto> UpdateBranding(long firmId, UpdateBrandingDto updateDto)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            
            if (updateDto.LogoFile != null)
            {
                // Delete old logo
                if (!string.IsNullOrEmpty(firm.LogoUrl))
                {
                    _fileService.DeleteFile(firm.LogoUrl);
                }
                
                var filePath = await _fileService.SaveFile(updateDto.LogoFile, "branding");
                firm.LogoUrl = $"/uploads/branding/{Path.GetFileName(filePath)}";
            }
            
            await _context.SaveChangesAsync();
            
            return new BrandingDto
            {
                LogoUrl = firm.LogoUrl,
                PrimaryColor = updateDto.PrimaryColor,
                SecondaryColor = updateDto.SecondaryColor
            };
        }

        // Plan & Billing
        public async Task<SubscriptionDto> GetCurrentPlan(long firmId)
        {
            var subscription = await _context.FirmSubscriptions
                .Include(s => s.Plan)
                .FirstOrDefaultAsync(s => s.FirmId == firmId);

            var firm = await _context.Firms.FindAsync(firmId);

            if (subscription == null)
            {
                return new SubscriptionDto
                {
                    PlanName = "Free",
                    PlanCode = "free",
                    Status = firm.SubscriptionStatus.ToString(),
                    BillingCycle = "N/A",
                    StartDate = firm.CreatedAt,
                    NextBillingDate = null,
                    EndDate = firm.TrialEndDate,
                    AutoRenew = false,
                    Features = new List<string> { "Up to 5 users", "Basic support" }
                };
            }

            var features = new List<string>();
            if (!string.IsNullOrEmpty(subscription.Plan?.Features))
            {
                var deserialized = System.Text.Json.JsonSerializer.Deserialize<List<string>>(subscription.Plan.Features);
                features = deserialized ?? new List<string>();
            }

            return new SubscriptionDto
            {
                PlanName = subscription.Plan?.Name ?? "Basic",
                PlanCode = subscription.Plan?.Code ?? "basic",
                Status = subscription.Status,
                BillingCycle = subscription.BillingCycle,
                StartDate = subscription.StartDate,
                NextBillingDate = subscription.NextBillingDate,
                EndDate = subscription.EndDate,
                AutoRenew = subscription.AutoRenew,
                Features = features
            };
        }

        public async Task<List<PlanDto>> GetAvailablePlans()
        {
            var plans = await _context.SubscriptionPlans
                .Where(p => p.IsActive)
                .ToListAsync();

            return plans.Select(p => new PlanDto
            {
                Id = p.Id,
                Name = p.Name,
                Code = p.Code,
                Description = p.Description,
                PriceMonthly = p.PriceMonthly,
                PriceYearly = p.PriceYearly,
                MaxUsers = p.MaxUsers,
                MaxMatters = p.MaxMatters,
                MaxContacts = p.MaxContacts,
                MaxStorageMb = p.MaxStorageMb,
                Features = !string.IsNullOrEmpty(p.Features)
                    ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(p.Features) ?? new List<string>()
                    : new List<string>(),
                IsPopular = p.Code == "pro"
            }).ToList();
        }

        public async Task<SubscriptionDto> ChangePlan(long firmId, string planCode, string billingCycle)
        {
            var plan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Code == planCode && p.IsActive);

            if (plan == null)
                throw new ArgumentException("Invalid plan");

            var subscription = await _context.FirmSubscriptions
                .FirstOrDefaultAsync(s => s.FirmId == firmId);

            var isYearly = billingCycle.ToLower() == "yearly";
            var price = isYearly ? plan.PriceYearly : plan.PriceMonthly;
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
            firm.SubscriptionStatus = SubscriptionStatus.ACTIVE;
            firm.MaxUsers = plan.MaxUsers ?? 0;
            firm.MaxStorageMb = plan.MaxStorageMb ?? 0;

            await _context.SaveChangesAsync();

            return await GetCurrentPlan(firmId);
        }

        public async Task<SubscriptionDto> CancelSubscription(long firmId)
        {
            var subscription = await _context.FirmSubscriptions
                .FirstOrDefaultAsync(s => s.FirmId == firmId);

            if (subscription != null)
            {
                subscription.Status = "CANCELED";
                subscription.AutoRenew = false;
                subscription.UpdatedAt = DateTime.UtcNow;
            }

            var firm = await _context.Firms.FindAsync(firmId);
            firm.SubscriptionStatus = SubscriptionStatus.CANCELED;
            firm.SubscriptionEndDate = DateTime.UtcNow.AddDays(30); // Grace period

            await _context.SaveChangesAsync();

            return await GetCurrentPlan(firmId);
        }

        public async Task<List<PaymentMethodDto>> GetPaymentMethods(long firmId)
        {
            // Implementation would get saved payment methods from payment provider
            return new List<PaymentMethodDto>();
        }

        public async Task<PaymentMethodDto> AddPaymentMethod(long firmId, AddPaymentMethodDto addDto)
        {
            // Implementation would add payment method via payment provider
            return new PaymentMethodDto
            {
                Id = 1,
                Type = addDto.Type,
                Last4 = addDto.Last4,
                ExpiryMonth = addDto.ExpiryMonth,
                ExpiryYear = addDto.ExpiryYear,
                IsDefault = addDto.IsDefault
            };
        }

        public async Task<bool> RemovePaymentMethod(long firmId, long paymentMethodId)
        {
            // Implementation would remove payment method via payment provider
            return true;
        }

        // User Preferences
        public async Task<UserPreferencesDto> GetUserPreferences(long userId, long firmId)
        {
            var preferences = await _context.UserPreferences
                .FirstOrDefaultAsync(up => up.UserId == userId && up.FirmId == firmId);

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
                DashboardLayout = preferences.DashboardLayout != null 
                    ? System.Text.Json.JsonSerializer.Deserialize<DashboardLayoutDto>(preferences.DashboardLayout)
                    : null
            };
        }

        public async Task<UserPreferencesDto> UpdateUserPreferences(long userId, long firmId, UpdateUserPreferencesDto updateDto)
        {
            var preferences = await _context.UserPreferences
                .FirstOrDefaultAsync(up => up.UserId == userId && up.FirmId == firmId);

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

            if (updateDto.Theme != null)
                preferences.Theme = updateDto.Theme;
            if (updateDto.Language != null)
                preferences.Language = updateDto.Language;
            if (updateDto.NotificationsEnabled.HasValue)
                preferences.NotificationsEnabled = updateDto.NotificationsEnabled.Value;
            if (updateDto.EmailNotifications.HasValue)
                preferences.EmailNotifications = updateDto.EmailNotifications.Value;
            if (updateDto.PushNotifications.HasValue)
                preferences.PushNotifications = updateDto.PushNotifications.Value;
            if (updateDto.CalendarView != null)
                preferences.CalendarView = updateDto.CalendarView;
            if (updateDto.DashboardLayout != null)
                preferences.DashboardLayout = System.Text.Json.JsonSerializer.Serialize(updateDto.DashboardLayout);

            preferences.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetUserPreferences(userId, firmId);
        }

        // Audit Logs
        public async Task<List<AuditLogDto>> GetAuditLogs(long firmId, int page, int pageSize, string? action, string? entityType)
        {
            var query = _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.FirmId == firmId);

            if (!string.IsNullOrEmpty(action))
                query = query.Where(a => a.Action == action);

            if (!string.IsNullOrEmpty(entityType))
                query = query.Where(a => a.EntityType == entityType);

            var logs = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogDto
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
                })
                .ToListAsync();

            return logs;
        }

        // Helper Methods
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

        private async Task SendWelcomeEmail(string email, string tempPassword, string name)
        {
            // Implementation would send email via email service
        }

        private async Task SendInvitationEmail(string email, string name, long firmId)
        {
            // Implementation would send email via email service
        }
    }
}