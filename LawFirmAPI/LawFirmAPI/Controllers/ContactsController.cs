// Controllers/ContactsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/contacts")]
    [Authorize]
    public class ContactsController : ControllerBase
    {
        private readonly IContactsService _contactsService;
        private readonly IFirmContextService _firmContextService;

        public ContactsController(IContactsService contactsService, IFirmContextService firmContextService)
        {
            _contactsService = contactsService;
            _firmContextService = firmContextService;
        }

        // Basic Contact Operations
        [HttpGet]
        public async Task<IActionResult> GetAllContacts([FromQuery] string? search, [FromQuery] bool? isClient)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var contacts = await _contactsService.GetAllContacts(firmId, search, isClient);
            return Ok(contacts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContactById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var contact = await _contactsService.GetContactById(id, firmId);
            if (contact == null)
                return NotFound(new { message = "Contact not found" });
            return Ok(contact);
        }

        [HttpPost]
        public async Task<IActionResult> CreateContact([FromBody] CreateContactDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var contact = await _contactsService.CreateContact(firmId, userId, createDto);
            return Ok(new { message = "Contact created successfully", contactId = contact.Id, contact });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContact(long id, [FromBody] UpdateContactDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var contact = await _contactsService.UpdateContact(id, firmId, updateDto);
            return Ok(new { message = "Contact updated successfully", contact });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _contactsService.DeleteContact(id, firmId);
            if (!result)
                return NotFound(new { message = "Contact not found" });
            return Ok(new { message = "Contact deleted successfully" });
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchContacts([FromQuery] string q)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var contacts = await _contactsService.GetAllContacts(firmId, q, null);
            return Ok(contacts);
        }

        // Contact Addresses
        [HttpGet("{id}/addresses")]
        public async Task<IActionResult> GetContactAddresses(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var addresses = await _contactsService.GetContactAddresses(id, firmId);
            return Ok(addresses);
        }

        [HttpPost("{id}/addresses")]
        public async Task<IActionResult> AddContactAddress(long id, [FromBody] CreateContactAddressDto addressDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var address = await _contactsService.AddContactAddress(id, firmId, addressDto);
            return Ok(new { message = "Address added successfully", address });
        }

        [HttpDelete("addresses/{addressId}")]
        public async Task<IActionResult> DeleteContactAddress(long addressId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _contactsService.DeleteContactAddress(addressId, firmId);
            if (!result)
                return NotFound(new { message = "Address not found" });
            return Ok(new { message = "Address deleted successfully" });
        }

        // Contact Phones
        [HttpGet("{id}/phones")]
        public async Task<IActionResult> GetContactPhones(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var phones = await _contactsService.GetContactPhones(id, firmId);
            return Ok(phones);
        }

        [HttpPost("{id}/phones")]
        public async Task<IActionResult> AddContactPhone(long id, [FromBody] CreateContactPhoneDto phoneDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var phone = await _contactsService.AddContactPhone(id, firmId, phoneDto);
            return Ok(new { message = "Phone added successfully", phone });
        }

        [HttpDelete("phones/{phoneId}")]
        public async Task<IActionResult> DeleteContactPhone(long phoneId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _contactsService.DeleteContactPhone(phoneId, firmId);
            if (!result)
                return NotFound(new { message = "Phone not found" });
            return Ok(new { message = "Phone deleted successfully" });
        }

        // Contact Emails
        [HttpGet("{id}/emails")]
        public async Task<IActionResult> GetContactEmails(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var emails = await _contactsService.GetContactEmails(id, firmId);
            return Ok(emails);
        }

        [HttpPost("{id}/emails")]
        public async Task<IActionResult> AddContactEmail(long id, [FromBody] CreateContactEmailDto emailDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var email = await _contactsService.AddContactEmail(id, firmId, emailDto);
            return Ok(new { message = "Email added successfully", email });
        }

        [HttpDelete("emails/{emailId}")]
        public async Task<IActionResult> DeleteContactEmail(long emailId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _contactsService.DeleteContactEmail(emailId, firmId);
            if (!result)
                return NotFound(new { message = "Email not found" });
            return Ok(new { message = "Email deleted successfully" });
        }

        // Family/Relations
        [HttpPost("{id}/spouse/{spouseId}")]
        public async Task<IActionResult> AddSpouse(long id, long spouseId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var relationship = await _contactsService.AddSpouse(id, firmId, spouseId);
            return Ok(new { message = "Spouse added successfully", relationship });
        }

        [HttpPost("{id}/relatives")]
        public async Task<IActionResult> AddRelative(long id, [FromBody] AddRelativeDto relativeDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var relationship = await _contactsService.AddRelative(id, firmId, relativeDto);
            return Ok(new { message = "Relative added successfully", relationship });
        }

        [HttpDelete("relationships/{relationshipId}")]
        public async Task<IActionResult> RemoveRelationship(long relationshipId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _contactsService.RemoveRelationship(relationshipId, firmId);
            if (!result)
                return NotFound(new { message = "Relationship not found" });
            return Ok(new { message = "Relationship removed successfully" });
        }

        // Tags
        [HttpGet("tags")]
        public async Task<IActionResult> GetTags()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tags = await _contactsService.GetTags(firmId);
            return Ok(tags);
        }

        [HttpPost("tags")]
        public async Task<IActionResult> CreateTag([FromBody] CreateTagDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tag = await _contactsService.CreateTag(firmId, createDto);
            return Ok(new { message = "Tag created successfully", tag });
        }

        [HttpPost("{id}/tags/{tagId}")]
        public async Task<IActionResult> AddTagToContact(long id, long tagId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            await _contactsService.AddTagToContact(id, firmId, tagId);
            return Ok(new { message = "Tag added to contact" });
        }

        [HttpDelete("{id}/tags/{tagId}")]
        public async Task<IActionResult> RemoveTagFromContact(long id, long tagId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            await _contactsService.RemoveTagFromContact(id, firmId, tagId);
            return Ok(new { message = "Tag removed from contact" });
        }

        [HttpGet("by-tag/{tagId}")]
        public async Task<IActionResult> GetContactsByTag(long tagId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var contacts = await _contactsService.GetContactsByTag(tagId, firmId);
            return Ok(contacts);
        }

        // Contact Dashboard
        [HttpGet("{id}/matters")]
        public async Task<IActionResult> GetContactMatters(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var matters = await _contactsService.GetContactMatters(id, firmId);
            return Ok(matters);
        }

        [HttpGet("{id}/tasks")]
        public async Task<IActionResult> GetContactTasks(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tasks = await _contactsService.GetContactTasks(id, firmId);
            return Ok(tasks);
        }

        [HttpGet("{id}/documents")]
        public async Task<IActionResult> GetContactDocuments(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var documents = await _contactsService.GetContactDocuments(id, firmId);
            return Ok(documents);
        }

        // Statistics
        [HttpGet("stats")]
        public async Task<IActionResult> GetContactStats()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var stats = await _contactsService.GetContactStats(firmId);
            return Ok(stats);
        }
    }
}