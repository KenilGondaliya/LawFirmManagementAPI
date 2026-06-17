import api from "./api";
import {
  Matter,
  MatterType,
  PracticeArea,
  Court,
  JudicialDistrict,
  MatterStats,
  MatterTimeline,
  MatterDocument,
  MatterTask,
  MatterEvent,
  MatterBill,
  TimeEntry,
  MatterDeadline,
  CreateMatterData,
  AddMatterParty,
  AddMatterNote,
  AddTimeEntry,
  AddDeadline,
  AdvancedSearchParams,
  BulkUpdateData,
  ImportResult,
} from "../types/matter.types";

export const matterService = {
  // ==================== Basic CRUD Operations ====================

  getAllMatters: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    matters: Matter[];
    totalPages: number;
    currentPage: number;
  }> => {
    const response = await api.get("/matters", { params });
    return response.data;
  },

  getMatterById: async (id: number): Promise<Matter> => {
    const response = await api.get(`/matters/${id}`);
    return response.data;
  },

  createMatter: async (data: CreateMatterData): Promise<Matter> => {
    const response = await api.post("/matters", data);
    return response.data;
  },

  updateMatter: async (
    id: number,
    data: Partial<CreateMatterData>,
  ): Promise<Matter> => {
    const response = await api.put(`/matters/${id}`, data);
    return response.data;
  },

  deleteMatter: async (id: number): Promise<void> => {
    await api.delete(`/matters/${id}`);
  },

  updateMatterStatus: async (id: number, status: string): Promise<Matter> => {
    const response = await api.patch(`/matters/${id}/status?status=${status}`);
    return response.data;
  },

  // ==================== Matter Types ====================

  getMatterTypes: async (): Promise<MatterType[]> => {
    const response = await api.get("/matters/types");
    return response.data;
  },

  getMatterTypeById: async (id: number): Promise<MatterType> => {
    const response = await api.get(`/matters/types/${id}`);
    return response.data;
  },

  createMatterType: async (data: {
    name: string;
    category: string;
    description?: string;
  }): Promise<MatterType> => {
    const response = await api.post("/matters/types", data);
    return response.data;
  },

  updateMatterType: async (
    id: number,
    data: { name?: string; description?: string; isActive?: boolean },
  ): Promise<MatterType> => {
    const response = await api.put(`/matters/types/${id}`, data);
    return response.data;
  },

  deleteMatterType: async (id: number): Promise<void> => {
    await api.delete(`/matters/types/${id}`);
  },

  // ==================== Matter Parties ====================

  getMatterParties: async (matterId: number): Promise<MatterParty[]> => {
    const response = await api.get(`/matters/${matterId}/parties`);
    return response.data;
  },

  addMatterParty: async (
    matterId: number,
    data: AddMatterParty,
  ): Promise<MatterParty> => {
    const response = await api.post(`/matters/${matterId}/parties`, data);
    return response.data;
  },

  updateMatterParty: async (
    partyId: number,
    data: { partyType?: string; roleDescription?: string; isPrimary?: boolean },
  ): Promise<MatterParty> => {
    const response = await api.put(`/matters/parties/${partyId}`, data);
    return response.data;
  },

  removeMatterParty: async (
    matterId: number,
    partyId: number,
  ): Promise<void> => {
    await api.delete(`/matters/${matterId}/parties/${partyId}`);
  },

  // ==================== Matter Notes ====================

  getMatterNotes: async (matterId: number): Promise<MatterNote[]> => {
    const response = await api.get(`/matters/${matterId}/notes`);
    return response.data;
  },

  addMatterNote: async (
    matterId: number,
    data: AddMatterNote,
  ): Promise<MatterNote> => {
    const response = await api.post(`/matters/${matterId}/notes`, data);
    return response.data;
  },

  updateMatterNote: async (
    noteId: number,
    data: { note?: string; isPrivate?: boolean },
  ): Promise<MatterNote> => {
    const response = await api.put(`/matters/notes/${noteId}`, data);
    return response.data;
  },

  deleteMatterNote: async (noteId: number): Promise<void> => {
    await api.delete(`/matters/notes/${noteId}`);
  },

  // ==================== Practice Areas ====================

  getPracticeAreas: async (): Promise<PracticeArea[]> => {
    const response = await api.get("/matters/practice-areas");
    return response.data;
  },

  getPracticeAreaById: async (id: number): Promise<PracticeArea> => {
    const response = await api.get(`/matters/practice-areas/${id}`);
    return response.data;
  },

  createPracticeArea: async (data: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<PracticeArea> => {
    const response = await api.post("/matters/practice-areas", data);
    return response.data;
  },

  updatePracticeArea: async (
    id: number,
    data: {
      name?: string;
      description?: string;
      color?: string;
      isActive?: boolean;
    },
  ): Promise<PracticeArea> => {
    const response = await api.put(`/matters/practice-areas/${id}`, data);
    return response.data;
  },

  deletePracticeArea: async (id: number): Promise<void> => {
    await api.delete(`/matters/practice-areas/${id}`);
  },

  // ==================== Courts (from API) ====================

  /**
   * Get all courts from API with optional filtering
   * @param params - Optional search and state filters
   * @returns Array of Court
   */
  getCourts: async (params?: {
    search?: string;
    state?: string;
  }): Promise<Court[]> => {
    const response = await api.get("/matters/courts", { params });
    return response.data;
  },

  /**
   * Get a court by ID
   * @param id - Court ID
   * @returns Court
   */
  getCourtById: async (id: number): Promise<Court> => {
    const response = await api.get(`/matters/courts/${id}`);
    return response.data;
  },

  /**
   * Create a new court
   * @param data - Court creation data
   * @returns Created Court
   */
  createCourt: async (data: {
    name: string;
    level?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    email?: string;
  }): Promise<Court> => {
    const response = await api.post("/matters/courts", data);
    return response.data;
  },

  /**
   * Update an existing court
   * @param id - Court ID
   * @param data - Court update data
   * @returns Updated Court
   */
  updateCourt: async (
    id: number,
    data: {
      name?: string;
      level?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      phone?: string;
      email?: string;
    },
  ): Promise<Court> => {
    const response = await api.put(`/matters/courts/${id}`, data);
    return response.data;
  },

  /**
   * Delete a court
   * @param id - Court ID
   */
  deleteCourt: async (id: number): Promise<void> => {
    await api.delete(`/matters/courts/${id}`);
  },

  /**
   * Get courts by state
   * @param state - State name
   */
  getCourtsByState: async (state: string): Promise<Court[]> => {
    const response = await api.get(`/matters/courts`, {
      params: { state },
    });
    return response.data;
  },

  // ==================== Judicial Districts (from API) ====================

  /**
   * Get all judicial districts from API with optional filtering
   * @param params - Optional search and state filters
   * @returns Array of JudicialDistrict
   */
  getJudicialDistricts: async (params?: {
    search?: string;
    state?: string;
  }): Promise<JudicialDistrict[]> => {
    const response = await api.get("/matters/judicial-districts", { params });
    return response.data;
  },

  /**
   * Get a judicial district by ID
   * @param id - Judicial District ID
   * @returns JudicialDistrict
   */
  getJudicialDistrictById: async (id: number): Promise<JudicialDistrict> => {
    const response = await api.get(`/matters/judicial-districts/${id}`);
    return response.data;
  },

  /**
   * Create a new judicial district
   * @param data - Judicial district creation data
   * @returns Created JudicialDistrict
   */
  createJudicialDistrict: async (data: {
    name: string;
    state?: string;
    description?: string;
  }): Promise<JudicialDistrict> => {
    const response = await api.post("/matters/judicial-districts", data);
    return response.data;
  },

  /**
   * Update an existing judicial district
   * @param id - Judicial District ID
   * @param data - Judicial district update data
   * @returns Updated JudicialDistrict
   */
  updateJudicialDistrict: async (
    id: number,
    data: {
      name?: string;
      state?: string;
      description?: string;
    },
  ): Promise<JudicialDistrict> => {
    const response = await api.put(`/matters/judicial-districts/${id}`, data);
    return response.data;
  },

  /**
   * Delete a judicial district
   * @param id - Judicial District ID
   */
  deleteJudicialDistrict: async (id: number): Promise<void> => {
    await api.delete(`/matters/judicial-districts/${id}`);
  },

  /**
   * Get districts by state
   * @param state - State name
   */
  getDistrictsByState: async (state: string): Promise<JudicialDistrict[]> => {
    const response = await api.get(`/matters/judicial-districts`, {
      params: { state },
    });
    return response.data;
  },

  // ==================== Matter Filters ====================

  getMattersByStatus: async (status: string): Promise<Matter[]> => {
    const response = await api.get(`/matters/status/${status}`);
    return response.data;
  },

  getOpenMatters: async (): Promise<Matter[]> => {
    const response = await api.get("/matters/open");
    return response.data;
  },

  getPendingMatters: async (): Promise<Matter[]> => {
    const response = await api.get("/matters/pending");
    return response.data;
  },

  getClosedMatters: async (): Promise<Matter[]> => {
    const response = await api.get("/matters/closed");
    return response.data;
  },

  getMattersByPriority: async (priority: string): Promise<Matter[]> => {
    const response = await api.get(`/matters/priority/${priority}`);
    return response.data;
  },

  getLitigationMatters: async (): Promise<Matter[]> => {
    const response = await api.get("/matters/litigation");
    return response.data;
  },

  getNonLitigationMatters: async (): Promise<Matter[]> => {
    const response = await api.get("/matters/non-litigation");
    return response.data;
  },

  getMattersAssignedToUser: async (userId: number): Promise<Matter[]> => {
    const response = await api.get(`/matters/assigned-to/${userId}`);
    return response.data;
  },

  getMattersByClient: async (contactId: number): Promise<Matter[]> => {
    const response = await api.get(`/matters/by-client/${contactId}`);
    return response.data;
  },

  // ==================== Matter Statistics ====================

  getMatterStats: async (): Promise<MatterStats> => {
    const response = await api.get("/matters/stats");
    return response.data;
  },

  getMatterTimeline: async (matterId: number): Promise<MatterTimeline[]> => {
    const response = await api.get(`/matters/${matterId}/timeline`);
    return response.data;
  },

  // ==================== Related Data ====================

  getMatterDocuments: async (matterId: number): Promise<MatterDocument[]> => {
    const response = await api.get(`/documents?matterId=${matterId}`);
    return response.data;
  },

  getMatterTasks: async (matterId: number): Promise<MatterTask[]> => {
    const response = await api.get(`/tasks?matterId=${matterId}`);
    return response.data;
  },

  getMatterEvents: async (matterId: number): Promise<MatterEvent[]> => {
    const response = await api.get(`/events?matterId=${matterId}`);
    return response.data;
  },

  getMatterBills: async (matterId: number): Promise<MatterBill[]> => {
    const response = await api.get(`/billing/bills?matterId=${matterId}`);
    return response.data;
  },

  // ==================== Time Entries ====================

  getTimeEntries: async (
    matterId: number,
    params?: { startDate?: string; endDate?: string },
  ): Promise<TimeEntry[]> => {
    const response = await api.get(`/matters/${matterId}/time-entries`, {
      params,
    });
    return response.data;
  },

  addTimeEntry: async (
    matterId: number,
    data: AddTimeEntry,
  ): Promise<TimeEntry> => {
    const response = await api.post(`/matters/${matterId}/time-entries`, data);
    return response.data;
  },

  updateTimeEntry: async (
    entryId: number,
    data: Partial<AddTimeEntry>,
  ): Promise<TimeEntry> => {
    const response = await api.put(`/matters/time-entries/${entryId}`, data);
    return response.data;
  },

  deleteTimeEntry: async (entryId: number): Promise<void> => {
    await api.delete(`/matters/time-entries/${entryId}`);
  },

  // ==================== Deadlines ====================

  getMatterDeadlines: async (matterId: number): Promise<MatterDeadline[]> => {
    const response = await api.get(`/matters/${matterId}/deadlines`);
    return response.data;
  },

  addDeadline: async (
    matterId: number,
    data: AddDeadline,
  ): Promise<MatterDeadline> => {
    const response = await api.post(`/matters/${matterId}/deadlines`, data);
    return response.data;
  },

  markDeadlineAsMet: async (deadlineId: number): Promise<void> => {
    await api.patch(`/matters/deadlines/${deadlineId}/met`);
  },

  // ==================== Bulk Operations ====================

  bulkUpdateStatus: async (
    data: BulkUpdateData,
  ): Promise<{ updatedCount: number }> => {
    const response = await api.post("/matters/bulk/status", data);
    return response.data;
  },

  bulkAssignAdvocate: async (
    data: BulkUpdateData,
  ): Promise<{ updatedCount: number }> => {
    const response = await api.post("/matters/bulk/assign", data);
    return response.data;
  },

  bulkDeleteMatters: async (
    matterIds: number[],
  ): Promise<{ deletedCount: number }> => {
    const response = await api.post("/matters/bulk/delete", { matterIds });
    return response.data;
  },

  // ==================== Advanced Search ====================

  advancedSearch: async (params: AdvancedSearchParams): Promise<Matter[]> => {
    const response = await api.post("/matters/search", params);
    return response.data;
  },

  // ==================== Export/Import ====================

  exportMatters: async (
    format: "csv" | "excel",
    filters?: {
      status?: string;
      priority?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Blob> => {
    const response = await api.post(
      "/matters/export",
      { format, filters },
      {
        responseType: "blob",
      },
    );
    return response.data;
  },

  importMatters: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/matters/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ==================== Activity Logs ====================

  getMatterActivityLogs: async (
    matterId: number,
    params?: { startDate?: string; endDate?: string; limit?: number },
  ): Promise<ActivityLog[]> => {
    const response = await api.get(`/matters/${matterId}/activity-logs`, {
      params,
    });
    return response.data;
  },

  // ==================== Courts and Districts Combined ====================

  /**
   * Get both courts and judicial districts from API in one request
   * Useful for populating dropdowns
   */
  getCourtsAndDistricts: async (params?: {
    state?: string;
  }): Promise<{
    courts: Court[];
    judicialDistricts: JudicialDistrict[];
  }> => {
    const [courtsResponse, districtsResponse] = await Promise.all([
      api.get("/matters/courts", { params }),
      api.get("/matters/judicial-districts", { params }),
    ]);

    return {
      courts: courtsResponse.data,
      judicialDistricts: districtsResponse.data,
    };
  },

  /**
   * Get courts for a specific judicial district
   * @param districtId - Judicial District ID
   */
  getCourtsByDistrict: async (districtId: number): Promise<Court[]> => {
    const response = await api.get(`/matters/judicial-districts/${districtId}/courts`);
    return response.data;
  },

  // ==================== States ====================

  /**
   * Get all unique states from courts and districts
   * @returns Array of state names
   */
  getStates: async (): Promise<string[]> => {
    const response = await api.get("/matters/states");
    return response.data;
  },
};

// ==================== Type Definitions ====================

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  userName?: string;
  createdAt: string;
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

// ==================== Frontend Types for Courts and Districts ====================

/**
 * Frontend type for Court with string ID (from your JSON API)
 * Used for the create/edit matter forms
 */
export interface CourtOption {
  id: string;
  name: string;
  city?: string;
  state?: string;
  level?: string;
}

/**
 * Frontend type for Judicial District with string ID (from your JSON API)
 * Used for the create/edit matter forms
 */
export interface JudicialDistrictOption {
  id: string;
  name: string;
  state?: string;
}

/**
 * Frontend type for State (from your JSON API)
 * Used for filtering
 */
export interface StateOption {
  id: string;
  name: string;
}

/**
 * Utility function to convert Court to CourtOption
 * @param court - Court from API
 * @returns CourtOption for frontend use
 */
export const courtToOption = (court: Court): CourtOption => ({
  id: court.id.toString(),
  name: court.name,
  city: court.city,
  state: court.state,
  level: court.level,
});

/**
 * Utility function to convert JudicialDistrict to JudicialDistrictOption
 * @param district - JudicialDistrict from API
 * @returns JudicialDistrictOption for frontend use
 */
export const districtToOption = (district: JudicialDistrict): JudicialDistrictOption => ({
  id: district.id.toString(),
  name: district.name,
  state: district.state,
});

/**
 * Utility function to get distinct states from courts or districts
 * @param items - Array of courts or districts
 * @returns Array of unique state names
 */
export const getDistinctStates = <T extends { state?: string }>(
  items: T[]
): string[] => {
  const states = new Set<string>();
  items.forEach(item => {
    if (item.state) {
      states.add(item.state);
    }
  });
  return Array.from(states).sort();
};

/**
 * Filter courts by state
 * @param courts - Array of Court
 * @param state - State name to filter by
 * @returns Filtered array of Court
 */
export const filterCourtsByState = (
  courts: Court[],
  state?: string
): Court[] => {
  if (!state) return courts;
  return courts.filter(court => court.state === state);
};

/**
 * Filter judicial districts by state
 * @param districts - Array of JudicialDistrict
 * @param state - State name to filter by
 * @returns Filtered array of JudicialDistrict
 */
export const filterDistrictsByState = (
  districts: JudicialDistrict[],
  state?: string
): JudicialDistrict[] => {
  if (!state) return districts;
  return districts.filter(district => district.state === state);
};