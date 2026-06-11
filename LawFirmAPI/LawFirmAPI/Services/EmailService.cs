// Services/EmailService.cs - COMPLETE FIXED VERSION with Frontend URL

using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _frontendUrl;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            // Get frontend URL from configuration (React/Vue/Angular app URL)
            _frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:3000";
        }

        private async Task SendEmail(string toEmail, string subject, string htmlBody, byte[]? attachment = null, string? attachmentName = null)
        {
            var fromEmail = _configuration["EmailSettings:FromEmail"];
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];

            if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(smtpServer))
            {
                Console.WriteLine($"⚠️ Email not configured. Would have sent to: {toEmail}");
                Console.WriteLine($"Subject: {subject}");
                return;
            }

            try
            {
                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(fromEmail));
                email.To.Add(MailboxAddress.Parse(toEmail));
                email.Subject = subject;

                var builder = new BodyBuilder();
                builder.HtmlBody = htmlBody;

                if (attachment != null && !string.IsNullOrEmpty(attachmentName))
                {
                    builder.Attachments.Add(attachmentName, attachment);
                }

                email.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);

                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    await smtp.AuthenticateAsync(username, password);
                }

                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                
                Console.WriteLine($"✅ Email sent successfully to: {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to send email: {ex.Message}");
                throw;
            }
        }

        // ✅ INVITATION EMAIL - Sends link to FRONTEND (not backend)
        public async Task SendInvitationEmail(string toEmail, string firstName, long firmId)
        {
            var encodedEmail = Uri.EscapeDataString(toEmail);
            // ✅ This link goes to your React app, not the backend API
            var acceptInviteLink = $"{_frontendUrl}/accept-invite?email={encodedEmail}&firmId={firmId}";

            var htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Invitation to Join Law Firm</title>
                    <style>
                        body {{
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f7fb;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 40px auto;
                            padding: 0;
                            background-color: #ffffff;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        }}
                        .header {{
                            background: linear-gradient(135deg, #1a56db 0%, #0e3a9e 100%);
                            color: white;
                            padding: 32px 24px;
                            text-align: center;
                        }}
                        .header h1 {{
                            margin: 0;
                            font-size: 28px;
                            font-weight: 600;
                        }}
                        .header p {{
                            margin: 8px 0 0;
                            opacity: 0.9;
                        }}
                        .content {{
                            padding: 32px 24px;
                        }}
                        .welcome-text {{
                            font-size: 18px;
                            color: #1a56db;
                            font-weight: 600;
                            margin-bottom: 16px;
                        }}
                        .firm-name {{
                            background-color: #f0f4ff;
                            padding: 12px 16px;
                            border-radius: 8px;
                            font-weight: 600;
                            color: #1a56db;
                            margin: 20px 0;
                            text-align: center;
                        }}
                        .button {{
                            display: inline-block;
                            background: linear-gradient(135deg, #1a56db 0%, #0e3a9e 100%);
                            color: white;
                            text-decoration: none;
                            padding: 14px 32px;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 16px;
                            margin: 24px 0;
                            box-shadow: 0 2px 8px rgba(26, 86, 219, 0.3);
                            transition: all 0.3s ease;
                        }}
                        .button:hover {{
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(26, 86, 219, 0.4);
                        }}
                        .info-box {{
                            background-color: #f8f9fa;
                            border-left: 4px solid #1a56db;
                            padding: 16px;
                            margin: 20px 0;
                            border-radius: 6px;
                        }}
                        .footer {{
                            text-align: center;
                            padding: 24px;
                            background-color: #f8f9fa;
                            color: #6c757d;
                            font-size: 12px;
                            border-top: 1px solid #e9ecef;
                        }}
                        .footer a {{
                            color: #1a56db;
                            text-decoration: none;
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Law Firm Management</h1>
                            <p>Professional Legal Practice Management</p>
                        </div>
                        <div class='content'>
                            <div class='welcome-text'>
                                Hello {firstName}!
                            </div>
                            <p>You have been invited to join a law firm on our platform.</p>
                            
                            <div class='firm-name'>
                                🏛️ Firm ID: {firmId}
                            </div>
                            
                            <div class='info-box'>
                                <strong>📋 What happens next?</strong>
                                <ul style='margin: 10px 0 0 20px; padding: 0;'>
                                    <li>Click the button below to accept the invitation</li>
                                    <li>Create your account (if you don't have one)</li>
                                    <li>Start collaborating with your team</li>
                                </ul>
                            </div>
                            
                            <p style='text-align: center;'>
                                <a href='{acceptInviteLink}' class='button'>✓ Accept Invitation</a>
                            </p>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <p style='background-color: #f5f5f5; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px;'>
                                {acceptInviteLink}
                            </p>
                            
                            <p><strong>⚠️ Note:</strong> This invitation link will expire in 7 days.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Law Firm Management System. All rights reserved.</p>
                            <p>
                                <a href='{_frontendUrl}/terms'>Terms of Service</a> | 
                                <a href='{_frontendUrl}/privacy'>Privacy Policy</a>
                            </p>
                            <p>If you did not expect this invitation, please ignore this email.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmail(toEmail, $"You've Been Invited to Join a Law Firm", htmlBody);
        }

        // Other email methods remain the same...
        public async Task SendVerificationEmail(string toEmail, string verificationToken)
        {
            var encodedToken = Uri.EscapeDataString(verificationToken);
            var verificationLink = $"{_frontendUrl}/verify-email?token={encodedToken}";

            var htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #1a56db; color: white; padding: 20px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .button {{ background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Law Firm Management System</h2>
                        </div>
                        <div class='content'>
                            <h3>Verify Your Email Address</h3>
                            <p>Thank you for registering! Please click the button below to verify your email address:</p>
                            <p style='text-align: center;'>
                                <a href='{verificationLink}' class='button'>Verify Email</a>
                            </p>
                            <p>Or copy and paste this link: <br/>{verificationLink}</p>
                            <p>This link will expire in 7 days.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Law Firm Management System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmail(toEmail, "Verify Your Email - Law Firm Management System", htmlBody);
        }

        public async Task SendPasswordResetEmail(string toEmail, string resetToken)
        {
            var encodedToken = Uri.EscapeDataString(resetToken);
            var encodedEmail = Uri.EscapeDataString(toEmail);
            var resetLink = $"{_frontendUrl}/reset-password?token={encodedToken}&email={encodedEmail}";

            var htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #1a56db; color: white; padding: 20px; text-align: center; }}
                        .button {{ background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Password Reset Request</h2>
                        </div>
                        <div class='content'>
                            <p>We received a request to reset your password for <strong>{toEmail}</strong>.</p>
                            <p style='text-align: center;'>
                                <a href='{resetLink}' class='button'>Reset Password</a>
                            </p>
                            <p>This link will expire in 24 hours.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Law Firm Management System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmail(toEmail, "Reset Your Password - Law Firm Management System", htmlBody);
        }

        public async Task SendWelcomeEmail(string toEmail, string tempPassword, string firstName)
        {
            var loginLink = $"{_frontendUrl}/login";

            var htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; }}
                        .password-box {{ background-color: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace; text-align: center; }}
                        .button {{ background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Welcome to Law Firm Management System!</h2>
                        </div>
                        <div class='content'>
                            <h3>Hello {firstName},</h3>
                            <p>Your account has been created successfully.</p>
                            <div class='password-box'>
                                <strong>Email:</strong> {toEmail}<br/>
                                <strong>Temporary Password:</strong> {tempPassword}
                            </div>
                            <p style='text-align: center;'>
                                <a href='{loginLink}' class='button'>Login to Your Account</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmail(toEmail, "Welcome to Law Firm Management System", htmlBody);
        }

        public async Task SendBillEmail(string toEmail, string billNumber, byte[] pdfBytes)
        {
            var billingLink = $"{_frontendUrl}/billing";

            var htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #ffc107; color: #333; padding: 20px; text-align: center; }}
                        .button {{ background-color: #ffc107; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Invoice #{billNumber}</h2>
                        </div>
                        <div class='content'>
                            <p>Please find attached your invoice.</p>
                            <p style='text-align: center;'>
                                <a href='{billingLink}' class='button'>View Dashboard</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmail(toEmail, $"Invoice #{billNumber} - Law Firm Management System", htmlBody, pdfBytes, $"Invoice_{billNumber}.pdf");
        }

        public async Task SendEmailMessage(string toEmail, string subject, string body, string fromName, string fromEmail)
        {
            var htmlBody = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2>Law Firm Management System</h2>
                    <p><strong>From:</strong> {fromName} ({fromEmail})</p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <hr/>
                    <div>{body}</div>
                </div>";

            await SendEmail(toEmail, subject, htmlBody);
        }

        public async Task SendRawEmail(string toEmail, string subject, string body, string fromName, string fromEmail)
        {
            await SendEmail(toEmail, subject, body);
        }
    }
}