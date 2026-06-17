import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useMatterStore } from '../../stores/matterStore';
import { matterService } from '../../services/matter.service';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

interface EditMatterFormData {
  title: string;
  description: string;
  priority: string;
  estimatedValue?: number;
  billingMethod: string;
  hourlyRate?: number;
  fixedFee?: number;
  responsibleAdvocateId?: number;
  practiceAreaId?: number;
  courtId?: number;
  judicialDistrictId?: number;
  clientReference?: string;
  closedDate?: string;
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

export const EditMatter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedMatter, 
    isLoading, 
    fetchMatterById, 
    updateMatter, 
    clearSelectedMatter, 
    practiceAreas, 
    fetchPracticeAreas 
  } = useMatterStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courts, setCourts] = useState<Array<{ id: number; name: string; city?: string; state?: string }>>([]);
  const [judicialDistricts, setJudicialDistricts] = useState<Array<{ id: number; name: string; state?: string }>>([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EditMatterFormData>();

  useEffect(() => {
    if (id) {
      const matterId = parseInt(id);
      fetchMatterById(matterId);
      fetchPracticeAreas();
      loadCourtsAndDistricts();
    }
    return () => {
      clearSelectedMatter();
    };
  }, [id]);

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

  useEffect(() => {
    if (selectedMatter) {
      setValue('title', selectedMatter.title);
      setValue('description', selectedMatter.description || '');
      setValue('priority', selectedMatter.priority);
      setValue('estimatedValue', selectedMatter.estimatedValue);
      setValue('billingMethod', selectedMatter.billingMethod || 'HOURLY');
      setValue('hourlyRate', selectedMatter.hourlyRate);
      setValue('fixedFee', selectedMatter.fixedFee);
      setValue('responsibleAdvocateId', selectedMatter.responsibleAdvocateId);
      setValue('practiceAreaId', selectedMatter.practiceAreaId);
      setValue('courtId', selectedMatter.courtId);
      setValue('judicialDistrictId', selectedMatter.judicialDistrictId);
      setValue('clientReference', selectedMatter.clientReference || '');
      setValue('closedDate', selectedMatter.closedDate?.split('T')[0] || '');
    }
  }, [selectedMatter, setValue]);

  const onSubmit = async (data: EditMatterFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const submitData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : undefined,
        billingMethod: data.billingMethod,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
        fixedFee: data.fixedFee ? Number(data.fixedFee) : undefined,
        responsibleAdvocateId: data.responsibleAdvocateId ?? undefined,
        practiceAreaId: data.practiceAreaId ?? undefined,
        courtId: data.courtId && data.courtId > 0 ? Number(data.courtId) : undefined,
        judicialDistrictId: data.judicialDistrictId && data.judicialDistrictId > 0 ? Number(data.judicialDistrictId) : undefined,
        clientReference: data.clientReference,
        closedDate: data.closedDate,
      };

      const matter = await updateMatter(parseInt(id), submitData);
      if (matter) {
        toast.success('Matter updated successfully');
        navigate(`/matters/${id}`);
      }
    } catch (error: any) {
      console.error('Failed to update matter:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.title || 'Failed to update matter');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchBillingMethod = watch('billingMethod');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedMatter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Matter not found</p>
        <Button onClick={() => navigate('/matters')} className="mt-4">
          Back to Matters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/matters/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Matter</h1>
          <p className="text-gray-500 mt-1">{selectedMatter.matterNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Title *"
              placeholder="Enter matter title"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />

            <div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('priority')}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Client Reference"
              placeholder="Client's reference number"
              {...register('clientReference')}
            />

            <Input
              label="Closed Date"
              type="date"
              {...register('closedDate')}
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/matters/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMatter;