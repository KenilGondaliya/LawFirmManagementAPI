// Services/EmailService.cs - Complete Working Version

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

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
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
                throw new Exception("Email settings are not configured properly");
            }

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
        }

        public async Task SendVerificationEmail(string toEmail, string verificationToken)
        {
            var appUrl = _configuration["AppUrl"] ?? "http://localhost:5165";
            var verificationLink = $"{appUrl}/verify-email?token={verificationToken}";
            
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
                        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
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
                </html>
            ";

            await SendEmail(toEmail, "Verify Your Email - Law Firm Management System", htmlBody);
        }

        public async Task SendPasswordResetEmail(string toEmail, string resetToken)
        {
            var appUrl = _configuration["AppUrl"] ?? "http://localhost:5165";
            var resetLink = $"{appUrl}/reset-password?token={resetToken}";
            
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
                        .warning {{ background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Password Reset Request</h2>
                        </div>
                        <div class='content'>
                            <p>We received a request to reset your password.</p>
                            <p>Click the button below to create a new password:</p>
                            <p style='text-align: center;'>
                                <a href='{resetLink}' class='button'>Reset Password</a>
                            </p>
                            <div class='warning'>
                                <strong>⚠️ Security Note:</strong>
                                <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
                                <p>This link will expire in 24 hours.</p>
                            </div>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Law Firm Management System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmail(toEmail, "Reset Your Password - Law Firm Management System", htmlBody);
        }

        public async Task SendWelcomeEmail(string toEmail, string tempPassword, string firstName)
        {
            var appUrl = _configuration["AppUrl"] ?? "http://localhost:5165";
            
            var htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .password-box {{ background-color: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; }}
                        .button {{ background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }}
                        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Welcome to Law Firm Management System!</h2>
                        </div>
                        <div class='content'>
                            <h3>Hello {firstName},</h3>
                            <p>Your account has been created successfully. Here are your login credentials:</p>
                            <div class='password-box'>
                                <strong>Email:</strong> {toEmail}<br/>
                                <strong>Temporary Password:</strong> <span style='color:#1a56db; font-weight:bold;'>{tempPassword}</span>
                            </div>
                            <p style='margin-top: 20px;'>
                                <strong>Important:</strong> Please change your password after first login for security.
                            </p>
                            <p style='text-align: center;'>
                                <a href='{appUrl}/login' class='button'>Login to Your Account</a>
                            </p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Law Firm Management System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmail(toEmail, "Welcome to Law Firm Management System", htmlBody);
        }

        public async Task SendInvitationEmail(string toEmail, string firstName, long firmId)
        {
            var appUrl = _configuration["AppUrl"] ?? "http://localhost:5165";
            var acceptInviteLink = $"{appUrl}/accept-invite?email={toEmail}&firmId={firmId}";
            
            var htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #17a2b8; color: white; padding: 20px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .button {{ background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }}
                        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Law Firm Management System</h2>
                        </div>
                        <div class='content'>
                            <h3>Hello {firstName},</h3>
                            <p>You have been invited to join a law firm on our platform.</p>
                            <p>Click the button below to accept the invitation and get started:</p>
                            <p style='text-align: center;'>
                                <a href='{acceptInviteLink}' class='button'>Accept Invitation</a>
                            </p>
                            <p>If you don't have an account yet, you'll be guided to create one.</p>
                            <p>This invitation link will expire in 7 days.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Law Firm Management System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmail(toEmail, "You've Been Invited to Join a Law Firm", htmlBody);
        }

        public async Task SendBillEmail(string toEmail, string billNumber, byte[] pdfBytes)
        {
            var appUrl = _configuration["AppUrl"] ?? "http://localhost:5165";
            
            var htmlBody = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #ffc107; color: #333; padding: 20px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .button {{ background-color: #ffc107; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }}
                        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Invoice #{billNumber}</h2>
                        </div>
                        <div class='content'>
                            <p>Dear Customer,</p>
                            <p>Please find attached your invoice for your review.</p>
                            <p>You can view and pay your invoice through your dashboard.</p>
                            <p style='text-align: center;'>
                                <a href='{appUrl}/billing' class='button'>View Dashboard</a>
                            </p>
                            <p>If you have any questions, please don't hesitate to contact us.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2024 Law Firm Management System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmail(toEmail, $"Invoice #{billNumber} - Law Firm Management System", htmlBody, pdfBytes, $"Invoice_{billNumber}.pdf");
        }
    }
}