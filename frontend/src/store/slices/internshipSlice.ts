import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { internshipAPI } from '@/lib/api';

// Types
export interface Internship {
  _id: string;
  id: string; // Alias for _id for frontend compatibility
  company_id: string | {
    _id: string;
    company_name: string;
    logo_url?: string;
    website?: string;
    industry?: string;
    company_size?: string;
    location?: string;
    description?: string;
  };
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  is_remote: boolean;
  stipend_min: number;
  stipend_max: number;
  duration_months: number;
  skills_required: string[];
  application_deadline: string;
  positions_available: number;
  status: 'active' | 'closed' | 'draft';
  views_count: number;
  applications_count: number;
  application_count?: number; // Alias for applications_count for frontend compatibility
  created_at: string;
  updated_at: string;
  // Frontend convenience fields (not from backend)
  company_name?: string;
  is_saved?: boolean;
  has_applied?: boolean;
  deadline?: string; // Alias for application_deadline
  duration?: string; // Computed from duration_months
  skills?: string[]; // Alias for skills_required
  // Populated relationship fields
  company?: {
    _id: string;
    company_name: string;
    logo_url?: string;
    website?: string;
    industry?: string;
    company_size?: string;
    location?: string;
    description?: string;
  };
}

export interface InternshipFilters {
  search?: string;
  location?: string;
  skills?: string;
  remote?: boolean;
  type?: string;
  duration?: string;
  page?: number;
  limit?: number;
}

export interface InternshipState {
  internships: Internship[];
  currentInternship: Internship | null;
  companyInternships: Internship[];
  savedInternships: Internship[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: InternshipFilters;
}

// Async thunks
export const fetchInternships = createAsyncThunk(
  'internship/fetchInternships',
  async (filters: InternshipFilters = {}, { rejectWithValue }) => {
    try {
      const response = await internshipAPI.getAll(filters);
      return {
        internships: response.internships || [],
        pagination: response.pagination || {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch internships');
    }
  }
);

export const fetchInternshipById = createAsyncThunk(
  'internship/fetchInternshipById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await internshipAPI.getById(id);
      return response.internship;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch internship');
    }
  }
);

export const createInternship = createAsyncThunk(
  'internship/createInternship',
  async (internshipData: Partial<Internship>, { rejectWithValue }) => {
    try {
      const response = await internshipAPI.create(internshipData);
      return response.internship;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create internship');
    }
  }
);

export const updateInternship = createAsyncThunk(
  'internship/updateInternship',
  async ({ id, data }: { id: string; data: Partial<Internship> }, { rejectWithValue }) => {
    try {
      const response = await internshipAPI.update(id, data);
      return response.internship;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update internship');
    }
  }
);

export const publishInternship = createAsyncThunk(
  'internship/publishInternship',
  async (id: string, { rejectWithValue }) => {
    try {
      await internshipAPI.publish(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to publish internship');
    }
  }
);

export const deleteInternship = createAsyncThunk(
  'internship/deleteInternship',
  async (id: string, { rejectWithValue }) => {
    try {
      await internshipAPI.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete internship');
    }
  }
);

export const fetchCompanyInternships = createAsyncThunk(
  'internship/fetchCompanyInternships',
  async (filters: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await internshipAPI.getAllByCompanyId(filters);
      return response.internships || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch company internships');
    }
  }
);

// Initial state
const initialState: InternshipState = {
  internships: [],
  currentInternship: null,
  companyInternships: [],
  savedInternships: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  filters: {},
};

// Slice
const internshipSlice = createSlice({
  name: 'internship',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInternship: (state) => {
      state.currentInternship = null;
    },
    setFilters: (state, action: PayloadAction<Partial<InternshipFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    updateInternshipInList: (state, action: PayloadAction<Internship>) => {
      const index = state.internships.findIndex(i => i._id === action.payload._id);
      if (index !== -1) {
        state.internships[index] = action.payload;
      }
    },
    toggleSavedStatus: (state, action: PayloadAction<{ _id: string; isSaved: boolean }>) => {
      const { _id, isSaved } = action.payload;

      // Update in internships list
      const index = state.internships.findIndex(i => i._id === _id);
      if (index !== -1) {
        state.internships[index].is_saved = isSaved;
      }

      // Update in current internship
      if (state.currentInternship?._id === _id) {
        state.currentInternship.is_saved = isSaved;
      }

      // Update in company internships if exists
      const companyIndex = state.companyInternships.findIndex(i => i._id === _id);
      if (companyIndex !== -1) {
        state.companyInternships[companyIndex].is_saved = isSaved;
      }
    },
    toggleAppliedStatus: (state, action: PayloadAction<{ _id: string; hasApplied: boolean }>) => {
      const { _id, hasApplied } = action.payload;

      // Update in internships list
      const index = state.internships.findIndex(i => i._id === _id);
      if (index !== -1) {
        state.internships[index].has_applied = hasApplied;
      }

      // Update in current internship
      if (state.currentInternship?._id === _id) {
        state.currentInternship.has_applied = hasApplied;
      }
    },
    clearAllInternshipData: (state) => {
      state.internships = [];
      state.companyInternships = [];
      state.currentInternship = null;
      state.pagination = { page: 1, limit: 20, total: 0, totalPages: 1 };
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch internships
    builder
      .addCase(fetchInternships.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternships.fulfilled, (state, action) => {
        state.isLoading = false;
        // Normalize internship data to ensure both _id and id fields exist
        state.internships = action.payload.internships.map((internship: any) => ({
          ...internship,
          _id: internship._id || internship.id,
          id: internship.id || internship._id,
        }));
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchInternships.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch internship by ID
    builder
      .addCase(fetchInternshipById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInternshipById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Normalize internship data to ensure both _id and id fields exist
        const internship = action.payload;
        state.currentInternship = {
          ...internship,
          _id: internship._id || internship.id,
          id: internship.id || internship._id,
        };
        state.error = null;
      })
      .addCase(fetchInternshipById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create internship
    builder
      .addCase(createInternship.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createInternship.fulfilled, (state, action) => {
        state.isCreating = false;
        state.companyInternships.unshift(action.payload);
        state.error = null;
      })
      .addCase(createInternship.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update internship
    builder
      .addCase(updateInternship.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateInternship.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.companyInternships.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.companyInternships[index] = action.payload;
        }
        if (state.currentInternship?._id === action.payload._id) {
          state.currentInternship = action.payload;
        }
        state.error = null;
      })
      .addCase(updateInternship.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Publish internship
    builder
      .addCase(publishInternship.fulfilled, (state, action) => {
        const index = state.companyInternships.findIndex(i => i._id === action.payload);
        if (index !== -1) {
          state.companyInternships[index].status = 'active';
        }
      });

    // Delete internship
    builder
      .addCase(deleteInternship.fulfilled, (state, action) => {
        state.companyInternships = state.companyInternships.filter(i => i._id !== action.payload);
        if (state.currentInternship?._id === action.payload) {
          state.currentInternship = null;
        }
      });

    // Fetch company internships
    builder
      .addCase(fetchCompanyInternships.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyInternships.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyInternships = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyInternships.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError: clearInternshipError,
  clearCurrentInternship,
  setFilters,
  clearFilters,
  updateInternshipInList,
  toggleSavedStatus,
  toggleAppliedStatus,
  clearAllInternshipData,
} = internshipSlice.actions;

export default internshipSlice.reducer;