// Models/DTOs/AuthDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    // Registration Flow DTOs
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
    }

    public class CreateFirmDto
    {
        public string FirmName { get; set; } = string.Empty;
        public string? LegalName { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? TaxNumber { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? PlanCode { get; set; } = "basic";
        public string? BillingCycle { get; set; } = "monthly";
    }

    public class LoginDto
    {
        public string EmailOrUsername { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public long? FirmId { get; set; }
        public bool RememberMe { get; set; } = false;
    }

    public class SwitchFirmDto
    {
        public long FirmId { get; set; }
    }

    public class AuthResponseDto
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public long ExpiresIn { get; set; }
        public UserProfileDto User { get; set; } = new();
        public List<FirmBasicDto> Firms { get; set; } = new();
        public FirmBasicDto? CurrentFirm { get; set; }
        public bool RequiresFirmCreation { get; set; } = false;
        public bool RequiresFirmSelection { get; set; } = false;

    }

    public class UserProfileDto
    {
        public long Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class FirmBasicDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class RefreshTokenDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    public class VerifyEmailDto
    {
        public string Token { get; set; } = string.Empty;
    }

    public class AcceptInviteDto
    {
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }


}