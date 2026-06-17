public interface IEmailService
{
    Task SendVerificationEmail(string toEmail, string verificationToken);
    Task SendPasswordResetEmail(string toEmail, string resetToken);
    Task SendWelcomeEmail(string toEmail, string tempPassword, string firstName);
    Task SendInvitationEmail(string toEmail, string firstName, long firmId);
    Task SendBillEmail(string toEmail, string billNumber, byte[] pdfBytes);
    Task SendRawEmail(string toEmail, string subject, string body, string fromName, string fromEmail);
    Task SendDocumentShareEmail(string toEmail, string documentTitle, string sharedByName, string shareToken, string permission, int? expiresInDays);
}
