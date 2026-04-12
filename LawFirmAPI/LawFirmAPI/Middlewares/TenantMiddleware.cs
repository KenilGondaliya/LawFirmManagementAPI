// Middlewares/TenantMiddleware.cs (or Middleware/TenantMiddleware.cs)
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using System;
using System.Threading.Tasks;

namespace LawFirmAPI.Middlewares  // Match your folder name
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IServiceScopeFactory scopeFactory)
        {
            var path = context.Request.Path.Value?.ToLower();

            // Skip tenant validation for auth endpoints
            if (path != null && (
                path.StartsWith("/api/v1/auth") ||
                path.StartsWith("/api/v1/public") ||
                path.StartsWith("/swagger") ||
                path.StartsWith("/health")))
            {
                await _next(context);
                return;
            }

            // Get firm ID from JWT token
            var firmIdClaim = context.User?.FindFirst("firmId")?.Value;
            var isTemporary = context.User?.FindFirst("isTemporary")?.Value == "true";

            // ✅ Allow temporary tokens to access create-firm endpoint
            if (isTemporary && path?.StartsWith("/api/v1/auth/create-firm") == true)
            {
                await _next(context);
                return;
            }

            // ✅ If temporary token and not create-firm, return 402 (Payment Required / Setup Required)
            if (isTemporary)
            {
                context.Response.StatusCode = 402;
                await context.Response.WriteAsync("{\"message\": \"Firm creation required\", \"requiresFirmCreation\": true}");
                return;
            }

            if (string.IsNullOrEmpty(firmIdClaim))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("{\"message\": \"Unauthorized: No firm context\"}");
                return;
            }

            var firmId = long.Parse(firmIdClaim);

            using var scope = scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var firm = await dbContext.Firms
                .FirstOrDefaultAsync(f => f.Id == firmId && f.IsActive);

            if (firm == null)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("{\"message\": \"Forbidden: Firm not found or inactive\"}");
                return;
            }

            await _next(context);
        }

    }
}