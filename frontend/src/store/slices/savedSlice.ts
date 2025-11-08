import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { interactionAPI } from '@/lib/api';

// Types
export interface SavedJob {
  _id: string;
  id: string;
  internship_id: string | {
    _id: string;
    id: string;
    title: string;
    description: string;
    location: string;
    is_remote: boolean;
    duration_months: number;
    stipend_min: number;
    stipend_max: number;
    application_deadline: string;
    status: string;
    skills_required: string[];
    company_id?: string | {
      company_name: string;
      logo_url?: string;
      website?: string;
      industry?: string;
    };
    company?: {
      _id: string;
      company_name: string;
      logo_url?: string;
      website?: string;
      industry?: string;
    };
  };
  saved_at: string;
  internship?: {
    _id: string;
    id: string;
    title: string;
    description: string;
    location: string;
    is_remote: boolean;
    duration_months: number;
    stipend_min: number;
    stipend_max: number;
    application_deadline: string;
    status: string;
    skills_required: string[];
    company_id?: string | {
      company_name: string;
      logo_url?: string;
      website?: string;
      industry?: string;
    };
    company?: {
      _id: string;
      company_name: string;
      logo_url?: string;
      website?: string;
      industry?: string;
    };
  };
}

export interface SwipeRecord {
  id: string;
  internship_id: string;
  direction: 'left' | 'right';
  created_at: string;
  internship?: {
    id: string;
    title: string;
    company_name: string;
  };
}

export interface InteractionState {
  savedJobs: SavedJob[];
  swipes: SwipeRecord[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  hasFetchedSavedJobs: boolean;
  pagination: {
    savedJobs: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Async thunks
export const fetchSavedJobs = createAsyncThunk(
  'interaction/fetchSavedJobs',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await interactionAPI.getSavedJobs(params);
      return {
        savedJobs: response.saved || [],
        pagination: response.pagination || {
          page: params.page || 1,
          limit: params.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch saved jobs');
    }
  }
);

export const saveJob = createAsyncThunk(
  'interaction/saveJob',
  async (internship_id: string, { rejectWithValue }) => {
    try {
      const response = await interactionAPI.saveJob(internship_id);
      return response.saved_job;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save job');
    }
  }
);

export const unsaveJob = createAsyncThunk(
  'interaction/unsaveJob',
  async (internship_id: string, { rejectWithValue }) => {
    try {
      await interactionAPI.unsaveJob(internship_id);
      return internship_id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unsave job');
    }
  }
);

export const createSwipe = createAsyncThunk(
  'interaction/createSwipe',
  async ({ internship_id, direction }: { internship_id: string; direction: 'left' | 'right' }, { rejectWithValue }) => {
    try {
      const response = await interactionAPI.createSwipe(internship_id, direction);
      return response.swipe;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to record swipe');
    }
  }
);

export const fetchSwipes = createAsyncThunk(
  'interaction/fetchSwipes',
  async (params: { page?: number; limit?: number; direction?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await interactionAPI.getSwipes(params);
      return response.swipes || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch swipes');
    }
  }
);

// Initial state
const initialState: InteractionState = {
  savedJobs: [],
  swipes: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  hasFetchedSavedJobs: false,
  pagination: {
    savedJobs: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  },
};

// Slice
const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAllInteractionData: (state) => {
      state.savedJobs = [];
      state.swipes = [];
      state.hasFetchedSavedJobs = false;
      state.pagination = {
        savedJobs: { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
    resetSavedJobs: (state) => {
      state.savedJobs = [];
      state.hasFetchedSavedJobs = false;
    },
  },

  extraReducers: (builder) => {
    // Fetch saved jobs
    builder
      .addCase(fetchSavedJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedJobs = Array.isArray(action.payload.savedJobs) ? action.payload.savedJobs : [];
        state.pagination.savedJobs = action.payload.pagination;
        state.error = null;
        state.hasFetchedSavedJobs = true;
      })
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Save job
    builder
      .addCase(saveJob.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(saveJob.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload && Array.isArray(state.savedJobs)) {
          state.savedJobs.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(saveJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Unsave job
    builder
      .addCase(unsaveJob.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(unsaveJob.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (Array.isArray(state.savedJobs)) {
          const internshipIdToRemove = action.payload;
          const beforeCount = state.savedJobs.length;
          state.savedJobs = state.savedJobs.filter(job => {
            const jobInternshipId = typeof job.internship_id === 'object'
              ? job.internship_id._id || job.internship_id.id
              : job.internship_id;
            return jobInternshipId !== internshipIdToRemove;
          });
          const removedCount = beforeCount - state.savedJobs.length;
          if (removedCount > 0) {
            console.log(`✅ Removed ${removedCount} saved job(s)`);
          }
        }
        state.error = null;
      })
      .addCase(unsaveJob.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Create swipe
    builder
      .addCase(createSwipe.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createSwipe.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.swipes.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSwipe.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Fetch swipes
    builder
      .addCase(fetchSwipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSwipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.swipes = action.payload;
        state.error = null;
      })
      .addCase(fetchSwipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError: clearInteractionError,
  clearAllInteractionData,
  resetSavedJobs,
} = interactionSlice.actions;

export default interactionSlice.reducer;