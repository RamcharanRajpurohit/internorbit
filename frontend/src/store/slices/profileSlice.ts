import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentProfileAPI, companyProfileAPI, resumeAPI } from '@/lib/api';
import type {
  StudentProfile,
  CompanyProfile,
  Resume,
  StudentProfileResponse,
  CompanyProfileResponse,
  ResumeListResponse,
  UpdateStudentProfileRequest,
  UpdateCompanyProfileRequest
} from '@/types';

export interface ProfileState {
  studentProfile: StudentProfile | null;
  companyProfile: CompanyProfile | null;
  resumes: Resume[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

// Async thunks
export const fetchStudentProfile = createAsyncThunk(
  'profile/fetchStudentProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response: StudentProfileResponse = await studentProfileAPI.getProfile();

      // Fetch resumes separately
      let resumes = [];
      try {
        const resumesResponse: ResumeListResponse = await resumeAPI.getStudentResumes();
        resumes = resumesResponse.resumes || [];
      } catch (resumeError) {
        // If resumes fetch fails, continue with empty resumes
        console.warn('Failed to fetch resumes:', resumeError);
        resumes = [];
      }

      return {
        ...response.profile,
        resumes: resumes.map((resume: any) => ({
          ...resume,
          id: resume.id || resume._id, // Keep id for frontend compatibility
          student_id: resume.student_id || resume.user_id,
          user_id: resume.user_id || resume.student_id,
        }))
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch student profile');
    }
  }
);

export const updateStudentProfile = createAsyncThunk(
  'profile/updateStudentProfile',
  async (profileData: UpdateStudentProfileRequest, { rejectWithValue }) => {
    try {
      const response: StudentProfileResponse = await studentProfileAPI.updateProfile(profileData);
      return response.profile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update student profile');
    }
  }
);

export const fetchCompanyProfile = createAsyncThunk(
  'profile/fetchCompanyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response: CompanyProfileResponse = await companyProfileAPI.getProfile();
      return response.profile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch company profile');
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  'profile/updateCompanyProfile',
  async (profileData: UpdateCompanyProfileRequest, { rejectWithValue }) => {
    try {
      const response: CompanyProfileResponse = await companyProfileAPI.updateProfile(profileData);
      return response.profile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update company profile');
    }
  }
);

// Initial state
const initialState: ProfileState = {
  studentProfile: null,
  companyProfile: null,
  resumes: [],
  isLoading: false,
  isUpdating: false,
  error: null,
};

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfiles: (state) => {
      state.studentProfile = null;
      state.companyProfile = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch student profile
    builder
      .addCase(fetchStudentProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update student profile
    builder
      .addCase(updateStudentProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.studentProfile = action.payload;
        state.error = null;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch company profile
    builder
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companyProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update company profile
    builder
      .addCase(updateCompanyProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.companyProfile = action.payload;
        state.error = null;
      })
      .addCase(updateCompanyProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError: clearProfileError, clearProfiles } = profileSlice.actions;
export default profileSlice.reducer;