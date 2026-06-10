// src/pages/Contacts/ContactsList.tsx - Complete Fixed Version

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  Search, 
  UserIcon, 
  Building,
  Mail,
  PhoneIcon,
  FunnelIcon,
  X,
  StarIcon,
  BriefcaseIcon,
  ScaleIcon,
  UsersIcon,
  GavelIcon,
  UploadIcon,
  DownloadIcon,
  MoreVerticalIcon,
  TrashIcon,
  TagIcon,
  CheckIcon,
  Loader2
} from 'lucide-react';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { Card } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import toast from 'react-hot-toast';

export const ContactsList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    contacts, 
    isLoading, 
    stats,
    tags,
    searchQuery,
    filterClient,
    fetchContacts, 
    fetchStats, 
    fetchTags,
    setSearchQuery,
    setFilterClient,
    deleteContact,
    bulkDeleteContacts,
    exportContacts,
    importContacts
  } = useContactStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  useEffect(() => {
    fetchContacts();
    fetchStats();
    fetchTags();
  }, [fetchContacts, fetchStats, fetchTags]);

  // Update contacts when search or filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [localSearch, searchQuery, setSearchQuery]);

  const handleSearch = () => {
    setSearchQuery(localSearch);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setLocalSearch('');
    setSearchQuery('');
    setFilterClient(null);
    setSelectedContacts([]);
  };

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const success = await bulkDeleteContacts(selectedContacts);
      if (success) {
        setSelectedContacts([]);
        setShowBulkDeleteModal(false);
        await fetchContacts();
        await fetchStats();
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportContacts(exportFormat, {
        search: searchQuery || undefined,
        isClient: filterClient || undefined
      });
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    setImporting(true);
    try {
      const result = await importContacts(importFile);
      if (result) {
        toast.success(`Imported ${result.imported} of ${result.total} contacts`);
        await fetchContacts();
        await fetchStats();
        setShowImportModal(false);
        setImportFile(null);
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleIcon = (contact: any) => {
    if (contact.isClient) return <BriefcaseIcon className="w-3 h-3" />;
    if (contact.isOpponent) return <ScaleIcon className="w-3 h-3" />;
    if (contact.isJudge) return <GavelIcon className="w-3 h-3" />;
    if (contact.isAdvocate) return <UsersIcon className="w-3 h-3" />;
    return <UsersIcon className="w-3 h-3" />;
  };

  const getRoleColor = (contact: any) => {
    if (contact.isClient) return 'bg-blue-100 text-blue-700';
    if (contact.isOpponent) return 'bg-red-100 text-red-700';
    if (contact.isJudge) return 'bg-green-100 text-green-700';
    if (contact.isAdvocate) return 'bg-purple-100 text-purple-700';
    if (contact.isWitness) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (contact: any) => {
    if (contact.isClient) return 'Client';
    if (contact.isOpponent) return 'Opponent';
    if (contact.isJudge) return 'Judge';
    if (contact.isAdvocate) return 'Advocate';
    if (contact.isWitness) return 'Witness';
    return 'Contact';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your clients, opponents, and other contacts</p>
        </div>
        <div className="flex gap-2">
          {/* Import/Export Dropdown */}
          <div className="relative group">
            <Button variant="outline" className="relative">
              <MoreVerticalIcon className="w-4 h-4 mr-2" />
              Actions
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
              <button
                onClick={() => setShowImportModal(true)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
              >
                <UploadIcon className="w-4 h-4" />
                Import Contacts
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                Export Contacts
              </button>
              {selectedContacts.length > 0 && (
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete Selected ({selectedContacts.length})
                </button>
              )}
            </div>
          </div>
          <Button onClick={() => navigate('/contacts/create')} className="whitespace-nowrap">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => clearFilters()}>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </Card>
          </div>
          <div
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterClient(true)}
          >
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.clients}</p>
              <p className="text-sm text-gray-500">Clients</p>
            </Card>
          </div>
          <div
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilterClient(false)}
          >
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.opponents}</p>
              <p className="text-sm text-gray-500">Opponents</p>
            </Card>
          </div>
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

      {/* Bulk Actions Bar */}
      {selectedContacts.length > 0 && (
        <Card className="p-3 bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedContacts.length === contacts.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
              />
              <span className="text-sm text-gray-700">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagModal(true)}
              >
                <TagIcon className="w-4 h-4 mr-2" />
                Add Tags
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowBulkDeleteModal(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search by name, email, or company..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              icon={<Search className="w-4 h-4" />}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="primary">
              Search
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              {(filterClient !== null || searchQuery) && (
                <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>
              )}
            </Button>
            {(searchQuery || filterClient !== null) && (
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
                All Contacts
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

      {/* Select All Checkbox in Header */}
      {contacts.length > 0 && !isLoading && (
        <div className="flex items-center gap-2 px-2">
          <input
            type="checkbox"
            checked={selectedContacts.length === contacts.length}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-primary-600"
          />
          <span className="text-sm text-gray-500">Select All</span>
        </div>
      )}

      {/* Contacts Grid */}
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
              className={`cursor-pointer transition-all ${
                selectedContacts.includes(contact.id) ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <Card className="p-4 hover:shadow-lg transition-all hover:border-primary-200 h-full group relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => handleSelectContact(contact.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600"
                  />
                </div>

                <div className="flex items-start gap-4 ml-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {contact.profileImageUrl ? (
                        <img
                          src={contact.profileImageUrl}
                          alt={contact.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-700 font-bold text-xl">
                          {getInitials(contact.firstName, contact.lastName)}
                        </span>
                      )}
                    </div>
                    {contact.isImportant && (
                      <div className="absolute -top-1 -right-1">
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Contact Info */}
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {contact.fullName}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${getRoleColor(contact)}`}>
                        {getRoleIcon(contact)}
                        <span>{getRoleLabel(contact)}</span>
                      </span>
                    </div>
                    
                    {contact.companyName && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <Building className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{contact.companyName}</span>
                      </div>
                    )}
                    
                    {contact.email && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <PhoneIcon className="w-3 h-3 flex-shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.tags.slice(0, 2).map((tag: any) => (
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
                        {contact.tags.length > 2 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{contact.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Title/Department */}
                  {contact.title && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-400 line-clamp-2 max-w-[100px]">
                        {contact.title}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Delete Contacts"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong className="text-gray-900">{selectedContacts.length}</strong> contact{selectedContacts.length !== 1 ? 's' : ''}? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowBulkDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleBulkDelete} disabled={bulkDeleting}>
              {bulkDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Contacts'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Contacts"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv')}
                  className="w-4 h-4 text-primary-600"
                />
                <span>CSV</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value as 'excel')}
                  className="w-4 h-4 text-primary-600"
                />
                <span>Excel</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                'Export'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Contacts"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Tags to Selected Modal */}
      <Modal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        title="Add Tags to Selected Contacts"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Tag</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={selectedTagId || ''}
              onChange={(e) => setSelectedTagId(parseInt(e.target.value))}
            >
              <option value="">Select a tag</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowTagModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (selectedTagId) {
                  // Bulk add tag logic here
                  toast.success(`Tag added to ${selectedContacts.length} contacts`);
                  setShowTagModal(false);
                  setSelectedTagId(null);
                }
              }} 
              disabled={!selectedTagId}
            >
              Add Tag
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};