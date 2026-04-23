import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, User, Briefcase, Star, MoreVertical, Edit, Trash2 } from 'lucide-react';
import useContactStore from '../../stores/contactStore';
import useUIStore from '../../stores/uiStore';
import LoadingSpinner from '../common/LoadingSpinner';
import ContactForm from './ContactForm';

const ContactsList = () => {
  const navigate = useNavigate();
  const { 
    contacts, 
    isLoading, 
    fetchContacts, 
    deleteContact,
    searchQuery,
    filterClient,
    setSearchQuery,
    setFilterClient,
    stats,
    fetchStats
  } = useContactStore();
  const { openModal, closeModal } = useUIStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
    }
  };

  const handleCreateContact = () => {
    openModal(<ContactForm onSuccess={() => {
      fetchContacts();
      closeModal();
    }} />);
  };

  const handleEditContact = (contact) => {
    openModal(<ContactForm contact={contact} onSuccess={() => {
      fetchContacts();
      closeModal();
    }} />);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your clients, witnesses, and other contacts</p>
        </div>
        <button
          onClick={handleCreateContact}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Clients</p>
            <p className="text-2xl font-bold text-blue-600">{stats.clients || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Opponents</p>
            <p className="text-2xl font-bold text-red-600">{stats.opponents || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Witnesses</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.witnesses || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Judges</p>
            <p className="text-2xl font-bold text-purple-600">{stats.judges || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Advocates</p>
            <p className="text-2xl font-bold text-green-600">{stats.advocates || 0}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchContacts({ search: e.target.value });
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
        >
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg p-4 shadow-sm border flex gap-4">
          <button
            onClick={() => {
              setFilterClient(null);
              fetchContacts({ isClient: null });
            }}
            className={`px-3 py-1 rounded-full text-sm ${filterClient === null ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilterClient(true);
              fetchContacts({ isClient: true });
            }}
            className={`px-3 py-1 rounded-full text-sm ${filterClient === true ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Clients Only
          </button>
          <button
            onClick={() => {
              setFilterClient(false);
              fetchContacts({ isClient: false });
            }}
            className={`px-3 py-1 rounded-full text-sm ${filterClient === false ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Non-Clients
          </button>
        </div>
      )}

      {/* Contacts Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new contact.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateContact}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Contact
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-lg border hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/contacts/${contact.id}`)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold">
                      {getInitials(contact.firstName, contact.lastName)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contact.fullName}</h3>
                      {contact.companyName && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Briefcase size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">{contact.companyName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {contact.isImportant && (
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditContact(contact);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit size={16} className="text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contact.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  {contact.email && (
                    <p className="text-sm text-gray-600">{contact.email}</p>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {contact.isClient && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Client</span>
                  )}
                  {contact.isOpponent && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Opponent</span>
                  )}
                  {contact.isWitness && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Witness</span>
                  )}
                  {contact.isJudge && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">Judge</span>
                  )}
                  {contact.isAdvocate && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Advocate</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsList;