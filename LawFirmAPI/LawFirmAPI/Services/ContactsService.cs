// Services/ContactsService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Services
{
    public interface IContactsService
    {
        Task<List<ContactDto>> GetAllContacts(long firmId, string? search, bool? isClient);
        Task<ContactDto?> GetContactById(long id, long firmId);
        Task<ContactDto> CreateContact(long firmId, long userId, CreateContactDto createDto);
        Task<ContactDto> UpdateContact(long id, long firmId, UpdateContactDto updateDto);
        Task<bool> DeleteContact(long id, long firmId);
        Task<List<ContactAddressDto>> GetContactAddresses(long contactId, long firmId);
        Task<ContactAddressDto> AddContactAddress(long contactId, long firmId, CreateContactAddressDto addressDto);
        Task<bool> DeleteContactAddress(long addressId, long firmId);
        Task<List<ContactPhoneDto>> GetContactPhones(long contactId, long firmId);
        Task<ContactPhoneDto> AddContactPhone(long contactId, long firmId, CreateContactPhoneDto phoneDto);
        Task<bool> DeleteContactPhone(long phoneId, long firmId);
        Task<List<ContactEmailDto>> GetContactEmails(long contactId, long firmId);
        Task<ContactEmailDto> AddContactEmail(long contactId, long firmId, CreateContactEmailDto emailDto);
        Task<bool> DeleteContactEmail(long emailId, long firmId);
        Task<ContactRelationshipDto> AddSpouse(long contactId, long firmId, long spouseContactId);
        Task<ContactRelationshipDto> AddRelative(long contactId, long firmId, AddRelativeDto relativeDto);
        Task<bool> RemoveRelationship(long relationshipId, long firmId);
        Task<List<TagDto>> GetTags(long firmId);
        Task<TagDto> CreateTag(long firmId, CreateTagDto createDto);
        Task AddTagToContact(long contactId, long firmId, long tagId);
        Task RemoveTagFromContact(long contactId, long firmId, long tagId);
        Task<List<ContactDto>> GetContactsByTag(long tagId, long firmId);
        Task<List<MatterBriefDto>> GetContactMatters(long contactId, long firmId);
        Task<List<TaskBriefDto>> GetContactTasks(long contactId, long firmId);
        Task<List<DocumentBriefDto>> GetContactDocuments(long contactId, long firmId);
        Task<ContactStatsDto> GetContactStats(long firmId);
    }

    public class ContactsService : IContactsService
    {
        private readonly ApplicationDbContext _context;

        public ContactsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ContactDto>> GetAllContacts(long firmId, string? search, bool? isClient)
        {
            var query = _context.Contacts
                .Include(c => c.ContactType)
                .Where(c => c.FirmId == firmId && c.DeletedAt == null);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c =>
                    c.FirstName.Contains(search) ||
                    c.LastName.Contains(search) ||
                    (c.Email != null && c.Email.Contains(search)) ||
                    (c.Phone != null && c.Phone.Contains(search)) ||
                    (c.CompanyName != null && c.CompanyName.Contains(search)));
            }

            if (isClient.HasValue)
                query = query.Where(c => c.IsClient == isClient.Value);

            var contacts = await query
                .OrderBy(c => c.LastName)
                .Select(c => MapToDto(c))
                .ToListAsync();

            return contacts;
        }

        public async Task<ContactDto?> GetContactById(long id, long firmId)
        {
            var contact = await _context.Contacts
                .Include(c => c.ContactType)
                .Include(c => c.Addresses)
                .Include(c => c.Phones)
                .Include(c => c.Emails)
                .FirstOrDefaultAsync(c => c.Id == id && c.FirmId == firmId && c.DeletedAt == null);

            return contact != null ? MapToDto(contact) : null;
        }

        public async Task<ContactDto> CreateContact(long firmId, long userId, CreateContactDto createDto)
        {
            var contact = new Contact
            {
                FirmId = firmId,
                ContactTypeId = createDto.ContactTypeId,
                Prefix = createDto.Prefix,
                FirstName = createDto.FirstName,
                MiddleName = createDto.MiddleName,
                LastName = createDto.LastName,
                Suffix = createDto.Suffix,
                Nickname = createDto.Nickname,
                CompanyName = createDto.CompanyName,
                Title = createDto.Title,
                Department = createDto.Department,
                Email = createDto.Email,
                AlternativeEmail = createDto.AlternativeEmail,
                Phone = createDto.Phone,
                AlternativePhone = createDto.AlternativePhone,
                Fax = createDto.Fax,
                Website = createDto.Website,
                DateOfBirth = createDto.DateOfBirth,
                Gender = createDto.Gender,
                MaritalStatus = createDto.MaritalStatus,
                Anniversary = createDto.Anniversary,
                Nationality = createDto.Nationality,
                TaxId = createDto.TaxId,
                IdentificationNumber = createDto.IdentificationNumber,
                IdentificationType = createDto.IdentificationType,
                IsClient = createDto.IsClient,
                IsOpponent = createDto.IsOpponent,
                IsWitness = createDto.IsWitness,
                IsJudge = createDto.IsJudge,
                IsAdvocate = createDto.IsAdvocate,
                IsImportant = createDto.IsImportant,
                Notes = createDto.Notes,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();

            // Add addresses
            if (createDto.Addresses != null)
            {
                foreach (var addrDto in createDto.Addresses)
                {
                    var address = new ContactAddress
                    {
                        ContactId = contact.Id,
                        AddressType = addrDto.AddressType,
                        AddressLine1 = addrDto.AddressLine1,
                        AddressLine2 = addrDto.AddressLine2,
                        City = addrDto.City,
                        State = addrDto.State,
                        PostalCode = addrDto.PostalCode,
                        Country = addrDto.Country,
                        IsPrimary = addrDto.IsPrimary,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.ContactAddresses.Add(address);
                }
            }

            // Add phones
            if (createDto.Phones != null)
            {
                foreach (var phoneDto in createDto.Phones)
                {
                    var phone = new ContactPhone
                    {
                        ContactId = contact.Id,
                        PhoneType = phoneDto.PhoneType,
                        PhoneNumber = phoneDto.PhoneNumber,
                        CountryCode = phoneDto.CountryCode,
                        Extension = phoneDto.Extension,
                        IsPrimary = phoneDto.IsPrimary,
                        IsWhatsapp = phoneDto.IsWhatsapp,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.ContactPhones.Add(phone);
                }
            }

            // Add emails
            if (createDto.Emails != null)
            {
                foreach (var emailDto in createDto.Emails)
                {
                    var email = new ContactEmail
                    {
                        ContactId = contact.Id,
                        EmailType = emailDto.EmailType,
                        Email = emailDto.Email,
                        IsPrimary = emailDto.IsPrimary,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.ContactEmails.Add(email);
                }
            }

            await _context.SaveChangesAsync();

            // Add spouse if provided
            if (createDto.SpouseContactId.HasValue)
            {
                await AddSpouse(contact.Id, firmId, createDto.SpouseContactId.Value);
            }

            // Add relatives if provided
            if (createDto.Relatives != null)
            {
                foreach (var relativeDto in createDto.Relatives)
                {
                    await AddRelative(contact.Id, firmId, relativeDto);
                }
            }

            // Add tags if provided
            if (createDto.TagIds != null)
            {
                foreach (var tagId in createDto.TagIds)
                {
                    await AddTagToContact(contact.Id, firmId, tagId);
                }
            }

            AddRecentActivity(firmId, userId, "CREATE", "Contact", contact.Id, $"{contact.FirstName} {contact.LastName}", $"Created contact: {contact.FirstName} {contact.LastName}");

            return MapToDto(contact);
        }

        public async Task<ContactDto> UpdateContact(long id, long firmId, UpdateContactDto updateDto)
        {
            var contact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.Id == id && c.FirmId == firmId && c.DeletedAt == null);

            if (contact == null)
                throw new KeyNotFoundException("Contact not found");

            if (updateDto.FirstName != null)
                contact.FirstName = updateDto.FirstName;
            if (updateDto.LastName != null)
                contact.LastName = updateDto.LastName;
            if (updateDto.Email != null)
                contact.Email = updateDto.Email;
            if (updateDto.Phone != null)
                contact.Phone = updateDto.Phone;
            if (updateDto.CompanyName != null)
                contact.CompanyName = updateDto.CompanyName;
            if (updateDto.Title != null)
                contact.Title = updateDto.Title;
            if (updateDto.Department != null)
                contact.Department = updateDto.Department;
            if (updateDto.IsClient.HasValue)
                contact.IsClient = updateDto.IsClient.Value;
            if (updateDto.IsOpponent.HasValue)
                contact.IsOpponent = updateDto.IsOpponent.Value;
            if (updateDto.IsImportant.HasValue)
                contact.IsImportant = updateDto.IsImportant.Value;
            if (updateDto.Notes != null)
                contact.Notes = updateDto.Notes;
            if (updateDto.DateOfBirth.HasValue)
                contact.DateOfBirth = updateDto.DateOfBirth;
            if (updateDto.MaritalStatus != null)
                contact.MaritalStatus = updateDto.MaritalStatus;

            contact.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(contact);
        }

        public async Task<bool> DeleteContact(long id, long firmId)
        {
            var contact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.Id == id && c.FirmId == firmId && c.DeletedAt == null);

            if (contact == null)
                return false;

            contact.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<ContactAddressDto>> GetContactAddresses(long contactId, long firmId)
        {
            var addresses = await _context.ContactAddresses
                .Where(a => a.ContactId == contactId)
                .Select(a => new ContactAddressDto
                {
                    Id = a.Id,
                    AddressType = a.AddressType,
                    AddressLine1 = a.AddressLine1,
                    AddressLine2 = a.AddressLine2,
                    City = a.City,
                    State = a.State,
                    PostalCode = a.PostalCode,
                    Country = a.Country,
                    IsPrimary = a.IsPrimary
                })
                .ToListAsync();

            return addresses;
        }

        public async Task<ContactAddressDto> AddContactAddress(long contactId, long firmId, CreateContactAddressDto addressDto)
        {
            var address = new ContactAddress
            {
                ContactId = contactId,
                AddressType = addressDto.AddressType,
                AddressLine1 = addressDto.AddressLine1,
                AddressLine2 = addressDto.AddressLine2,
                City = addressDto.City,
                State = addressDto.State,
                PostalCode = addressDto.PostalCode,
                Country = addressDto.Country,
                IsPrimary = addressDto.IsPrimary,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ContactAddresses.Add(address);
            await _context.SaveChangesAsync();

            return new ContactAddressDto
            {
                Id = address.Id,
                AddressType = address.AddressType,
                AddressLine1 = address.AddressLine1,
                AddressLine2 = address.AddressLine2,
                City = address.City,
                State = address.State,
                PostalCode = address.PostalCode,
                Country = address.Country,
                IsPrimary = address.IsPrimary
            };
        }

        public async Task<bool> DeleteContactAddress(long addressId, long firmId)
        {
            var address = await _context.ContactAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId);

            if (address == null)
                return false;

            _context.ContactAddresses.Remove(address);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<ContactPhoneDto>> GetContactPhones(long contactId, long firmId)
        {
            var phones = await _context.ContactPhones
                .Where(p => p.ContactId == contactId)
                .Select(p => new ContactPhoneDto
                {
                    Id = p.Id,
                    PhoneType = p.PhoneType,
                    PhoneNumber = p.PhoneNumber,
                    CountryCode = p.CountryCode,
                    Extension = p.Extension,
                    IsPrimary = p.IsPrimary,
                    IsWhatsapp = p.IsWhatsapp
                })
                .ToListAsync();

            return phones;
        }

        public async Task<ContactPhoneDto> AddContactPhone(long contactId, long firmId, CreateContactPhoneDto phoneDto)
        {
            var phone = new ContactPhone
            {
                ContactId = contactId,
                PhoneType = phoneDto.PhoneType,
                PhoneNumber = phoneDto.PhoneNumber,
                CountryCode = phoneDto.CountryCode,
                Extension = phoneDto.Extension,
                IsPrimary = phoneDto.IsPrimary,
                IsWhatsapp = phoneDto.IsWhatsapp,
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactPhones.Add(phone);
            await _context.SaveChangesAsync();

            return new ContactPhoneDto
            {
                Id = phone.Id,
                PhoneType = phone.PhoneType,
                PhoneNumber = phone.PhoneNumber,
                CountryCode = phone.CountryCode,
                Extension = phone.Extension,
                IsPrimary = phone.IsPrimary,
                IsWhatsapp = phone.IsWhatsapp
            };
        }

        public async Task<bool> DeleteContactPhone(long phoneId, long firmId)
        {
            var phone = await _context.ContactPhones
                .FirstOrDefaultAsync(p => p.Id == phoneId);

            if (phone == null)
                return false;

            _context.ContactPhones.Remove(phone);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<ContactEmailDto>> GetContactEmails(long contactId, long firmId)
        {
            var emails = await _context.ContactEmails
                .Where(e => e.ContactId == contactId)
                .Select(e => new ContactEmailDto
                {
                    Id = e.Id,
                    EmailType = e.EmailType,
                    Email = e.Email,
                    IsPrimary = e.IsPrimary
                })
                .ToListAsync();

            return emails;
        }

        public async Task<ContactEmailDto> AddContactEmail(long contactId, long firmId, CreateContactEmailDto emailDto)
        {
            var email = new ContactEmail
            {
                ContactId = contactId,
                EmailType = emailDto.EmailType,
                Email = emailDto.Email,
                IsPrimary = emailDto.IsPrimary,
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactEmails.Add(email);
            await _context.SaveChangesAsync();

            return new ContactEmailDto
            {
                Id = email.Id,
                EmailType = email.EmailType,
                Email = email.Email,
                IsPrimary = email.IsPrimary
            };
        }

        public async Task<bool> DeleteContactEmail(long emailId, long firmId)
        {
            var email = await _context.ContactEmails
                .FirstOrDefaultAsync(e => e.Id == emailId);

            if (email == null)
                return false;

            _context.ContactEmails.Remove(email);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<ContactRelationshipDto> AddSpouse(long contactId, long firmId, long spouseContactId)
        {
            var relationship = new ContactRelationship
            {
                ContactId = contactId,
                RelatedContactId = spouseContactId,
                RelationshipType = "SPOUSE",
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactRelationships.Add(relationship);
            await _context.SaveChangesAsync();

            return new ContactRelationshipDto
            {
                Id = relationship.Id,
                RelatedContactId = spouseContactId,
                RelationshipType = "SPOUSE"
            };
        }

        public async Task<ContactRelationshipDto> AddRelative(long contactId, long firmId, AddRelativeDto relativeDto)
        {
            var relationship = new ContactRelationship
            {
                ContactId = contactId,
                RelatedContactId = relativeDto.RelatedContactId,
                RelationshipType = relativeDto.RelationshipType,
                Notes = relativeDto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactRelationships.Add(relationship);
            await _context.SaveChangesAsync();

            return new ContactRelationshipDto
            {
                Id = relationship.Id,
                RelatedContactId = relationship.RelatedContactId,
                RelationshipType = relationship.RelationshipType,
                Notes = relationship.Notes
            };
        }

        public async Task<bool> RemoveRelationship(long relationshipId, long firmId)
        {
            var relationship = await _context.ContactRelationships
                .FirstOrDefaultAsync(r => r.Id == relationshipId);

            if (relationship == null)
                return false;

            _context.ContactRelationships.Remove(relationship);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<TagDto>> GetTags(long firmId)
        {
            var tags = await _context.Tags
                .Where(t => t.FirmId == firmId)
                .Select(t => new TagDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Color = t.Color
                })
                .ToListAsync();

            return tags;
        }

        public async Task<TagDto> CreateTag(long firmId, CreateTagDto createDto)
        {
            var tag = new Tag
            {
                FirmId = firmId,
                Name = createDto.Name,
                Color = createDto.Color,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();

            return new TagDto
            {
                Id = tag.Id,
                Name = tag.Name,
                Color = tag.Color
            };
        }

        public async Task AddTagToContact(long contactId, long firmId, long tagId)
        {
            var existing = await _context.ContactTags
                .FirstOrDefaultAsync(ct => ct.ContactId == contactId && ct.TagId == tagId);

            if (existing == null)
            {
                var contactTag = new ContactTag
                {
                    ContactId = contactId,
                    TagId = tagId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ContactTags.Add(contactTag);
                await _context.SaveChangesAsync();
            }
        }

        public async Task RemoveTagFromContact(long contactId, long firmId, long tagId)
        {
            var contactTag = await _context.ContactTags
                .FirstOrDefaultAsync(ct => ct.ContactId == contactId && ct.TagId == tagId);

            if (contactTag != null)
            {
                _context.ContactTags.Remove(contactTag);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<ContactDto>> GetContactsByTag(long tagId, long firmId)
        {
            var contacts = await _context.ContactTags
                .Where(ct => ct.TagId == tagId)
                .Select(ct => ct.Contact)
                .Where(c => c != null && c.FirmId == firmId && c.DeletedAt == null)
                .Select(c => MapToDto(c!))
                .ToListAsync();

            return contacts;
        }

        public async Task<List<MatterBriefDto>> GetContactMatters(long contactId, long firmId)
        {
            var matters = await _context.MatterParties
                .Include(mp => mp.Matter)
                .Where(mp => mp.ContactId == contactId && mp.Matter != null && mp.Matter.FirmId == firmId && mp.Matter.DeletedAt == null)
                .Select(mp => new MatterBriefDto
                {
                    Id = mp.Matter!.Id,
                    MatterNumber = mp.Matter.MatterNumber,
                    Title = mp.Matter.Title,
                    Status = mp.Matter.Status,
                    PartyType = mp.PartyType,
                    IsPrimary = mp.IsPrimary
                })
                .ToListAsync();

            return matters;
        }

        public async Task<List<TaskBriefDto>> GetContactTasks(long contactId, long firmId)
        {
            var tasks = await _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Where(t => t.ContactId == contactId && t.FirmId == firmId && t.DeletedAt == null)
                .Select(t => new TaskBriefDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DueDate = t.DueDate,
                    Status = t.Status != null ? t.Status.Name : null,
                    Priority = t.Priority != null ? t.Priority.Name : null
                })
                .ToListAsync();

            return tasks;
        }

        public async Task<List<DocumentBriefDto>> GetContactDocuments(long contactId, long firmId)
        {
            var documents = await _context.Documents
                .Where(d => d.ContactId == contactId && d.FirmId == firmId && !d.IsArchived)
                .OrderByDescending(d => d.UploadedAt)
                .Take(10)
                .Select(d => new DocumentBriefDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    FileName = d.FileName,
                    UploadedAt = d.UploadedAt
                })
                .ToListAsync();

            return documents;
        }

        public async Task<ContactStatsDto> GetContactStats(long firmId)
        {
            var contacts = await _context.Contacts
                .Where(c => c.FirmId == firmId && c.DeletedAt == null)
                .ToListAsync();

            var stats = new ContactStatsDto
            {
                Total = contacts.Count,
                Clients = contacts.Count(c => c.IsClient),
                Opponents = contacts.Count(c => c.IsOpponent),
                Witnesses = contacts.Count(c => c.IsWitness),
                Judges = contacts.Count(c => c.IsJudge),
                Advocates = contacts.Count(c => c.IsAdvocate),
                Important = contacts.Count(c => c.IsImportant)
            };

            return stats;
        }

        private ContactDto MapToDto(Contact c)
        {
            return new ContactDto
            {
                Id = c.Id,
                Uuid = c.Uuid,
                FirstName = c.FirstName,
                LastName = c.LastName,
                FullName = $"{c.FirstName} {c.LastName}".Trim(),
                Email = c.Email,
                Phone = c.Phone,
                CompanyName = c.CompanyName,
                Title = c.Title,
                Department = c.Department,
                IsClient = c.IsClient,
                IsOpponent = c.IsOpponent,
                IsWitness = c.IsWitness,
                IsJudge = c.IsJudge,
                IsAdvocate = c.IsAdvocate,
                IsImportant = c.IsImportant,
                Notes = c.Notes,
                ProfileImageUrl = c.ProfileImageUrl,
                ContactTypeId = c.ContactTypeId,
                ContactTypeName = c.ContactType?.Name,
                Addresses = c.Addresses.Select(a => new ContactAddressDto
                {
                    Id = a.Id,
                    AddressType = a.AddressType,
                    AddressLine1 = a.AddressLine1,
                    AddressLine2 = a.AddressLine2,
                    City = a.City,
                    State = a.State,
                    PostalCode = a.PostalCode,
                    Country = a.Country,
                    IsPrimary = a.IsPrimary
                }).ToList(),
                Phones = c.Phones.Select(p => new ContactPhoneDto
                {
                    Id = p.Id,
                    PhoneType = p.PhoneType,
                    PhoneNumber = p.PhoneNumber,
                    CountryCode = p.CountryCode,
                    Extension = p.Extension,
                    IsPrimary = p.IsPrimary,
                    IsWhatsapp = p.IsWhatsapp
                }).ToList(),
                Emails = c.Emails.Select(e => new ContactEmailDto
                {
                    Id = e.Id,
                    EmailType = e.EmailType,
                    Email = e.Email,
                    IsPrimary = e.IsPrimary
                }).ToList(),
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            };
        }

        private void AddRecentActivity(long firmId, long userId, string activityType, string entityType, long entityId, string entityName, string description)
        {
            var activity = new RecentActivity
            {
                FirmId = firmId,
                UserId = userId,
                ActivityType = activityType,
                EntityType = entityType,
                EntityId = entityId,
                EntityName = entityName,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };
            _context.RecentActivities.Add(activity);
        }
    }
}