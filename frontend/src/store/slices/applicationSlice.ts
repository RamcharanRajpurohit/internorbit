import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { applicationAPI } from '@/lib/api';
import { extractApplication } from '@/lib/dataNormalization';
import { 
  updateInternshipInList, 
  syncApplicationToInternshipSlice as syncToInternshipSlice 
} from './internshipSlice';
import { syncApplicationToSavedJobs } from './savedSlice';
import type {
  Application,
  ApplicationStatus,
  ApplicationListResponse,
  ApplicationDetailResponse,
  CreateApplicationRequest,
  CreateApplicationResponse,
  UpdateApplicationStatusRequest,
  Internship,
  StudentProfile,
  Resume,
  CompanyProfile,
  PaginationInfo
} from '@/types';

export interface ApplicationState {
  studentApplications: Application[];
  companyApplications: Application[];
  currentApplication: Application | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: {
    student: PaginationInfo;
    company: PaginationInfo;
  };
}

// Async thunks
export const fetchStudentApplications = createAsyncThunk(
  'application/fetchStudentApplications',
  async (params: { page?: number; limit?: number; status?: ApplicationStatus } = {}, { rejectWithValue }) => {
    try {
      const response: ApplicationListResponse = await applicationAPI.getStudentApplications(params);
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
  async (params: { page?: number; limit?: number; status?: ApplicationStatus } = {}, { rejectWithValue }) => {
    try {
      const response: ApplicationListResponse = await applicationAPI.getCompanyApplications(params);
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
  async (
    { applicationData, internshipData }: { applicationData: CreateApplicationRequest; internshipData?: any },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response: CreateApplicationResponse = await applicationAPI.create(applicationData);

      // Use FULL internship data from response
      const internshipFromResponse = response.internship || internshipData;

      if (internshipFromResponse) {
        // Update internship slice with FULL data including has_applied: true
        dispatch(syncToInternshipSlice({
          internshipId: internshipFromResponse._id || applicationData.internship_id,
          hasApplied: true
        }));

        // Update saved jobs list if user has saved this internship
        dispatch(syncApplicationToSavedJobs({
          internshipId: internshipFromResponse._id || applicationData.internship_id,
          hasApplied: true
        }));

        // If we have full internship data from response, update the internship in the list
        if (response.internship) {
          dispatch(updateInternshipInList({
            ...internshipFromResponse,
            has_applied: true
          }));
        }
      }

      const normalizedApplication = extractApplication(response.application);
      if (!normalizedApplication) {
        throw new Error('Invalid application response');
      }

      return {
        ...normalizedApplication,
        internship: internshipFromResponse,
        applications_count: response.internship?.applications_count || response.applications_count
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create application');
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'application/updateApplicationStatus',
  async ({ id, status }: { id: string; status: ApplicationStatus }, { rejectWithValue }) => {
    try {
      const response: CreateApplicationResponse = await applicationAPI.updateStatus(id, { status });
      return {
        ...response.application,
        applications_count: response.applications_count || response.application?.internship?.applications_count
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update application status');
    }
  }
);

export const withdrawApplication = createAsyncThunk(
  'application/withdrawApplication',
  async (id: string, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState() as { application: ApplicationState };
      const application = state.application.currentApplication ||
        state.application.studentApplications.find(app => app._id === id);

      const internshipId = typeof application?.internship_id === 'object'
        ? application?.internship_id._id
        : application?.internship_id;

      const response = await applicationAPI.withdraw(id);

      // Use FULL internship data from response
      const internshipFromResponse = response?.internship;

      if (internshipFromResponse) {
        // Update internship slice
        dispatch(syncToInternshipSlice({
          internshipId: internshipFromResponse._id || internshipId,
          hasApplied: false
        }));

        // Update saved jobs list if user has saved this internship
        dispatch(syncApplicationToSavedJobs({
          internshipId: internshipFromResponse._id || internshipId,
          hasApplied: false
        }));

        // Update the internship in the list with full data
        dispatch(updateInternshipInList({
          ...internshipFromResponse,
          has_applied: false
        }));
      } else if (internshipId) {
        // Fallback if no internship data in response
        dispatch(syncToInternshipSlice({
          internshipId: internshipId,
          hasApplied: false
        }));

        // Also update saved jobs
        dispatch(syncApplicationToSavedJobs({
          internshipId: internshipId,
          hasApplied: false
        }));
      }

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
      const response: ApplicationDetailResponse = await applicationAPI.getById(id);
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
    addApplicationToList: (state, action: PayloadAction<Application>) => {
      const exists = state.studentApplications.some(app =>
        app._id === action.payload._id
      );

      if (!exists) {
        state.studentApplications.unshift(action.payload);
        state.pagination.student.total += 1;
      }
    },

    // NEW: Manually remove application from list (for cross-page updates)
    removeApplicationFromList: (state, action: PayloadAction<string>) => {
      const initialLength = state.studentApplications.length;
      state.studentApplications = state.studentApplications.filter(app =>
        app._id !== action.payload
      );

      const removedCount = initialLength - state.studentApplications.length;
      if (removedCount > 0) {
        state.pagination.student.total = Math.max(0, state.pagination.student.total - removedCount);
      }
    },

    // NEW: Manually update application status in list
    updateApplicationStatusInList: (state, action: PayloadAction<{ id: string; status: ApplicationStatus }>) => {
      const { id, status } = action.payload;

      const studentIndex = state.studentApplications.findIndex(app => app._id === id);
      if (studentIndex !== -1) {
        state.studentApplications[studentIndex].status = status;
      }

      const companyIndex = state.companyApplications.findIndex(app => app._id === id);
      if (companyIndex !== -1) {
        state.companyApplications[companyIndex].status = status;
      }

      if (state.currentApplication && state.currentApplication._id === id) {
        state.currentApplication.status = status;
      }
    },

    updateApplicationInList: (state, action: PayloadAction<Application>) => {
      const studentIndex = state.studentApplications.findIndex(app => app._id === action.payload._id);
      if (studentIndex !== -1) {
        state.studentApplications[studentIndex] = action.payload;
      }

      const companyIndex = state.companyApplications.findIndex(app => app._id === action.payload._id);
      if (companyIndex !== -1) {
        state.companyApplications[companyIndex] = action.payload;
      }

      if (state.currentApplication && state.currentApplication._id === action.payload._id) {
        state.currentApplication = action.payload;
      }
    },
    // FIX: Sync action from other slices
    syncApplicationToInternshipSlice: (state, _action: PayloadAction<{ internshipId: string; hasApplied: boolean }>) => {
      // This reducer exists to allow dispatching cross-slice updates
      // The actual update happens in internshipSlice
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
        // Add the new application to the beginning of studentApplications list
        state.studentApplications.unshift(action.payload);
        // Update pagination total
        state.pagination.student.total += 1;
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
        const payloadId = action.payload._id;

        const companyIndex = state.companyApplications.findIndex(app => app._id === payloadId);
        if (companyIndex !== -1) {
          state.companyApplications[companyIndex] = action.payload;
        }

        const studentIndex = state.studentApplications.findIndex(app => app._id === payloadId);
        if (studentIndex !== -1) {
          state.studentApplications[studentIndex] = action.payload;
        }

        if (state.currentApplication && state.currentApplication._id === payloadId) {
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
      .addCase(withdrawApplication.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(withdrawApplication.fulfilled, (state) => {
        state.isSubmitting = false;
        // Now handled via removeApplicationFromList action from component
        state.error = null;
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
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
  syncApplicationToInternshipSlice,
  clearAllApplicationData,
  addApplicationToList,
  removeApplicationFromList,
  updateApplicationStatusInList,
} = applicationSlice.actions;

export default applicationSlice.reducer;