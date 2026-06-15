// src/pages/Settings/Team.tsx
import React, { useEffect, useState } from "react";
import {
  settingsService,
  TeamMember,
  Role,
  InviteUserDto,
} from "../../services/settings.service";
import { usePermissions } from "../../hooks/usePermissions";
import { Button } from "../../components/UI/Button";
import { Card } from "../../components/UI/Card";
import { Modal } from "../../components/UI/Modal";
import { Input } from "../../components/UI/Input";
import { LoadingSpinner } from "../../components/Common/LoadingSpinner";
import {
  UserPlusIcon,
  TrashIcon,
  ShieldIcon,
  MailIcon,
  XIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const getAbsoluteImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/')) {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5165';
    return `${baseUrl}${url}`;
  }
  
  return url;
};

export const Team: React.FC = () => {
  const { canManageUsers, isAdmin } = usePermissions();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteUserDto>({
    email: "",
    firstName: "",
    lastName: "",
    role: "STAFF",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const normalizeMemberUrls = (members: TeamMember[]) =>
    members.map((member) => ({
      ...member,
      profileImageUrl: getAbsoluteImageUrl(member.profileImageUrl),
    }));

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [membersData, rolesData] = await Promise.all([
        settingsService.getTeamMembers(),
        settingsService.getRoles(),
      ]);
      setMembers(normalizeMemberUrls(membersData));
      setRoles(rolesData);
    } catch (error) {
      toast.error("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await settingsService.inviteMember(inviteData);
      toast.success("Invitation sent successfully");
      setShowInviteModal(false);
      setInviteData({ email: "", firstName: "", lastName: "", role: "STAFF" });
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await settingsService.updateMemberRole(userId, newRole);
      toast.success("Role updated successfully");
      await loadData();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: number, name: string) => {
    if (
      window.confirm(`Are you sure you want to remove ${name} from the team?`)
    ) {
      try {
        await settingsService.removeTeamMember(userId);
        toast.success("Team member removed successfully");
        await loadData();
      } catch (error) {
        toast.error("Failed to remove team member");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-1">
            Manage your team members and their roles
          </p>
        </div>
        {canManageUsers() && (
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Joined
                </th>
                {isAdmin() && (
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {member.profileImageUrl ? (
                        <img
                          src={member.profileImageUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {member.firstName?.charAt(0)}
                            {member.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {member.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{member.email}</td>
                  <td className="py-3 px-4">
                    {isAdmin() ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.userId, e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        {roles.map((role) => (
                          <option key={role.name} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-600">{member.role}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(member.status)}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm">
                    {member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  {isAdmin() && (
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          handleRemoveMember(member.userId, member.fullName)
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@example.com"
            value={inviteData.email}
            onChange={(e) =>
              setInviteData({ ...inviteData, email: e.target.value })
            }
            icon={<MailIcon className="w-4 h-4" />}
            required
          />
          <Input
            label="First Name"
            placeholder="First name"
            value={inviteData.firstName}
            onChange={(e) =>
              setInviteData({ ...inviteData, firstName: e.target.value })
            }
            required
          />
          <Input
            label="Last Name"
            placeholder="Last name"
            value={inviteData.lastName}
            onChange={(e) =>
              setInviteData({ ...inviteData, lastName: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={inviteData.role}
              onChange={(e) =>
                setInviteData({ ...inviteData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {roles.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
