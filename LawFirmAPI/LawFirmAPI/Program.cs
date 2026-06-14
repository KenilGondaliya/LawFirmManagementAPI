using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using LawFirmAPI.Data;
using LawFirmAPI.Services;
using LawFirmAPI.Helpers;
using LawFirmAPI.Middlewares;
using LawFirmAPI.Options;
using LawFirmAPI.Requirements;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Law Firm Management API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new List<string>()
        }
    });
});

// Database - PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("ERROR: Connection string not found!");
    throw new Exception("Database connection string is missing");
}

Console.WriteLine($"Using connection string: {connectionString}");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "your-super-secret-key-with-minimum-32-characters-long";
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? "your-super-secret-key-with-minimum-32-characters-long"))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Allow token from query string for SignalR or special cases
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });


builder.Services.AddAuthorization(options =>
{
    // Role-based policies
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("OWNER", "ADMIN"));
    
    options.AddPolicy("ManagerOnly", policy => 
        policy.RequireRole("OWNER", "ADMIN", "MANAGER"));
    
    options.AddPolicy("StaffOnly", policy => 
        policy.RequireRole("OWNER", "ADMIN", "MANAGER", "STAFF"));
    
    // Permission-based policies
    options.AddPolicy("can_view_contacts", policy => 
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permission" && c.Value == "can_view_contacts") ||
            context.User.IsInRole("OWNER") ||
            context.User.IsInRole("ADMIN")));
    
    options.AddPolicy("can_edit_contacts", policy => 
        policy.RequireAssertion(context =>
            context.User.HasClaim(c => c.Type == "permission" && c.Value == "can_edit_contacts") ||
            context.User.IsInRole("OWNER") ||
            context.User.IsInRole("ADMIN")));
    
    options.AddPolicy("can_delete_contacts", policy => 
        policy.RequireAssertion(context =>
            context.User.IsInRole("OWNER") || context.User.IsInRole("ADMIN")));
    
    // Subscription-based policies
    options.AddPolicy("ProPlan", policy => 
        policy.Requirements.Add(new SubscriptionRequirement("pro")));
    
    options.AddPolicy("EnterprisePlan", policy => 
        policy.Requirements.Add(new SubscriptionRequirement("enterprise")));
    
    options.AddPolicy("AnyPaidPlan", policy => 
        policy.Requirements.Add(new SubscriptionRequirement("any")));
});

builder.Services.AddScoped<IAuthorizationHandler, SubscriptionHandler>();
builder.Services.AddScoped<IFeatureAccessService, FeatureAccessService>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFirmContextService, FirmContextService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEmailSyncService, EmailSyncService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IAISummaryService, AISummaryService>();
builder.Services.AddSingleton<IJwtHelper, JwtHelper>();
builder.Services.AddScoped<IAuthorizationHandler, SubscriptionHandler>();


// Module Services
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IMattersService, MattersService>();
builder.Services.AddScoped<IContactsService, ContactsService>();
builder.Services.AddScoped<ITasksService, TasksService>();
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddScoped<ICommunicationsService, CommunicationsService>();
builder.Services.AddScoped<IBillingService, BillingService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();

builder.Services.AddHttpContextAccessor();
builder.Services.Configure<RazorpayOptions>(builder.Configuration.GetSection("Razorpay"));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();

app.Use(async (context, next) =>
{
    var path = context.Request.Path.ToString().ToLower();
    var method = context.Request.Method;
    
    var publicPaths = new[]
    {
        "/api/v1/auth/register",
        "/api/v1/auth/login",
        "/api/v1/auth/refresh-token",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password",
        "/api/v1/auth/verify-email",
        "/api/v1/auth/resend-verification",
        "/api/v1/auth/accept-invite",
        "/swagger",
        "/swagger/index.html"
    };
    
    var isPublicPath = publicPaths.Any(p => path.StartsWith(p));
    
    if (isPublicPath)
    {
        await next();
        return;
    }
    
    if (!context.User.Identity?.IsAuthenticated ?? true)
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsJsonAsync(new { message = "Unauthorized: Please login first" });
        return;
    }
    
    var firmId = context.User.FindFirst("firmId")?.Value;
    
    var endpointsWithoutFirm = new[] { "/api/v1/auth/logout" };
    var isEndpointWithoutFirm = endpointsWithoutFirm.Any(p => path.Contains(p));
    
    if (!isEndpointWithoutFirm && string.IsNullOrEmpty(firmId))
    {
        context.Response.StatusCode = 401;
        await context.Response.WriteAsJsonAsync(new { 
            message = "Unauthorized: No firm context. Please create or select a firm first.",
            requiresFirmCreation = true 
        });
        return;
    }
    
    if (!string.IsNullOrEmpty(firmId))
    {
        context.Items["FirmId"] = long.Parse(firmId);
    }
    
    await next();
});

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        Console.WriteLine("Ensuring database is created...");
        await dbContext.Database.EnsureCreatedAsync();
        await SeedData.InitializeAsync(dbContext);
        Console.WriteLine("Database created/verified successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error creating database: {ex.Message}");
        Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
        Console.WriteLine("Make sure PostgreSQL is running and connection string is correct.");
        Console.WriteLine("Continuing without database...");
    }
}

app.Run();