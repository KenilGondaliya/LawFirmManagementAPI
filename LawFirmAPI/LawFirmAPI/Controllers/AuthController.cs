// Controllers/AuthController.cs
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawFirmAPI.Models.DTOs;
using LawFirmAPI.Services;
using LawFirmAPI.Helpers;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IFirmContextService _firmContextService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthController(
            IAuthService authService,
            IFirmContextService firmContextService,
            IHttpContextAccessor httpContextAccessor)
        {
            _authService = authService;
            _firmContextService = firmContextService;
            _httpContextAccessor = httpContextAccessor;
        }

        private string GetIpAddress()
        {
            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            if (string.IsNullOrEmpty(ip) || ip == "::1")
                ip = "127.0.0.1";
            return ip;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.Register(registerDto, GetIpAddress());

            if (result == null)
                return BadRequest(new { message = "User already exists" });

            return Ok(result);
        }

        [HttpPost("create-firm")]
        [Authorize]
        public async Task<IActionResult> CreateFirm([FromBody] CreateFirmDto createFirmDto)
        {
            var userId = long.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _authService.CreateFirmAndSubscribe(userId, createFirmDto, GetIpAddress());

            if (result == null)
                return BadRequest(new { message = "Failed to create firm" });

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.Login(loginDto, GetIpAddress());

            if (result == null)
                return Unauthorized(new { message = "Invalid email/username or password" });

            return Ok(result);
        }

        [HttpPost("switch-firm")]
        [Authorize]
        public async Task<IActionResult> SwitchFirm([FromBody] SwitchFirmDto switchFirmDto)
        {
            var result = await _authService.SwitchFirm(switchFirmDto, GetIpAddress());

            if (result == null)
                return Unauthorized(new { message = "Unable to switch firm" });

            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            var result = await _authService.RefreshToken(refreshTokenDto.RefreshToken, GetIpAddress());

            if (result == null)
                return Unauthorized(new { message = "Invalid refresh token" });

            return Ok(result);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenDto refreshTokenDto)
        {
            await _authService.Logout(refreshTokenDto.RefreshToken);
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = long.Parse(User.FindFirst("userId")?.Value ?? "0");
            var firmId = long.Parse(User.FindFirst("firmId")?.Value ?? "0");
            var profile = await _authService.GetProfile(userId, firmId);

            if (profile == null)
                return NotFound();

            return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto profileDto)
        {
            var userId = long.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _authService.UpdateProfile(userId, profileDto);

            if (!result)
                return NotFound();

            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = long.Parse(User.FindFirst("userId")?.Value ?? "0");
            var result = await _authService.ChangePassword(userId, changePasswordDto);

            if (!result)
                return BadRequest(new { message = "Current password is incorrect" });

            return Ok(new { message = "Password changed successfully" });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            await _authService.ForgotPassword(forgotPasswordDto.Email);
            return Ok(new { message = "If your email is registered, you will receive a password reset link" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.ResetPassword(resetPasswordDto);

            if (!result)
                return BadRequest(new { message = "Invalid or expired token" });

            return Ok(new { message = "Password reset successfully" });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
        {
            var result = await _authService.VerifyEmail(verifyEmailDto.Token);

            if (!result)
                return BadRequest(new { message = "Invalid or expired verification token" });

            return Ok(new { message = "Email verified successfully" });
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ForgotPasswordDto resendDto)
        {
            await _authService.ResendVerification(resendDto.Email);
            return Ok(new { message = "Verification email sent" });
        }

        [HttpPost("invite")]
        [Authorize]
        public async Task<IActionResult> InviteUser([FromBody] InviteUserDto inviteDto)
        {
            // ✅ Get firmId from JWT claim
            var firmIdClaim = User.FindFirst("firmId")?.Value;

            if (string.IsNullOrEmpty(firmIdClaim))
            {
                return BadRequest(new { message = "No firm context found. Please create a firm first before inviting members." });
            }

            var firmId = long.Parse(firmIdClaim);

            if (firmId == 0)
            {
                return BadRequest(new { message = "Invalid firm ID. Please ensure you have created a firm first." });
            }

            var invitedBy = long.Parse(User.FindFirst("userId")?.Value ?? "0");

            try
            {
                var result = await _authService.InviteUser(firmId, invitedBy, inviteDto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("accept-invite")]
        [Authorize]
        public async Task<IActionResult> AcceptInvite([FromBody] AcceptInviteDto acceptInviteDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.AcceptInvite(acceptInviteDto, GetIpAddress());

            if (result == null)
                return BadRequest(new { message = "Invalid or expired invitation" });

            return Ok(result);
        }
    }
}