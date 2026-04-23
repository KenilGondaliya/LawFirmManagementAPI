import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Briefcase, 
  Calendar, Building, Star, Users, FileText, CheckSquare, 
  MessageCircle, Plus, X
} from 'lucide-react';
import useContactStore from '../../stores/contactStore';
import useUIStore from '../../stores/uiStore';
import LoadingSpinner from '../common/LoadingSpinner';
import ContactForm from './ContactForm';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentContact, 
    fetchContactById, 
    deleteContact,
    addAddress,
    addPhone,
    addEmail,
    deleteAddress,
    deletePhone,
    deleteEmail,
    isLoading 
  } = useContactStore();
  const { openModal, closeModal } = useUIStore();
  const [activeTab, setActiveTab] = useState('details');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [newAddress, setNewAddress] = useState({ addressType: 'WORK', addressLine1: '', city: '', state: '', postalCode: '', country: '' });
  const [newPhone, setNewPhone] = useState({ phoneType: 'MOBILE', phoneNumber: '', isPrimary: false, isWhatsapp: false });
  const [newEmail, setNewEmail] = useState({ emailType: 'WORK', email: '', isPrimary: false });

  useEffect(() => {
    if (id) {
      fetchContactById(parseInt(id));
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(parseInt(id));
      navigate('/contacts');
    }
  };

  const handleEdit = () => {
    openModal(<ContactForm contact={currentContact} onSuccess={() => {
      fetchContactById(parseInt(id));
      closeModal();
    }} />);
  };

  const handleAddAddress = async () => {
    if (newAddress.addressLine1) {
      await addAddress(parseInt(id), newAddress);
      setShowAddAddress(false);
      setNewAddress({ addressType: 'WORK', addressLine1: '', city: '', state: '', postalCode: '', country: '' });
      fetchContactById(parseInt(id));
    }
  };

  const handleAddPhone = async () => {
    if (newPhone.phoneNumber) {
      await addPhone(parseInt(id), newPhone);
      setShowAddPhone(false);
      setNewPhone({ phoneType: 'MOBILE', phoneNumber: '', isPrimary: false, isWhatsapp: false });
      fetchContactById(parseInt(id));
    }
  };

  const handleAddEmail = async () => {
    if (newEmail.email) {
      await addEmail(parseInt(id), newEmail);
      setShowAddEmail(false);
      setNewEmail({ emailType: 'WORK', email: '', isPrimary: false });
      fetchContactById(parseInt(id));
    }
  };

  if (isLoading || !currentContact) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/contacts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentContact.fullName}</h1>
            {currentContact.companyName && (
              <p className="text-sm text-gray-600">{currentContact.title} at {currentContact.companyName}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit size={18} />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-4">
          {['details', 'matters', 'tasks', 'documents', 'communications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              
              {/* Email Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Email Addresses</h4>
                  <button
                    onClick={() => setShowAddEmail(!showAddEmail)}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Plus size={14} className="mr-1" /> Add Email
                  </button>
                </div>
                {showAddEmail && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex gap-2">
                      <select
                        value={newEmail.emailType}
                        onChange={(e) => setNewEmail({ ...newEmail, emailType: e.target.value })}
                        className="w-24 px-2 py-1 border rounded text-sm"
                      >
                        <option value="WORK">Work</option>
                        <option value="PERSONAL">Personal</option>
                      </select>
                      <input
                        type="email"
                        value={newEmail.email}
                        onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                        placeholder="Email address"
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      />
                      <label className="flex items-center space-x-1 text-sm">
                        <input
                          type="checkbox"
                          checked={newEmail.isPrimary}
                          onChange={(e) => setNewEmail({ ...newEmail, isPrimary: e.target.checked })}
                        />
                        <span>Primary</span>
                      </label>
                      <button
                        onClick={handleAddEmail}
                        className="px-2 py-1 bg-primary-600 text-white rounded text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddEmail(false)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {currentContact.emails && currentContact.emails.length > 0 ? (
                  <div className="space-y-2">
                    {currentContact.emails.map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <Mail size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm">{email.email}</p>
                            <p className="text-xs text-gray-500">{email.emailType}</p>
                          </div>
                          {email.isPrimary && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Primary</span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEmail(email.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No email addresses added</p>
                )}
              </div>

              {/* Phone Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Phone Numbers</h4>
                  <button
                    onClick={() => setShowAddPhone(!showAddPhone)}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Plus size={14} className="mr-1" /> Add Phone
                  </button>
                </div>
                {showAddPhone && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={newPhone.phoneType}
                        onChange={(e) => setNewPhone({ ...newPhone, phoneType: e.target.value })}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="MOBILE">Mobile</option>
                        <option value="WORK">Work</option>
                        <option value="HOME">Home</option>
                      </select>
                      <input
                        type="tel"
                        value={newPhone.phoneNumber}
                        onChange={(e) => setNewPhone({ ...newPhone, phoneNumber: e.target.value })}
                        placeholder="Phone number"
                        className="flex-1 min-w-[200px] px-2 py-1 border rounded text-sm"
                      />
                      <label className="flex items-center space-x-1 text-sm">
                        <input
                          type="checkbox"
                          checked={newPhone.isPrimary}
                          onChange={(e) => setNewPhone({ ...newPhone, isPrimary: e.target.checked })}
                        />
                        <span>Primary</span>
                      </label>
                      <label className="flex items-center space-x-1 text-sm">
                        <input
                          type="checkbox"
                          checked={newPhone.isWhatsapp}
                          onChange={(e) => setNewPhone({ ...newPhone, isWhatsapp: e.target.checked })}
                        />
                        <span>WhatsApp</span>
                      </label>
                      <button
                        onClick={handleAddPhone}
                        className="px-2 py-1 bg-primary-600 text-white rounded text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddPhone(false)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {currentContact.phones && currentContact.phones.length > 0 ? (
                  <div className="space-y-2">
                    {currentContact.phones.map((phone) => (
                      <div key={phone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <Phone size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm">{phone.phoneNumber}</p>
                            <p className="text-xs text-gray-500">{phone.phoneType}</p>
                          </div>
                          {phone.isPrimary && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Primary</span>
                          )}
                          {phone.isWhatsapp && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">WhatsApp</span>
                          )}
                        </div>
                        <button
                          onClick={() => deletePhone(phone.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No phone numbers added</p>
                )}
              </div>

              {/* Address Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Addresses</h4>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Plus size={14} className="mr-1" /> Add Address
                  </button>
                </div>
                {showAddAddress && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <select
                        value={newAddress.addressType}
                        onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="WORK">Work</option>
                        <option value="HOME">Home</option>
                        <option value="BILLING">Billing</option>
                      </select>
                      <textarea
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        placeholder="Street address"
                        rows="2"
                        className="w-full px-2 py-1 border rounded text-sm"
                      ></textarea>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="City"
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="State"
                          className="px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          placeholder="Postal Code"
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          placeholder="Country"
                          className="px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddAddress}
                          className="px-2 py-1 bg-primary-600 text-white rounded text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAddAddress(false)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {currentContact.addresses && currentContact.addresses.length > 0 ? (
                  <div className="space-y-2">
                    {currentContact.addresses.map((address) => (
                      <div key={address.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium">{address.addressType}</p>
                            <p className="text-sm mt-1">{address.addressLine1}</p>
                            <p className="text-sm">{address.city}, {address.state} {address.postalCode}</p>
                            <p className="text-sm">{address.country}</p>
                          </div>
                          <button
                            onClick={() => deleteAddress(address.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No addresses added</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Classification */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Classification</h3>
              <div className="flex flex-wrap gap-2">
                {currentContact.isClient && (
                  <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded">Client</span>
                )}
                {currentContact.isOpponent && (
                  <span className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded">Opponent</span>
                )}
                {currentContact.isWitness && (
                  <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-700 rounded">Witness</span>
                )}
                {currentContact.isJudge && (
                  <span className="px-2 py-1 text-sm bg-purple-100 text-purple-700 rounded">Judge</span>
                )}
                {currentContact.isAdvocate && (
                  <span className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded">Advocate</span>
                )}
                {currentContact.isImportant && (
                  <span className="px-2 py-1 text-sm bg-orange-100 text-orange-700 rounded flex items-center">
                    <Star size={12} className="mr-1" /> Important
                  </span>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="space-y-3">
                {currentContact.department && (
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm">{currentContact.department}</p>
                  </div>
                )}
                {currentContact.dateOfBirth && (
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm">{new Date(currentContact.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                {currentContact.maritalStatus && (
                  <div>
                    <p className="text-xs text-gray-500">Marital Status</p>
                    <p className="text-sm">{currentContact.maritalStatus}</p>
                  </div>
                )}
                {currentContact.notes && (
                  <div>
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm">{currentContact.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs Placeholders */}
      {activeTab !== 'details' && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500">Content for {activeTab} tab coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default ContactDetail;