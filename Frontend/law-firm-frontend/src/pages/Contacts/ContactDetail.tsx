// src/pages/Contacts/ContactDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  Mail,
  PhoneIcon,
  MapPinIcon,
  Building,
  BriefcaseIcon,
  CalendarIcon,
  TagIcon,
  UserPlusIcon,
  FileText,
  CheckCircleIcon,
  MailIcon,
  PhoneCallIcon,
  HomeIcon,
  GlobeIcon,
  AwardIcon,
  UsersIcon,
} from 'lucide-react';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/UI/Modal';
import toast from 'react-hot-toast';

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedContact, isLoading, fetchContactById, deleteContact, clearSelectedContact } = useContactStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'matters' | 'tasks' | 'documents'>('details');

  useEffect(() => {
    if (id) {
      fetchContactById(parseInt(id));
    }
    return () => {
      clearSelectedContact();
    };
  }, [id, fetchContactById, clearSelectedContact]);

  const handleDelete = async () => {
    if (id) {
      const success = await deleteContact(parseInt(id));
      if (success) {
        navigate('/contacts');
      }
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedContact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contact not found</p>
        <Button onClick={() => navigate('/contacts')} className="mt-4">
          Back to Contacts
        </Button>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contacts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            {/* Large Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              {selectedContact.profileImageUrl ? (
                <img
                  src={selectedContact.profileImageUrl}
                  alt={selectedContact.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-600 font-bold text-2xl">
                  {getInitials(selectedContact.firstName, selectedContact.lastName)}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{selectedContact.fullName}</h1>
                {selectedContact.isImportant && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                    ⭐ Important
                  </span>
                )}
                {selectedContact.isClient && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Client
                  </span>
                )}
                {selectedContact.isOpponent && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                    Opponent
                  </span>
                )}
                {selectedContact.isWitness && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    Witness
                  </span>
                )}
                {selectedContact.isJudge && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    Judge
                  </span>
                )}
                {selectedContact.isAdvocate && (
                  <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                    Advocate
                  </span>
                )}
              </div>
              {selectedContact.title && (
                <p className="text-gray-500 mt-1">{selectedContact.title}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/contacts/${id}/edit`)}
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['details', 'matters', 'tasks', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-1 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MailIcon className="w-5 h-5 text-primary-500" />
                Contact Information
              </h3>
              <div className="space-y-3">
                {selectedContact.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{selectedContact.email}</p>
                    </div>
                  </div>
                )}
                {/* {selectedContact.alternativeEmail && (
                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Alternative Email</p>
                      <p className="text-gray-900">{selectedContact.alternativeEmail}</p>
                    </div>
                  </div>
                )} */}
                {selectedContact.phone && (
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{selectedContact.phone}</p>
                    </div>
                  </div>
                )}
                {/* {selectedContact.alternativePhone && (
                  <div className="flex items-start gap-3">
                    <PhoneCallIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Alternative Phone</p>
                      <p className="text-gray-900">{selectedContact.alternativePhone}</p>
                    </div>
                  </div>
                )} */}
                {/* {selectedContact.fax && (
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Fax</p>
                      <p className="text-gray-900">{selectedContact.fax}</p>
                    </div>
                  </div>
                )} */}
                {/* {selectedContact.website && (
                  <div className="flex items-start gap-3">
                    <GlobeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a href={selectedContact.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {selectedContact.website}
                      </a>
                    </div>
                  </div>
                )} */}
              </div>
            </Card>

            {/* Professional Information */}
            {(selectedContact.companyName || selectedContact.department) && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary-500" />
                  Professional Information
                </h3>
                <div className="space-y-3">
                  {selectedContact.companyName && (
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="text-gray-900">{selectedContact.companyName}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.department && (
                    <div className="flex items-start gap-3">
                      <BriefcaseIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="text-gray-900">{selectedContact.department}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Addresses */}
            {selectedContact.addresses && selectedContact.addresses.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-primary-500" />
                  Addresses
                </h3>
                <div className="space-y-4">
                  {selectedContact.addresses.map((address) => (
                    <div key={address.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <HomeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">{address.addressType}</span>
                          {address.isPrimary && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Primary</span>
                          )}
                        </div>
                        <p className="text-gray-900 text-sm">
                          {address.addressLine1}
                          {address.addressLine2 && <>, {address.addressLine2}</>}
                          <br />
                          {address.city && <>{address.city}, </>}
                          {address.state && <>{address.state} </>}
                          {address.postalCode && <>{address.postalCode}</>}
                          {address.country && <><br />{address.country}</>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Additional Phones & Emails */}
            {(selectedContact.phones && selectedContact.phones.length > 0) && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PhoneCallIcon className="w-5 h-5 text-primary-500" />
                  Additional Phone Numbers
                </h3>
                <div className="space-y-2">
                  {selectedContact.phones.map((phone) => (
                    <div key={phone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{phone.phoneType}</span>
                        <p className="text-gray-900">{phone.phoneNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        {phone.isPrimary && <span className="text-xs text-primary-600">Primary</span>}
                        {phone.isWhatsapp && <span className="text-xs text-green-600">WhatsApp</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Notes */}
            {selectedContact.notes && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.notes}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-primary-500" />
                  Tags
                </h3>
              </div>
              {selectedContact.tags && selectedContact.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedContact.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                        color: tag.color || '#374151',
                        border: `1px solid ${tag.color || '#e5e7eb'}`,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No tags added</p>
              )}
            </Card>

            {/* Personal Information */}
            {/* {(selectedContact.dateOfBirth || selectedContact.gender || selectedContact.maritalStatus || selectedContact.nationality) && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary-500" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  {selectedContact.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-gray-900">
                          {new Date(selectedContact.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedContact.gender && (
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-gray-900 capitalize">{selectedContact.gender}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.maritalStatus && (
                    <div className="flex items-center gap-3">
                      <AwardIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Marital Status</p>
                        <p className="text-gray-900 capitalize">{selectedContact.maritalStatus}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.nationality && (
                    <div className="flex items-center gap-3">
                      <GlobeIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Nationality</p>
                        <p className="text-gray-900">{selectedContact.nationality}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )} */}

            {/* Legal Information */}
            {/* {(selectedContact.taxId || selectedContact.identificationNumber) && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                  Legal Information
                </h3>
                <div className="space-y-3">
                  {selectedContact.taxId && (
                    <div>
                      <p className="text-sm text-gray-500">Tax ID / VAT</p>
                      <p className="text-gray-900">{selectedContact.taxId}</p>
                    </div>
                  )}
                  {selectedContact.identificationNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Identification Number</p>
                      <p className="text-gray-900">{selectedContact.identificationNumber}</p>
                      {selectedContact.identificationType && (
                        <p className="text-xs text-gray-400">Type: {selectedContact.identificationType}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )} */}

            {/* Relationships */}
            {(selectedContact.spouse || (selectedContact.relatives && selectedContact.relatives.length > 0)) && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserPlusIcon className="w-5 h-5 text-primary-500" />
                  Relationships
                </h3>
                <div className="space-y-3">
                  {selectedContact.spouse && (
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <UserPlusIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Spouse</p>
                        <p className="text-gray-900 font-medium">{selectedContact.spouse.relatedContactName}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.relatives && selectedContact.relatives.map((relative: any) => (
                    <div key={relative.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <UserPlusIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 capitalize">{relative.relationshipType}</p>
                        <p className="text-gray-900 font-medium">{relative.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'matters' && (
        <Card>
          <div className="text-center py-12">
            <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No matters associated with this contact</p>
            <Button variant="outline" className="mt-4">
              Associate Matter
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card>
          <div className="text-center py-12">
            <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks assigned to this contact</p>
            <Button variant="outline" className="mt-4">
              Create Task
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'documents' && (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents for this contact</p>
            <Button variant="outline" className="mt-4">
              Upload Document
            </Button>
          </div>
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Contact"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong className="text-gray-900">{selectedContact.fullName}</strong>? 
            This action cannot be undone and will remove all associated data.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Contact
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};