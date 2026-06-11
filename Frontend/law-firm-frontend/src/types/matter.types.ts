// src/types/matter.types.ts

export interface Matter {
  id: number;
  uuid: string;
  matterNumber: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'PENDING' | 'CLOSED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  openDate: string;
  pendingDate?: string;
  closedDate?: string;
  statuteOfLimitationsDate?: string;
  estimatedValue?: number;
  billingMethod?: 'HOURLY' | 'FIXED' | 'CONTINGENCY' | 'RETAINER';
  hourlyRate?: number;
  fixedFee?: number;
  matterTypeId?: number;
  matterTypeName?: string;
  matterTypeCategory?: string;
  originatingAdvocateId?: number;
  originatingAdvocateName?: string;
  responsibleAdvocateId?: number;
  responsibleAdvocateName?: string;
  practiceAreaId?: number;
  practiceAreaName?: string;
  courtId?: number;
  courtName?: string;
  judicialDistrictId?: number;
  judicialDistrictName?: string;
  clientReference?: string;
  isConfidential: boolean;
  parties: MatterParty[];
  notes: MatterNote[];
  createdAt: string;
  updatedAt: string;
}

export interface MatterParty {
  id: number;
  contactId: number;
  contactName: string;
  partyType: string;
  roleDescription?: string;
  isPrimary: boolean;
}

export interface MatterNote {
  id: number;
  note: string;
  isPrivate: boolean;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatterType {
  id: number;
  name: string;
  category: 'LITIGATION' | 'NON_LITIGATION' | 'CORPORATE' | 'FAMILY' | 'CRIMINAL' | 'CIVIL' | 'OTHER';
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PracticeArea {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Court {
  id: number;
  name: string;
  level?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface JudicialDistrict {
  id: number;
  name: string;
  state?: string;
  description?: string;
  createdAt: string;
}

export interface MatterStats {
  total: number;
  open: number;
  pending: number;
  closed: number;
  archived: number;
  highPriority: number;
  urgentPriority: number;
  litigation: number;
  nonLitigation: number;
}

export interface MatterTimeline {
  id: number;
  activityType: string;
  description: string;
  userName?: string;
  createdAt: string;
}

export interface MatterDocument {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedByName?: string;
}

export interface MatterTask {
  id: number;
  title: string;
  dueDate?: string;
  statusName: string;
  statusColor?: string;
  priorityName: string;
  priorityColor?: string;
  completedAt?: string;
}

export interface MatterEvent {
  id: number;
  title: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  eventType: string;
  isAllDay: boolean;
}

export interface MatterBill {
  id: number;
  billNumber: string;
  totalAmount: number;
  balanceDue: number;
  dueDate: string;
  statusName: string;
  statusColor?: string;
}

export interface TimeEntry {
  id: number;
  date: string;
  duration: number;
  description: string;
  billable: boolean;
  billingRate: number;
  total: number;
  createdAt: string;
}

export interface MatterDeadline {
  id: number;
  title: string;
  deadlineDate: string;
  isMet: boolean;
  notes?: string;
  createdAt: string;
}

export interface CreateMatterData {
  matterTypeId: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  openDate: string;
  pendingDate?: string;
  statuteOfLimitationsDate?: string;
  estimatedValue?: number;
  billingMethod?: string;
  hourlyRate?: number;
  fixedFee?: number;
  originatingAdvocateId?: number;
  responsibleAdvocateId?: number;
  practiceAreaId?: number;
  courtId?: number;
  judicialDistrictId?: number;
  clientReference?: string;
  isConfidential?: boolean;
  parties?: AddMatterParty[];
}

export interface AddMatterParty {
  contactId: number;
  partyType: string;
  roleDescription?: string;
  isPrimary?: boolean;
}

export interface AddMatterNote {
  note: string;
  isPrivate?: boolean;
}

export interface AddTimeEntry {
  date: string;
  duration: number;
  description: string;
  billable?: boolean;
  billingRate?: number;
}

export interface AddDeadline {
  title: string;
  deadlineDate: string;
  notes?: string;
}

export interface AdvancedSearchParams {
  title?: string;
  matterNumber?: string;
  status?: string[];
  priority?: string[];
  practiceAreaId?: number[];
  responsibleAdvocateId?: number;
  clientName?: string;
  openDateFrom?: string;
  openDateTo?: string;
  estimatedValueMin?: number;
  estimatedValueMax?: number;
}

export interface BulkUpdateData {
  matterIds: number[];
  status?: string;
  advocateId?: number;
}

export interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  error: string;
}