import { supabase } from '@/integrations/supabase/client';
import type {
  AuthResponse,
  InternshipListResponse,
  Internship,
  ApplicationListResponse,
  ApplicationDetailResponse,
  CreateApplicationRequest,
  CreateApplicationResponse,
  UpdateApplicationStatusRequest,
  SavedJobsListResponse,
  SaveJobResponse,
  SwipeListResponse,
  SwipeRecord,
  StudentProfileResponse,
  CompanyProfileResponse,
  UpdateStudentProfileRequest,
  UpdateCompanyProfileRequest,
  ResumeListResponse,
  StatsResponse,
  InternshipFilters,
  StudentSearchFilters,
  CompanySearchFilters,
  ResumeDiscoveryFilters,
  CreateInternshipRequest,
  UpdateInternshipRequest
} from '@/types';

const API_URL = import.meta.env.VITE_API_URI;

// Get auth token from Supabase
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Helper function to make API calls
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// ============ AUTH ENDPOINTS ============

export const authAPI = {
  getCurrentUser: (): Promise<AuthResponse> => apiCall('/auth/me'),
  updateProfile: (data: any): Promise<AuthResponse> => apiCall('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ============ INTERNSHIP ENDPOINTS ============

export const internshipAPI = {
  getAll: (params?: InternshipFilters): Promise<InternshipListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    if (params?.location) query.append('location', params.location);
    if (params?.skills) query.append('skills', params.skills);
    if (params?.remote) query.append('remote', 'true');

    return apiCall(`/internships${query.toString() ? '?' + query.toString() : ''}`);
  },

  getById: (id: string): Promise<{ internship: Internship }> => apiCall(`/internships/${id}`),

  create: (data: CreateInternshipRequest): Promise<{ internship: Internship }> => apiCall('/internships', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: UpdateInternshipRequest): Promise<{ internship: Internship }> => apiCall(`/internships/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  publish: (id: string): Promise<void> => apiCall(`/internships/${id}/publish`, {
    method: 'PATCH',
  }),

  delete: (id: string): Promise<void> => apiCall(`/internships/${id}`, {
    method: 'DELETE',
  }),
  getAllByCompanyId: (params?: { page?: number; limit?: number }): Promise<{ internships: Internship[] }> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return apiCall(`/internships/company${query.toString() ? '?' + query.toString() : ''}`);
  },
};

// ============ APPLICATION ENDPOINTS ============

export const applicationAPI = {
  getStudentApplications: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApplicationListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    return apiCall(`/applications/student${query.toString() ? '?' + query.toString() : ''}`);
  },

  getCompanyApplications: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApplicationListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    return apiCall(`/applications/company${query.toString() ? '?' + query.toString() : ''}`);
  },

  create: (data: CreateApplicationRequest): Promise<CreateApplicationResponse> =>
    apiCall('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, data: UpdateApplicationStatusRequest): Promise<CreateApplicationResponse> =>
    apiCall(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getById: (id: string): Promise<ApplicationDetailResponse> => apiCall(`/applications/${id}`),

  withdraw: (id: string): Promise<void> => apiCall(`/applications/${id}`, {
    method: 'DELETE',
  }),
};

// ============ SWIPES & SAVED ENDPOINTS ============

export const interactionAPI = {
  // Swipes
  createSwipe: (internship_id: string, direction: 'left' | 'right'): Promise<{ swipe: SwipeRecord }> =>
    apiCall('/interactions/swipes', {
      method: 'POST',
      body: JSON.stringify({ internship_id, direction }),
    }),

  getSwipes: (params?: { page?: number; limit?: number; direction?: string }): Promise<SwipeListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.direction) query.append('direction', params.direction);

    return apiCall(`/interactions/swipes${query.toString() ? '?' + query.toString() : ''}`);
  },

  getSwipeStats: (internship_id: string): Promise<StatsResponse> =>
    apiCall(`/interactions/swipes/stats/${internship_id}`),

  // Saved Jobs
  saveJob: (internship_id: string): Promise<SaveJobResponse> =>
    apiCall('/interactions/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ internship_id }),
    }),

  getSavedJobs: (params?: { page?: number; limit?: number }): Promise<SavedJobsListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return apiCall(`/interactions/saved-jobs${query.toString() ? '?' + query.toString() : ''}`);
  },

  checkIfSaved: (internship_id: string): Promise<{ is_saved: boolean }> =>
    apiCall(`/interactions/saved-jobs/${internship_id}`),

  unsaveJob: (internship_id: string): Promise<void> =>
    apiCall(`/interactions/saved-jobs/${internship_id}`, {
      method: 'DELETE',
    }),
};

// ============ PROFILE ENDPOINTS ============

export const companyProfileAPI = {
  getProfile: (): Promise<CompanyProfileResponse> => apiCall('/company-profile'),

  createProfile: (data: any): Promise<CompanyProfileResponse> => apiCall('/company-profile', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateProfile: (data: UpdateCompanyProfileRequest): Promise<CompanyProfileResponse> => apiCall('/company-profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  getPublicProfile: (userId: string): Promise<CompanyProfileResponse> =>
    apiCall(`/company-profile/public/${userId}`),

  searchCompanies: (params?: CompanySearchFilters): Promise<{ companies: any[]; pagination: any }> => {
    const query = new URLSearchParams();
    if (params?.query) query.append('query', params.query);
    if (params?.industry) query.append('industry', params.industry);
    if (params?.location) query.append('location', params.location);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return apiCall(`/company-profile/search${query.toString() ? '?' + query.toString() : ''}`);
  },
};

export const studentProfileAPI = {
  getProfile: (): Promise<StudentProfileResponse> => apiCall('/student-profile'),

  createProfile: (data: any): Promise<StudentProfileResponse> => apiCall('/student-profile', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateProfile: (data: UpdateStudentProfileRequest): Promise<StudentProfileResponse> => apiCall('/student-profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  getPublicProfile: (userId: string): Promise<StudentProfileResponse> =>
    apiCall(`/student-profile/public/${userId}`),

  searchStudents: (params?: StudentSearchFilters): Promise<{ students: any[]; pagination: any }> => {
    const query = new URLSearchParams();
    if (params?.skills) query.append('skills', params.skills);
    if (params?.university) query.append('university', params.university);
    if (params?.graduation_year) query.append('graduation_year', String(params.graduation_year));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return apiCall(`/student-profile/search${query.toString() ? '?' + query.toString() : ''}`);
  },
};

export const resumeAPI = {
  getApplicationResume: (resumeId: string, applicationId: string, accessType: 'view' | 'download' = 'view'): Promise<{ url: string; access_token: string }> =>
    apiCall(`/resume/${resumeId}/access?application_id=${applicationId}&access_type=${accessType}`, {
      method: 'POST',
    }),

  // Get student's own resume for viewing
  getStudentResume: (resumeId: string, accessType: 'view' | 'download' = 'view'): Promise<{ url: string; access_token: string }> =>
    apiCall(`/resume/${resumeId}/access?access_type=${accessType}`, {
      method: 'POST',
    }),

  // Get all student resumes
  getStudentResumes: (): Promise<ResumeListResponse> =>
    apiCall('/resume', {
      method: 'GET',
    }),

  // Company discovers public resumes
  discoverResumes: (params?: ResumeDiscoveryFilters): Promise<{ resumes: any[]; pagination: any }> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.skills) query.append('skills', params.skills);
    if (params?.university) query.append('university', params.university);

    return apiCall(`/resume/discover${query.toString() ? '?' + query.toString() : ''}`);
  },

  getStats: (): Promise<StatsResponse> => apiCall('/resume/stats'),

  updateVisibility: (resumeId: string, visibility: 'private' | 'public' | 'restricted'): Promise<{ resume: any }> =>
    apiCall(`/resume/${resumeId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    }),

  deleteResume: (resumeId: string): Promise<void> =>
    apiCall(`/resume/${resumeId}`, { method: 'DELETE' }),

  setPrimary: (resumeId: string): Promise<{ resume: any }> =>
    apiCall(`/resume/${resumeId}/set-primary`, { method: 'PATCH' }),
};