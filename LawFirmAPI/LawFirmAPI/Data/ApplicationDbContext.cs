using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Models.Entities;

namespace LawFirmAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Module 1: Authentication & Authorization
        public DbSet<User> Users { get; set; }
        public DbSet<Firm> Firms { get; set; }
        public DbSet<UserFirm> UserFirms { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<EmailVerification> EmailVerifications { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }
        public DbSet<OTPCode> OTPCodes { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        // Module 2: Dashboard & Settings
        public DbSet<FirmSetting> FirmSettings { get; set; }
        public DbSet<UserPreference> UserPreferences { get; set; }
        public DbSet<DashboardWidget> DashboardWidgets { get; set; }
        public DbSet<RecentActivity> RecentActivities { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        // Module 3: Calendar
        public DbSet<CalendarEvent> CalendarEvents { get; set; }
        public DbSet<EventAttendee> EventAttendees { get; set; }
        public DbSet<EventReminder> EventReminders { get; set; }
        public DbSet<EventRecurrence> EventRecurrences { get; set; }
        public DbSet<CalendarIntegration> CalendarIntegrations { get; set; }

        // Module 4: Matters
        public DbSet<Matter> Matters { get; set; }
        public DbSet<MatterType> MatterTypes { get; set; }
        public DbSet<MatterParty> MatterParties { get; set; }
        public DbSet<MatterNote> MatterNotes { get; set; }
        public DbSet<PracticeArea> PracticeAreas { get; set; }
        public DbSet<Court> Courts { get; set; }
        public DbSet<JudicialDistrict> JudicialDistricts { get; set; }

        // Module 5: Contacts
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<ContactType> ContactTypes { get; set; }
        public DbSet<ContactAddress> ContactAddresses { get; set; }
        public DbSet<ContactPhone> ContactPhones { get; set; }
        public DbSet<ContactEmail> ContactEmails { get; set; }
        public DbSet<ContactRelationship> ContactRelationships { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<ContactTag> ContactTags { get; set; }

        // Module 6: Tasks
        public DbSet<TaskEntity> Tasks { get; set; }
        public DbSet<LawFirmAPI.Models.Entities.TaskStatus> TaskStatuses { get; set; }
        public DbSet<TaskPriority> TaskPriorities { get; set; }
        public DbSet<TaskAssignee> TaskAssignees { get; set; }
        public DbSet<TaskComment> TaskComments { get; set; }
        public DbSet<TaskAttachment> TaskAttachments { get; set; }
        public DbSet<TaskReminder> TaskReminders { get; set; }

        // Module 7: Documents
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentType> DocumentTypes { get; set; }
        public DbSet<Folder> Folders { get; set; }
        public DbSet<DocumentVersion> DocumentVersions { get; set; }
        public DbSet<DocumentShare> DocumentShares { get; set; }
        public DbSet<DocumentComment> DocumentComments { get; set; }
        public DbSet<DocumentTemplate> DocumentTemplates { get; set; }
        public DbSet<DocumentSummary> DocumentSummaries { get; set; }

        // Module 8: Communications
        public DbSet<CommunicationThread> CommunicationThreads { get; set; }
        public DbSet<Communication> Communications { get; set; }
        public DbSet<CommunicationRecipient> CommunicationRecipients { get; set; }
        public DbSet<CommunicationAttachment> CommunicationAttachments { get; set; }
        public DbSet<EmailIntegration> EmailIntegrations { get; set; }
        public DbSet<EmailTemplate> EmailTemplates { get; set; }

        // Module 9: Billing
        public DbSet<Bill> Bills { get; set; }
        public DbSet<BillItem> BillItems { get; set; }
        public DbSet<BillStatus> BillStatuses { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<FirmSubscription> FirmSubscriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure unique indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            modelBuilder.Entity<UserFirm>()
                .HasIndex(uf => new { uf.UserId, uf.FirmId })
                .IsUnique();

            modelBuilder.Entity<Matter>()
                .HasIndex(m => new { m.FirmId, m.MatterNumber })
                .IsUnique();

            modelBuilder.Entity<Bill>()
                .HasIndex(b => new { b.FirmId, b.BillNumber })
                .IsUnique();

            // Configure TaskEntity relationships
            modelBuilder.Entity<TaskEntity>(entity =>
            {
                entity.HasKey(t => t.Id);
                
                entity.HasOne(t => t.Status)
                    .WithMany(s => s.Tasks)
                    .HasForeignKey(t => t.StatusId)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(t => t.Priority)
                    .WithMany(p => p.Tasks)
                    .HasForeignKey(t => t.PriorityId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure TaskStatus
            modelBuilder.Entity<LawFirmAPI.Models.Entities.TaskStatus>(entity =>
            {
                entity.HasKey(ts => ts.Id);
            });

            // Configure TaskPriority
            modelBuilder.Entity<TaskPriority>(entity =>
            {
                entity.HasKey(tp => tp.Id);
            });

            // Ignore computed properties
            modelBuilder.Entity<Bill>()
                .Ignore(b => b.BalanceDue);

            modelBuilder.Entity<BillItem>()
                .Ignore(i => i.Amount);

            modelBuilder.Entity<BillItem>()
                .Ignore(i => i.TotalAmount);
            modelBuilder.Ignore<Task>();

        }
    }
}