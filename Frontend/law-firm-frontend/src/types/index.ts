// src/types/index.ts
export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  isEmailVerified?: boolean;
  roles?: string[];
  lastLoginAt?: string;
}

export interface Firm {
  id: number;
  name: string;
  logoUrl?: string;
  role: string;
  isPrimary: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
  firms: Firm[];
  currentFirm?: Firm;
  requiresFirmCreation?: boolean;
  requiresFirmSelection?: boolean;
}

export interface SwitchFirmDto {
  firmId: number;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface InviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface InviteResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  firmRole: string;
  status: string;
}


export interface Matter {
  id: number;
  uuid: string;
  matterNumber: string;
  title: string;
  description?: string;
  status: "OPEN" | "PENDING" | "CLOSED" | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  openDate: string;
  pendingDate?: string;
  closedDate?: string;
  statuteOfLimitationsDate?: string;
  estimatedValue?: number;
  billingMethod?: "HOURLY" | "FIXED" | "CONTINGENCY" | "RETAINER";
  hourlyRate?: number;
  fixedFee?: number;
  contingencyPercentage?: number;
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
  category:
    | "LITIGATION"
    | "NON_LITIGATION"
    | "CORPORATE"
    | "FAMILY"
    | "CRIMINAL"
    | "CIVIL"
    | "OTHER";
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
// src/types/index.ts - Update Contact interface

export interface Contact {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  
  // Contact Information
  email?: string;
  alternativeEmail?: string;
  phone?: string;
  alternativePhone?: string;
  fax?: string;
  website?: string;
  
  // Professional Information
  companyName?: string;
  title?: string;
  department?: string;
  
  // Personal Information
  prefix?: string;
  middleName?: string;
  suffix?: string;
  nickname?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  anniversary?: string;
  nationality?: string;
  
  // Legal Information
  taxId?: string;
  identificationNumber?: string;
  identificationType?: string;
  
  // Classification
  isClient: boolean;
  isOpponent: boolean;
  isWitness: boolean;
  isJudge: boolean;
  isAdvocate: boolean;
  isImportant: boolean;
  
  // Additional
  notes?: string;
  profileImageUrl?: string;
  contactTypeId?: number;
  contactTypeName?: string;
  
  // Relationships
  addresses: ContactAddress[];
  phones: ContactPhone[];
  emails: ContactEmail[];
  tags?: Tag[];
  spouse?: ContactRelationship;
  relatives?: ContactRelationship[];
  
  // Metadata
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ContactAddress {
  id: number;
  addressType: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPhone {
  id: number;
  phoneType: string;
  phoneNumber: string;
  countryCode?: string;
  extension?: string;
  isPrimary: boolean;
  isWhatsapp: boolean;
  createdAt: string;
}

export interface ContactEmail {
  id: number;
  emailType: string;
  email: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
}

export interface ContactRelationship {
  id: number;
  relatedContactId: number;
  relatedContactName: string;
  relationshipType: string;
  notes?: string;
  createdAt: string;
}
export interface ContactType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isSystem: boolean;
  createdAt: string;
}

export interface ContactStats {
  total: number;
  clients: number;
  opponents: number;
  witnesses: number;
  judges: number;
  advocates: number;
  important: number;
}

export interface ContactType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isSystem: boolean;
  createdAt: string;
}

export interface ContactNote {
  id: number;
  note: string;
  isPrivate: boolean;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValues?: string;
  newValues?: string;
  userName: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ContactTimelineItem {
  id: number;
  activityType: string;
  entityType: string;
  entityId: number;
  entityName: string;
  description: string;
  createdAt: string;
}

export interface ContactMatter {
  id: number;
  matterNumber: string;
  title: string;
  status: string;
  partyType: string;
  isPrimary: boolean;
  openDate: string;
  closedDate?: string;
}

export interface ContactTask {
  id: number;
  title: string;
  dueDate?: string;
  status?: string;
  priority?: string;
  completedAt?: string;
}

export interface ContactDocument {
  id: number;
  title: string;
  fileName: string;
  uploadedAt: string;
  fileSize: number;
  mimeType?: string;
}

export interface ContactBill {
  id: number;
  billNumber: string;
  totalAmount: number;
  balanceDue: number;
  dueDate: string;
  status: string;
  billDate: string;
}

export interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export interface DuplicateContact {
  contacts: Contact[];
  similarityScore: number;
  matchFields: string[];
}

export interface Task {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  estimatedHours?: number;
  actualHours?: number;
  statusId: number;
  statusName: string;
  statusColor?: string;
  priorityId: number;
  priorityName: string;
  priorityColor?: string;
  priorityLevel: number;
  matterId?: number;
  matterTitle?: string;
  contactId?: number;
  contactName?: string;
  assignees: TaskAssignee[];
  completedAt?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  location?: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  color?: string;
  matterId?: number;
  matterTitle?: string;
  contactId?: number;
  contactName?: string;
  attendees: EventAttendee[];
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  userId: number;
  attendeeType: string;
  responseStatus: string;
}

export interface Document {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  extension?: string;
  version: number;
  isTemplate: boolean;
  isArchived: boolean;
  matterId?: number;
  matterTitle?: string;
  contactId?: number;
  contactName?: string;
  uploadedAt: string;
}

export interface Bill {
  id: number;
  uuid: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  notes?: string;
  terms?: string;
  matterId?: number;
  matterTitle?: string;
  clientName?: string;
  statusId?: number;
  statusName?: string;
  statusColor?: string;
  items: BillItem[];
  payments: Payment[];
}

export interface BillItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountPercentage: number;
  amount: number;
  totalAmount: number;
  itemOrder: number;
}

export interface Payment {
  id: number;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface DashboardSummary {
  matters: {
    total: number;
    open: number;
    pending: number;
    closed: number;
    highPriority: number;
  };
  contacts: {
    total: number;
    clients: number;
    opponents: number;
    important: number;
  };
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    dueToday: number;
    myTasks: number;
    myPendingTasks: number;
  };
  billing: {
    totalBilled: number;
    totalPaid: number;
    totalOutstanding: number;
    overdueBills: number;
  };
}

export interface QuickAction {
  action: string;
  icon: string;
  url: string;
  permission: string;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  matterTitle?: string;
  contactName?: string;
}

export interface RecentActivity {
  id: number;
  activityType: string;
  entityType?: string;
  entityId?: number;
  entityName?: string;
  description?: string;
  userName?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message?: string;
  notificationType?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  isRead: boolean;
  createdAt: string;
}

// src/types/index.ts - Add missing types
export interface UpcomingEventsDto {
  events: UpcomingEvent[];
  total: number;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  description?: string;
  location?: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  matterTitle?: string;
  contactName?: string;
}

export interface MessageThread {
  id: number;
  uuid: string;
  subject?: string;
  threadType: string;
  matterId?: number;
  matterTitle?: string;
  contactId?: number;
  contactName?: string;
  lastMessageAt?: string;
  createdAt: string;
  messageCount: number;
}

export interface Message {
  id: number;
  uuid: string;
  messageId?: string;
  inReplyTo?: string;
  senderType: string;
  senderId?: number;
  senderEmail?: string;
  senderName?: string;
  subject?: string;
  body?: string;
  bodyPreview?: string;
  hasAttachments: boolean;
  isRead: boolean;
  isStarred: boolean;
  isDraft: boolean;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
  recipients: MessageRecipient[];
}

export interface MessageRecipient {
  recipientType: string;
  recipientIdentifier: string;
  recipientName?: string;
  isRead: boolean;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  category?: string;
  isShared: boolean;
  createdAt: string;
}

export interface DocumentType {
  id: number;
  name: string;
  category?: string;
  description?: string;
  icon?: string;
  isTemplate: boolean;
}

export interface Folder {
  id: number;
  name: string;
  description?: string;
  parentFolderId?: number;
  path?: string;
  createdAt: string;
  subFolders?: Folder[];
  documents?: Document[];
}

export interface BillStatus {
  id: number;
  name: string;
  color?: string;
  isDefault: boolean;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
}

export interface BillingDashboard {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueBills: number;
  billsCount: {
    draft: number;
    sent: number;
    partialPaid: number;
    paid: number;
    overdue: number;
  };
}

export interface Task {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  estimatedHours?: number;
  actualHours?: number;
  isRecurring: boolean;
  parentTaskId?: number;
  statusId: number;
  statusName: string;
  statusColor?: string;
  priorityId: number;
  priorityName: string;
  priorityColor?: string;
  priorityLevel: number;
  matterId?: number;
  matterTitle?: string;
  contactId?: number;
  contactName?: string;
  completedAt?: string;
  assignees: TaskAssignee[];
  comments: TaskComment[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id?: number;
  userId: number;
  userName?: string;
  isPrimary: boolean;
  assignedAt: string;
}

export interface TaskComment {
  id: number;
  comment: string;
  userId: number;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatus {
  id: number;
  name: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface TaskPriority {
  id: number;
  name: string;
  color?: string;
  level: number;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  myTasks: number;
  myCompletedTasks: number;
  myPendingTasks: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  matterId?: number;
  contactId?: number;
  statusId: number;
  priorityId: number;
  dueDate?: string;
  dueTime?: string;
  estimatedHours?: number;
  isRecurring?: boolean;
  assigneeIds?: number[];
  primaryAssigneeId?: number;
  reminderMinutes?: number;
}


export interface ContactStats {
  total: number;
  clients: number;
  opponents: number;
  witnesses: number;
  judges: number;
  advocates: number;
  important: number;
}

export interface UserPreferences {
  theme: string;
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  calendarView: string;
  dashboardLayout?: any;
}

export interface Subscription {
  planName: string;
  planCode: string;
  status: string;
  billingCycle: string;
  startDate: string;
  nextBillingDate?: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
}

export interface Plan {
  id: number;
  name: string;
  code: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  maxUsers?: number;
  maxMatters?: number;
  maxContacts?: number;
  maxStorageMb?: number;
  features: string[];
  isPopular: boolean;
}

export interface TeamMember {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginAt?: string;
  firmRole: string;
  status: string;
  joinedAt?: string;
  invitedAt?: string;
}

export interface AuditLog {
  id: number;
  action: string;
  entityType?: string;
  entityId?: number;
  oldValues?: string;
  newValues?: string;
  userName?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  emailOrUsername: string;
  password: string;
  firmId?: number;
}

export interface CreateFirmDto {
  firmName: string;
  legalName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  planCode: string;
  billingCycle: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface InviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface InviteResponse {
  userId: number;
  email: string;
  name: string;
  role: string;
  status: string;
}
