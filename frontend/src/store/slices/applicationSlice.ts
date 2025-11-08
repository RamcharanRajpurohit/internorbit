import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { applicationAPI } from '@/lib/api';

// Types
export interface Application {
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
  };
  student_id: string | {
    _id: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    university?: string;
    degree?: string;
    graduation_year?: number;
    location?: string;
    phone?: string;
    linkedin_url?: string;
    github_url?: string;
    bio?: string;
    skills?: string[];
  };
  resume_id: string | {
    _id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    visibility: 'private' | 'public' | 'restricted';
    is_primary: boolean;
    scan_status: 'pending' | 'clean' | 'rejected';
    scan_message?: string;
    uploaded_at: string;
    updated_at: string;
    views_count: number;
    downloads_count: number;
    last_viewed_at?: string;
    last_downloaded_at?: string;
  };
  cover_letter: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at: string;
  reviewed_at?: string;
  updated_at: string;
  feedback?: string;
  student?: {
    _id: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    university?: string;
    degree?: string;
    graduation_year?: number;
    location?: string;
    phone?: string;
    linkedin_url?: string;
    github_url?: string;
    bio?: string;
    skills?: string[];
  };
  internship?: {
    _id: string;
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
    company_id?: {
      company_name: string;
      logo_url?: string;
      website?: string;
      industry?: string;
    };
  };
}

export interface ApplicationState {
  studentApplications: Application[];
  companyApplications: Application[];
  currentApplication: Application | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: {
    student: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    company: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Async thunks
export const fetchStudentApplications = createAsyncThunk(
  'application/fetchStudentApplications',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await applicationAPI.getStudentApplications(params);
      return {
        applications: response.applications || [],
        pagination: response.pagination || {
          page: params.page || 1,
          limit: params.limit || 20,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch student applications');
    }
  }
);

export const fetchCompanyApplications = createAsyncThunk(
  'application/fetchCompanyApplications',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await applicationAPI.getCompanyApplications(params);
      return {
        applications: response.applications || [],
        pagination: response.pagination || {
          page: params.page || 1,
          limit: params.limit || 20,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch company applications');
    }
  }
);

export const createApplication = createAsyncThunk(
  'application/createApplication',
  async (applicationData: {
    internship_id: string;
    resume_id: string;
    cover_letter: string;
  }, { rejectWithValue }) => {
    try {
      const response = await applicationAPI.create(applicationData);
      return response.application;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create application');
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'application/updateApplicationStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await applicationAPI.updateStatus(id, status);
      return response.application;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update application status');
    }
  }
);

export const withdrawApplication = createAsyncThunk(
  'application/withdrawApplication',
  async (id: string, { rejectWithValue }) => {
    try {
      await applicationAPI.withdraw(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to withdraw application');
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  'application/fetchApplicationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await applicationAPI.getById(id);
      return response.application;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch application');
    }
  }
);

// Initial state
const initialState: ApplicationState = {
  studentApplications: [],
  companyApplications: [],
  currentApplication: null,
  isLoading: false,
  isSubmitting: false,
  isUpdating: false,
  error: null,
  pagination: {
    student: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
    company: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  },
};

// Slice
const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    updateApplicationInList: (state, action: PayloadAction<Application>) => {
      const studentIndex = state.studentApplications.findIndex(app => app.id === action.payload.id);
      if (studentIndex !== -1) {
        state.studentApplications[studentIndex] = action.payload;
      }

      const companyIndex = state.companyApplications.findIndex(app => app.id === action.payload.id);
      if (companyIndex !== -1) {
        state.companyApplications[companyIndex] = action.payload;
      }

      if (state.currentApplication?.id === action.payload.id) {
        state.currentApplication = action.payload;
      }
    },
    clearAllApplicationData: (state) => {
      state.studentApplications = [];
      state.companyApplications = [];
      state.currentApplication = null;
      state.pagination = {
        student: { page: 1, limit: 20, total: 0, totalPages: 1 },
        company: { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    },
  },

  extraReducers: (builder) => {
    // Fetch student applications
    builder
      .addCase(fetchStudentApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentApplications = action.payload.applications;
        state.pagination.student = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchStudentApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch company applications
    builder
      .addCase(fetchCompanyApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyApplications = action.payload.applications;
        state.pagination.company = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchCompanyApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create application
    builder
      .addCase(createApplication.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.studentApplications.unshift(action.payload);
        state.error = null;
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Update application status
    builder
      .addCase(updateApplicationStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const companyIndex = state.companyApplications.findIndex(app => app.id === action.payload.id);
        if (companyIndex !== -1) {
          state.companyApplications[companyIndex] = action.payload;
        }
        const studentIndex = state.studentApplications.findIndex(app => app.id === action.payload.id);
        if (studentIndex !== -1) {
          state.studentApplications[studentIndex] = action.payload;
        }
        if (state.currentApplication?.id === action.payload.id) {
          state.currentApplication = action.payload;
        }
        state.error = null;
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Withdraw application
    builder
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.studentApplications = state.studentApplications.filter(app => app.id !== action.payload);
        if (state.currentApplication?.id === action.payload) {
          state.currentApplication = null;
        }
      });

    // Fetch application by ID
    builder
      .addCase(fetchApplicationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentApplication = action.payload;
        state.error = null;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError: clearApplicationError,
  clearCurrentApplication,
  updateApplicationInList,
  clearAllApplicationData,
} = applicationSlice.actions;

export default applicationSlice.reducer;