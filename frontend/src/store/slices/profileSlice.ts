import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentProfileAPI, companyProfileAPI, resumeAPI } from '@/lib/api';

// Types
export interface StudentProfile {
  _id: string;
  id: string; // Alias for _id for frontend compatibility
  user_id: string;
  bio?: string;
  university?: string;
  degree?: string;
  graduation_year?: number;
  location?: string;
  skills?: string[];
  resume_url?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
  // Frontend compatibility fields (not from backend)
  full_name?: string; // May come from profile user relationship
  first_name?: string;
  last_name?: string;
  email?: string; // May come from profile user relationship
  avatar_url?: string; // May come from profile user relationship
  phone_number?: string; // Alias for phone
  major?: string; // Alias for degree
  gpa?: number;
  experience_years?: number;
  portfolio_url?: string;
  // Additional fields expected by components
  resumes?: Array<{
    _id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    visibility: 'private' | 'public' | 'restricted';
    is_primary: boolean;
    scan_status: 'pending' | 'clean' | 'rejected';
    uploaded_at: string;
    updated_at: string;
    views_count: number;
    downloads_count: number;
  }>;
  projects?: Array<{
    _id: string;
    title: string;
    description: string;
    technologies: string[];
    project_url?: string;
    github_url?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
  }>;
  experiences?: Array<{
    _id: string;
    company_name: string;
    position: string;
    description?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    location?: string;
  }>;
  // Populated user relationship
  user?: {
    user_id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CompanyProfile {
  _id: string;
  id: string; // Alias for _id for frontend compatibility
  user_id: string;
  company_name: string;
  description?: string;
  website?: string;
  industry?: string;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  location?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  // Frontend compatibility fields (not from backend)
  size?: string; // Alias for company_size
  headquarters?: string; // Alias for location
  founded_year?: number;
  benefits?: string[];
  tech_stack?: string[];
  social_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface Resume {
  _id: string;
  id: string; // Alias for _id for frontend compatibility
  student_id: string;
  user_id: string;
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
  restricted_access_ids: string[];
  // Frontend compatibility fields
  views?: number; // Alias for views_count
  downloads?: number; // Alias for downloads_count
  last_viewed?: string; // Alias for last_viewed_at
}

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
      const response = await studentProfileAPI.getProfile();

      // Fetch resumes separately
      let resumes = [];
      try {
        const resumesResponse = await resumeAPI.getStudentResumes();
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
          id: resume._id,
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
  async (profileData: Partial<StudentProfile>, { rejectWithValue }) => {
    try {
      const response = await studentProfileAPI.updateProfile(profileData);
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
      const response = await companyProfileAPI.getProfile();
      return response.profile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch company profile');
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  'profile/updateCompanyProfile',
  async (profileData: Partial<CompanyProfile>, { rejectWithValue }) => {
    try {
      const response = await companyProfileAPI.updateProfile(profileData);
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