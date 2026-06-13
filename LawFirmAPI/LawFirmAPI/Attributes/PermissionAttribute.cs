// Attributes/PermissionAttribute.cs
using Microsoft.AspNetCore.Authorization;

namespace LawFirmAPI.Attributes
{
    public class RequirePermissionAttribute : AuthorizeAttribute
    {
        public RequirePermissionAttribute(string permission)
        {
            Policy = permission;
        }
    }
    
    public class RequireRoleAttribute : AuthorizeAttribute
    {
        public RequireRoleAttribute(params string[] roles)
        {
            Roles = string.Join(",", roles);
        }
    }
}