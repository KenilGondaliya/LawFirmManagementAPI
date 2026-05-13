// src/pages/Contacts/ContactsList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  Search, 
  UserIcon, 
  Building,
  Mail,
  PhoneIcon,
  FunnelIcon,
  X
} from 'lucide-react';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { Card } from '../../components/UI/Card';

export const ContactsList: React.FC = () => {
  const navigate = useNavigate();
  const { contacts, isLoading, fetchContacts, fetchStats, stats } = useContactStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchContacts({ search: searchTerm || undefined, isClient: filterClient || undefined });
    fetchStats();
  }, [searchTerm, filterClient, fetchContacts, fetchStats]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterClient(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your clients, opponents, and other contacts</p>
        </div>
        <Button onClick={() => navigate('/contacts/create')}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.clients}</p>
            <p className="text-sm text-gray-500">Clients</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.opponents}</p>
            <p className="text-sm text-gray-500">Opponents</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.witnesses}</p>
            <p className="text-sm text-gray-500">Witnesses</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.advocates}</p>
            <p className="text-sm text-gray-500">Advocates</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.important}</p>
            <p className="text-sm text-gray-500">Important</p>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={handleSearch}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              {(filterClient !== null) && (
                <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>
              )}
            </Button>
            {(searchTerm || filterClient !== null) && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterClient(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterClient === null
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterClient(true)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterClient === true
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clients Only
              </button>
              <button
                onClick={() => setFilterClient(false)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterClient === false
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Non-Clients
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Contacts List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          description="Add your contacts now and enjoy the simplicity of seamless collaboration."
          buttonText="Add Contact Now"
          onButtonClick={() => navigate('/contacts/create')}
          icon={<UserIcon className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => navigate(`/contacts/${contact.id}`)}
              className="cursor-pointer"
            >
              <Card className="p-4 hover:shadow-md transition-all hover:border-primary-200 h-full">
                <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  {contact.profileImageUrl ? (
                    <img
                      src={contact.profileImageUrl}
                      alt={contact.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 font-semibold text-lg">
                      {getInitials(contact.firstName, contact.lastName)}
                    </span>
                  )}
                </div>
                
                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {contact.fullName}
                    </h3>
                    {contact.isImportant && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                        ⭐ Important
                      </span>
                    )}
                    {contact.isClient && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        Client
                      </span>
                    )}
                    {contact.isOpponent && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                        Opponent
                      </span>
                    )}
                  </div>
                  
                  {contact.companyName && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Building className="w-3 h-3" />
                      <span className="truncate">{contact.companyName}</span>
                    </div>
                  )}
                  
                  {contact.email && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <PhoneIcon className="w-3 h-3" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contact.tags.slice(0, 3).map((tag: any) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                            color: tag.color || '#374151',
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {contact.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{contact.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Role Badge */}
                <div className="flex-shrink-0">
                  {contact.title && (
                    <span className="text-xs text-gray-400">{contact.title}</span>
                  )}
                </div>
              </div>
            </Card>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};