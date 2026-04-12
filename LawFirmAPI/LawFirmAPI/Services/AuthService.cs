// Services/AuthService.cs - FULLY FIXED VERSION

using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;
using LawFirmAPI.Helpers;

namespace LawFirmAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> Register(RegisterDto registerDto, string ipAddress);
        Task<AuthResponseDto> CreateFirmAndSubscribe(long userId, CreateFirmDto createFirmDto, string ipAddress);
        Task<AuthResponseDto> Login(LoginDto loginDto, string ipAddress);
        Task<AuthResponseDto> SwitchFirm(SwitchFirmDto switchFirmDto, string ipAddress);
        Task<AuthResponseDto> RefreshToken(string refreshToken, string ipAddress);
        Task Logout(string refreshToken);
        Task<UserProfileDto> GetProfile(long userId, long firmId);
        Task<bool> UpdateProfile(long userId, UpdateProfileDto profileDto);
        Task<bool> ChangePassword(long userId, ChangePasswordDto changePasswordDto);
        Task<bool> ForgotPassword(string email);
        Task<bool> ResetPassword(ResetPasswordDto resetPasswordDto);
        Task<bool> VerifyEmail(string token);
        Task<bool> ResendVerification(string email);
        Task<UserResponseDto> InviteUser(long firmId, long invitedBy, InviteUserDto inviteDto);
        Task<AuthResponseDto> AcceptInvite(AcceptInviteDto acceptInviteDto, string ipAddress);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtHelper _jwtHelper;
        private readonly IEmailService _emailService;
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _configuration;

        public AuthService(
            ApplicationDbContext context,
            IJwtHelper jwtHelper,
            IEmailService emailService,
            IPaymentService paymentService,
            IConfiguration configuration)
        {
            _context = context;
            _jwtHelper = jwtHelper;
            _emailService = emailService;
            _paymentService = paymentService;
            _configuration = configuration;
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        private string GenerateTemporaryAccessToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? "your-super-secret-key-with-minimum-32-characters-long");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("isTemporary", "true"),
                new Claim("requiresFirmCreation", "true"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateFullAccessToken(User user, Firm firm, string role)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"] ?? "your-super-secret-key-with-minimum-32-characters-long");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("firmId", firm.Id.ToString()),
                new Claim("firmName", firm.Name),
                new Claim(ClaimTypes.Role, role),
                new Claim("isTemporary", "false"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<AuthResponseDto> GenerateAuthResponse(User user, Firm firm, string ipAddress)
        {
            var userFirm = await _context.UserFirms
                .FirstOrDefaultAsync(uf => uf.UserId == user.Id && uf.FirmId == firm.Id && uf.Status == UserFirmStatus.ACTIVE);

            var role = userFirm?.Role.ToString() ?? "VIEWER";

            var accessToken = GenerateFullAccessToken(user, firm, role);
            var refreshToken = _jwtHelper.GenerateRefreshToken();

            // Revoke any existing temporary tokens
            var existingTempTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == user.Id && rt.FirmId == null)
                .ToListAsync();
            foreach (var token in existingTempTokens)
            {
                token.Revoked = true;
            }

            // Save refresh token
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                FirmId = firm.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedByIp = ipAddress
            };

            _context.RefreshTokens.Add(refreshTokenEntity);

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            user.LastLoginIp = ipAddress;

            await _context.SaveChangesAsync();

            // Get all firms for user
            var userFirms = await _context.UserFirms
                .Include(uf => uf.Firm)
                .Where(uf => uf.UserId == user.Id && uf.Status == UserFirmStatus.ACTIVE)
                .Select(uf => new FirmBasicDto
                {
                    Id = uf.FirmId,
                    Name = uf.Firm != null ? uf.Firm.Name : string.Empty,
                    LogoUrl = uf.Firm != null ? uf.Firm.LogoUrl : null,
                    Role = uf.Role.ToString(),
                    IsPrimary = uf.IsPrimary
                })
                .ToListAsync();

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = 86400,
                User = new UserProfileDto
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
                    Roles = new List<string> { role }
                },
                Firms = userFirms,
                CurrentFirm = new FirmBasicDto
                {
                    Id = firm.Id,
                    Name = firm.Name,
                    LogoUrl = firm.LogoUrl,
                    Role = role,
                    IsPrimary = userFirm?.IsPrimary ?? false
                },
                RequiresFirmCreation = false
            };
        }

        public async Task<AuthResponseDto> Register(RegisterDto registerDto, string ipAddress)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == registerDto.Email || u.Username == registerDto.Username);

            if (existingUser != null)
                return null;

            var user = new User
            {
                Email = registerDto.Email,
                Username = registerDto.Username,
                PasswordHash = HashPassword(registerDto.Password),
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PhoneNumber = registerDto.PhoneNumber,
                IsEmailVerified = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var verificationToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            var emailVerification = new EmailVerification
            {
                UserId = user.Id,
                Token = verificationToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            _context.EmailVerifications.Add(emailVerification);
            await _context.SaveChangesAsync();

            _ = Task.Run(() => _emailService.SendVerificationEmail(user.Email, verificationToken));

            var accessToken = GenerateTemporaryAccessToken(user);
            var refreshToken = _jwtHelper.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                FirmId = null,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedByIp = ipAddress
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresIn = 86400,
                User = new UserProfileDto
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
                },
                Firms = new List<FirmBasicDto>(),
                CurrentFirm = null,
                RequiresFirmCreation = true
            };
        }

        public async Task<AuthResponseDto> CreateFirmAndSubscribe(long userId, CreateFirmDto createFirmDto, string ipAddress)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

            var plan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Code == createFirmDto.PlanCode && p.IsActive);

            if (plan == null)
                plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Code == "basic");

            var firm = new Firm
            {
                Name = createFirmDto.FirmName,
                LegalName = createFirmDto.LegalName,
                RegistrationNumber = createFirmDto.RegistrationNumber,
                TaxNumber = createFirmDto.TaxNumber,
                Email = createFirmDto.Email,
                Phone = createFirmDto.Phone,
                Website = createFirmDto.Website,
                AddressLine1 = createFirmDto.AddressLine1,
                AddressLine2 = createFirmDto.AddressLine2,
                City = createFirmDto.City,
                State = createFirmDto.State,
                PostalCode = createFirmDto.PostalCode,
                Country = createFirmDto.Country,
                SubscriptionStatus = createFirmDto.PlanCode == "basic" ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
                TrialEndDate = createFirmDto.PlanCode == "basic" ? DateTime.UtcNow.AddDays(14) : null,
                MaxUsers = plan?.MaxUsers ?? 5,
                MaxStorageMb = plan?.MaxStorageMb ?? 1000,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Firms.Add(firm);
            await _context.SaveChangesAsync();

            var firmSetting = new FirmSetting
            {
                FirmId = firm.Id
            };
            _context.FirmSettings.Add(firmSetting);

            var userFirm = new UserFirm
            {
                UserId = userId,
                FirmId = firm.Id,
                Role = FirmRole.OWNER,
                IsPrimary = true,
                Status = UserFirmStatus.ACTIVE,
                JoinedAt = DateTime.UtcNow
            };
            _context.UserFirms.Add(userFirm);

            var isYearly = createFirmDto.BillingCycle?.ToLower() == "yearly";
            var startDate = DateTime.UtcNow;
            var nextBillingDate = isYearly ? startDate.AddYears(1) : startDate.AddMonths(1);

            var subscription = new FirmSubscription
            {
                FirmId = firm.Id,
                PlanId = plan.Id,
                BillingCycle = isYearly ? "YEARLY" : "MONTHLY",
                StartDate = startDate,
                NextBillingDate = nextBillingDate,
                Status = createFirmDto.PlanCode == "basic" ? "TRIAL" : "ACTIVE",
                AutoRenew = true
            };
            _context.FirmSubscriptions.Add(subscription);

            await _context.SaveChangesAsync();

            if (createFirmDto.PlanCode != "basic")
            {
                await _paymentService.CreateSubscription(firm, plan, isYearly);
            }

            return await GenerateAuthResponse(user, firm, ipAddress);
        }

        public async Task<AuthResponseDto> Login(LoginDto loginDto, string ipAddress)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => (u.Email == loginDto.EmailOrUsername || u.Username == loginDto.EmailOrUsername) && u.IsActive);

            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
                return null;

            if (user.IsLocked && user.LockoutEndDate > DateTime.UtcNow)
                return null;

            var userFirms = await _context.UserFirms
                .Where(uf => uf.UserId == user.Id && uf.Status == UserFirmStatus.ACTIVE)
                .ToListAsync();

            if (!userFirms.Any())
            {
                var tempAccessToken = GenerateTemporaryAccessToken(user);
                var tempRefreshToken = _jwtHelper.GenerateRefreshToken();

                var refreshTokenEntity = new RefreshToken
                {
                    UserId = user.Id,
                    FirmId = null,
                    Token = tempRefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    CreatedByIp = ipAddress
                };

                _context.RefreshTokens.Add(refreshTokenEntity);
                user.LastLoginAt = DateTime.UtcNow;
                user.LastLoginIp = ipAddress;
                await _context.SaveChangesAsync();

                return new AuthResponseDto
                {
                    AccessToken = tempAccessToken,
                    RefreshToken = tempRefreshToken,
                    ExpiresIn = 86400,
                    User = new UserProfileDto
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
                    },
                    Firms = new List<FirmBasicDto>(),
                    CurrentFirm = null,
                    RequiresFirmCreation = true
                };
            }

            Firm firm;
            UserFirm selectedUserFirm;

            if (loginDto.FirmId.HasValue)
            {
                selectedUserFirm = userFirms.FirstOrDefault(uf => uf.FirmId == loginDto.FirmId.Value);
                if (selectedUserFirm == null)
                    throw new UnauthorizedAccessException("User does not have access to this firm");
            }
            else
            {
                if (userFirms.Count > 1)
                {
                    var firms = await _context.UserFirms
                        .Include(uf => uf.Firm)
                        .Where(uf => uf.UserId == user.Id && uf.Status == UserFirmStatus.ACTIVE)
                        .Select(uf => new FirmBasicDto
                        {
                            Id = uf.FirmId,
                            Name = uf.Firm.Name,
                            LogoUrl = uf.Firm.LogoUrl,
                            Role = uf.Role.ToString(),
                            IsPrimary = uf.IsPrimary
                        })
                        .ToListAsync();

                    return new AuthResponseDto
                    {
                        AccessToken = null,
                        RefreshToken = null,
                        User = new UserProfileDto
                        {
                            Id = user.Id,
                            Email = user.Email,
                            Username = user.Username,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            FullName = $"{user.FirstName} {user.LastName}".Trim(),
                        },
                        Firms = firms,
                        CurrentFirm = null,
                        RequiresFirmSelection = true
                    };
                }

                selectedUserFirm = userFirms.First();
            }

            firm = await _context.Firms.FindAsync(selectedUserFirm.FirmId);

            if (firm == null || !firm.IsActive)
                throw new UnauthorizedAccessException("Firm is not active");

            return await GenerateAuthResponse(user, firm, ipAddress);
        }

        public async Task<AuthResponseDto> SwitchFirm(SwitchFirmDto switchFirmDto, string ipAddress)
        {
            // TODO: Implement switch firm logic
            throw new NotImplementedException("SwitchFirm implementation needed");
        }

        public async Task<AuthResponseDto> RefreshToken(string refreshToken, string ipAddress)
        {
            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .Include(rt => rt.Firm)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.Revoked);

            if (storedToken == null || storedToken.IsExpired)
                return null;

            var user = storedToken.User;
            if (user == null || !user.IsActive)
                return null;

            // Revoke old token
            storedToken.Revoked = true;

            // If no firm associated, return temporary token
            if (storedToken.FirmId == null)
            {
                var newTempAccessToken = GenerateTemporaryAccessToken(user);
                var newTempRefreshToken = _jwtHelper.GenerateRefreshToken();

                var newRefreshTokenEntity = new RefreshToken
                {
                    UserId = user.Id,
                    FirmId = null,
                    Token = newTempRefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    CreatedByIp = ipAddress,
                    ReplacedByToken = refreshToken
                };

                _context.RefreshTokens.Add(newRefreshTokenEntity);
                await _context.SaveChangesAsync();

                return new AuthResponseDto
                {
                    AccessToken = newTempAccessToken,
                    RefreshToken = newTempRefreshToken,
                    ExpiresIn = 86400,
                    User = new UserProfileDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        FullName = $"{user.FirstName} {user.LastName}".Trim(),
                        PhoneNumber = user.PhoneNumber,
                        IsEmailVerified = user.IsEmailVerified
                    },
                    Firms = new List<FirmBasicDto>(),
                    CurrentFirm = null,
                    RequiresFirmCreation = true
                };
            }

            // Has firm - generate full token
            var firm = storedToken.Firm;
            if (firm == null || !firm.IsActive)
                return null;

            var userFirm = await _context.UserFirms
                .FirstOrDefaultAsync(uf => uf.UserId == user.Id && uf.FirmId == firm.Id);

            var role = userFirm?.Role.ToString() ?? "VIEWER";

            var newFullAccessToken = GenerateFullAccessToken(user, firm, role);
            var newFullRefreshToken = _jwtHelper.GenerateRefreshToken();

            var newRefreshTokenEntity2 = new RefreshToken
            {
                UserId = user.Id,
                FirmId = firm.Id,
                Token = newFullRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedByIp = ipAddress,
                ReplacedByToken = refreshToken
            };

            _context.RefreshTokens.Add(newRefreshTokenEntity2);
            await _context.SaveChangesAsync();

            var userFirms = await _context.UserFirms
                .Include(uf => uf.Firm)
                .Where(uf => uf.UserId == user.Id && uf.Status == UserFirmStatus.ACTIVE)
                .Select(uf => new FirmBasicDto
                {
                    Id = uf.FirmId,
                    Name = uf.Firm != null ? uf.Firm.Name : string.Empty,
                    LogoUrl = uf.Firm != null ? uf.Firm.LogoUrl : null,
                    Role = uf.Role.ToString(),
                    IsPrimary = uf.IsPrimary
                })
                .ToListAsync();

            return new AuthResponseDto
            {
                AccessToken = newFullAccessToken,
                RefreshToken = newFullRefreshToken,
                ExpiresIn = 86400,
                User = new UserProfileDto
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
                    Roles = new List<string> { role }
                },
                Firms = userFirms,
                CurrentFirm = new FirmBasicDto
                {
                    Id = firm.Id,
                    Name = firm.Name,
                    LogoUrl = firm.LogoUrl,
                    Role = role,
                    IsPrimary = userFirm?.IsPrimary ?? false
                },
                RequiresFirmCreation = false
            };
        }

        public async Task Logout(string refreshToken)
        {
            var token = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (token != null)
            {
                token.Revoked = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<UserProfileDto> GetProfile(long userId, long firmId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

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

        public async Task<bool> UpdateProfile(long userId, UpdateProfileDto profileDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            if (profileDto.FirstName != null)
                user.FirstName = profileDto.FirstName;
            if (profileDto.LastName != null)
                user.LastName = profileDto.LastName;
            if (profileDto.PhoneNumber != null)
                user.PhoneNumber = profileDto.PhoneNumber;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ChangePassword(long userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            if (!VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = HashPassword(changePasswordDto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ForgotPassword(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return true;

            var resetToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            var passwordReset = new PasswordReset
            {
                UserId = user.Id,
                Token = resetToken,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            _context.PasswordResets.Add(passwordReset);
            await _context.SaveChangesAsync();

            await _emailService.SendPasswordResetEmail(user.Email, resetToken);

            return true;
        }

        public async Task<bool> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            var passwordReset = await _context.PasswordResets
                .FirstOrDefaultAsync(pr => pr.Token == resetPasswordDto.Token && !pr.Used && pr.ExpiresAt > DateTime.UtcNow);

            if (passwordReset == null)
                return false;

            var user = await _context.Users.FindAsync(passwordReset.UserId);
            if (user == null || user.Email != resetPasswordDto.Email)
                return false;

            user.PasswordHash = HashPassword(resetPasswordDto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            passwordReset.Used = true;
            passwordReset.UsedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> VerifyEmail(string token)
        {
            var verification = await _context.EmailVerifications
                .FirstOrDefaultAsync(ev => ev.Token == token && ev.ExpiresAt > DateTime.UtcNow);

            if (verification == null || verification.VerifiedAt != null)
                return false;

            var user = await _context.Users.FindAsync(verification.UserId);
            if (user == null)
                return false;

            user.IsEmailVerified = true;
            verification.VerifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ResendVerification(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || user.IsEmailVerified)
                return true;

            var existingVerification = await _context.EmailVerifications
                .FirstOrDefaultAsync(ev => ev.UserId == user.Id);

            if (existingVerification != null)
                _context.EmailVerifications.Remove(existingVerification);

            var newToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            var newVerification = new EmailVerification
            {
                UserId = user.Id,
                Token = newToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            _context.EmailVerifications.Add(newVerification);
            await _context.SaveChangesAsync();

            await _emailService.SendVerificationEmail(user.Email, newToken);

            return true;
        }

        public async Task<UserResponseDto> InviteUser(long firmId, long invitedBy, InviteUserDto inviteDto)
        {
            // ✅ Validate firmId is not zero
            if (firmId == 0)
                throw new InvalidOperationException("Invalid firm ID. Please create a firm first before inviting members.");

            // ✅ Verify the firm exists
            var firm = await _context.Firms.FindAsync(firmId);
            if (firm == null)
                throw new InvalidOperationException($"Firm with ID {firmId} does not exist. Please create a firm first.");

            // Rest of the code remains the same...
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == inviteDto.Email);

            long userId;
            bool isNewUser = false;

            if (existingUser != null)
            {
                userId = existingUser.Id;

                var existingMember = await _context.UserFirms
                    .AnyAsync(uf => uf.UserId == userId && uf.FirmId == firmId);

                if (existingMember)
                    throw new InvalidOperationException("User is already a member of this firm");
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
                isNewUser = true;

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

            return new UserResponseDto
            {
                Id = userId,
                Email = inviteDto.Email,
                FirstName = inviteDto.FirstName,
                LastName = inviteDto.LastName,
                FullName = $"{inviteDto.FirstName} {inviteDto.LastName}".Trim(),
                FirmRole = role.ToString(),
                Status = UserFirmStatus.PENDING.ToString(),
            };
        }


        public async Task<AuthResponseDto> AcceptInvite(AcceptInviteDto acceptInviteDto, string ipAddress)
        {
            // Find the pending invitation
            var pendingUserFirm = await _context.UserFirms
                .Include(uf => uf.Firm)
                .FirstOrDefaultAsync(uf => uf.User.Email == acceptInviteDto.Email && uf.Status == UserFirmStatus.PENDING);

            if (pendingUserFirm == null)
                return null;

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == acceptInviteDto.Email);

            if (user == null)
                return null;

            // Update user name if provided
            if (!string.IsNullOrEmpty(acceptInviteDto.FirstName))
                user.FirstName = acceptInviteDto.FirstName;
            if (!string.IsNullOrEmpty(acceptInviteDto.LastName))
                user.LastName = acceptInviteDto.LastName;

            // Activate the membership
            pendingUserFirm.Status = UserFirmStatus.ACTIVE;
            pendingUserFirm.JoinedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Generate full auth response with firm context
            var firm = pendingUserFirm.Firm;
            return await GenerateAuthResponse(user, firm, ipAddress);
        }

        private string GenerateRandomPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 12).Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}