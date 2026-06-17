import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeftIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { matterService } from '../../services/matter.service';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import toast from 'react-hot-toast';

interface MatterFormData {
  matterTypeId: number;
  title: string;
  description: string;
  priority: string;
  openDate: string;
  pendingDate?: string;
  statuteOfLimitationsDate?: string;
  estimatedValue?: number;
  billingMethod: string;
  hourlyRate?: number;
  fixedFee?: number;
  originatingAdvocateId?: number;
  responsibleAdvocateId?: number;
  practiceAreaId?: number;
  courtId?: number;
  judicialDistrictId?: number;
  clientReference?: string;
  isConfidential: boolean;
  parties: Array<{
    contactId: number;
    partyType: string;
    roleDescription: string;
    isPrimary: boolean;
  }>;
}

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const billingMethodOptions = [
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'FIXED', label: 'Fixed Fee' },
  { value: 'CONTINGENCY', label: 'Contingency' },
  { value: 'RETAINER', label: 'Retainer' },
];

const partyTypeOptions = [
  { value: 'CLIENT', label: 'Client', icon: '👤' },
  { value: 'OPPONENT', label: 'Opponent', icon: '⚔️' },
  { value: 'WITNESS', label: 'Witness', icon: '👁️' },
  { value: 'ADVOCATE', label: 'Advocate', icon: '⚖️' },
  { value: 'JUDGE', label: 'Judge', icon: '👨‍⚖️' },
  { value: 'EXPERT', label: 'Expert', icon: '🔬' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
];

export const CreateMatter: React.FC = () => {
  const navigate = useNavigate();
  const { createMatter, matterTypes, fetchMatterTypes, practiceAreas, fetchPracticeAreas } = useMatterStore();
  const { contacts, fetchContacts } = useContactStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courts, setCourts] = useState<Array<{ id: number; name: string; city?: string; state?: string }>>([]);
  const [judicialDistricts, setJudicialDistricts] = useState<Array<{ id: number; name: string; state?: string }>>([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<MatterFormData>({
    defaultValues: {
      priority: 'MEDIUM',
      billingMethod: 'HOURLY',
      isConfidential: false,
      openDate: new Date().toISOString().split('T')[0],
      parties: [],
    }
  });

  const { fields: partyFields, append: addParty, remove: removeParty } = useFieldArray({
    control,
    name: 'parties'
  });

  useEffect(() => {
    fetchMatterTypes();
    fetchPracticeAreas();
    fetchContacts({});
    loadCourtsAndDistricts();
  }, []);

  const loadCourtsAndDistricts = async () => {
    setLoadingCourts(true);
    setLoadingDistricts(true);
    try {
      const data = await matterService.getCourtsAndDistricts();
      setCourts(data.courts);
      setJudicialDistricts(data.judicialDistricts);
    } catch (error) {
      console.error('Failed to load courts and districts:', error);
      await loadCourts();
      await loadJudicialDistricts();
    } finally {
      setLoadingCourts(false);
      setLoadingDistricts(false);
    }
  };

  const loadCourts = async () => {
    try {
      const data = await matterService.getCourts();
      setCourts(data);
    } catch (error) {
      console.error('Failed to load courts:', error);
      setCourts([]);
    }
  };

  const loadJudicialDistricts = async () => {
    try {
      const data = await matterService.getJudicialDistricts();
      setJudicialDistricts(data);
    } catch (error) {
      console.error('Failed to load judicial districts:', error);
      setJudicialDistricts([]);
    }
  };

  const onSubmit = async (data: MatterFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        matterTypeId: data.matterTypeId,
        title: data.title,
        description: data.description,
        status: 'OPEN' as const,
        priority: data.priority,
        openDate: data.openDate,
        pendingDate: data.pendingDate,
        statuteOfLimitationsDate: data.statuteOfLimitationsDate,
        estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : undefined,
        billingMethod: data.billingMethod,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
        fixedFee: data.fixedFee ? Number(data.fixedFee) : undefined,
        originatingAdvocateId: data.originatingAdvocateId ?? undefined,
        responsibleAdvocateId: data.responsibleAdvocateId ?? undefined,
        practiceAreaId: data.practiceAreaId ?? undefined,
        courtId: data.courtId && data.courtId > 0 ? Number(data.courtId) : undefined,
        judicialDistrictId: data.judicialDistrictId && data.judicialDistrictId > 0 ? Number(data.judicialDistrictId) : undefined,
        clientReference: data.clientReference,
        isConfidential: data.isConfidential,
        parties: data.parties.filter(p => p.contactId !== 0)
      };

      const matter = await createMatter(submitData);
      if (matter) {
        toast.success('Matter created successfully');
        navigate(`/matters/${matter.id}`);
      }
    } catch (error: any) {
      console.error('Failed to create matter:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create matter');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchBillingMethod = watch('billingMethod');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/matters')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Matter</h1>
          <p className="text-gray-500 mt-1">Enter matter details to add to your firm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matter Type *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('matterTypeId', { required: 'Matter type is required' })}
              >
                <option value="">Select matter type...</option>
                {matterTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.category})
                  </option>
                ))}
              </select>
              {errors.matterTypeId && <p className="text-red-500 text-sm mt-1">{errors.matterTypeId.message}</p>}
            </div>

            <Input
              label="Title *"
              placeholder="Enter matter title"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the matter..."
                {...register('description')}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('priority', { required: 'Priority is required' })}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Practice Area</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('practiceAreaId')}
              >
                <option value="">Select practice area...</option>
                {practiceAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
                {...register('isConfidential')}
              />
              <span className="text-sm text-gray-700">Mark as confidential</span>
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Open Date *"
              type="date"
              error={errors.openDate?.message}
              {...register('openDate', { required: 'Open date is required' })}
            />
            <Input
              label="Pending Date"
              type="date"
              {...register('pendingDate')}
            />
            <Input
              label="Statute of Limitations Date"
              type="date"
              {...register('statuteOfLimitationsDate')}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Estimated Value"
              type="number"
              placeholder="0.00"
              {...register('estimatedValue')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Method</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('billingMethod')}
              >
                {billingMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {watchBillingMethod === 'HOURLY' && (
              <Input
                label="Hourly Rate ($)"
                type="number"
                placeholder="0.00"
                {...register('hourlyRate')}
              />
            )}

            {watchBillingMethod === 'FIXED' && (
              <Input
                label="Fixed Fee ($)"
                type="number"
                placeholder="0.00"
                {...register('fixedFee')}
              />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Client Reference"
              placeholder="Client's reference number"
              {...register('clientReference')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Court</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('courtId')}
                disabled={loadingCourts}
              >
                <option value="">Select court...</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name} {court.city ? `(${court.city})` : ''}
                  </option>
                ))}
              </select>
              {loadingCourts && <p className="text-sm text-gray-400 mt-1">Loading courts...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judicial District</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('judicialDistrictId')}
                disabled={loadingDistricts}
              >
                <option value="">Select judicial district...</option>
                {judicialDistricts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name} {district.state ? `(${district.state})` : ''}
                  </option>
                ))}
              </select>
              {loadingDistricts && <p className="text-sm text-gray-400 mt-1">Loading districts...</p>}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Parties</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addParty({ contactId: 0, partyType: 'CLIENT', roleDescription: '', isPrimary: false })}
            >
              <UserPlusIcon className="w-4 h-4 mr-1" />
              Add Party
            </Button>
          </div>

          {partyFields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">Party {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeParty(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register(`parties.${index}.contactId`, { required: 'Contact is required' })}
                  >
                    <option value={0}>Select contact...</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.fullName} {contact.companyName ? `(${contact.companyName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Party Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register(`parties.${index}.partyType`)}
                  >
                    {partyTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Role Description"
                  placeholder="e.g., Lead Counsel, Expert Witness"
                  {...register(`parties.${index}.roleDescription`)}
                />

                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-600"
                    {...register(`parties.${index}.isPrimary`)}
                  />
                  <span className="text-sm text-gray-700">Primary party</span>
                </label>
              </div>
            </div>
          ))}

          {partyFields.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p>No parties added yet. Click "Add Party" to add clients, opponents, or other parties.</p>
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/matters')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Matter
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMatter;