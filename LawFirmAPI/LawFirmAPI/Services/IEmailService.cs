// Services/IEmailService.cs
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmail(string toEmail, string verificationToken);
        Task SendPasswordResetEmail(string toEmail, string resetToken);
        Task SendWelcomeEmail(string toEmail, string tempPassword, string firstName);
        Task SendInvitationEmail(string toEmail, string firstName, long firmId);
        Task SendBillEmail(string toEmail, string billNumber, byte[] pdfBytes);
    }
}