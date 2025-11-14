// Base MongoDB document interface
export interface MongoDocument {
  _id: string;
  id?: string; // Alias for frontend compatibility
  created_at: string;
  updated_at: string;
}

// User types
export interface User extends MongoDocument {
  email: string;
  role: 'student' | 'company';
  profile_complete: boolean;
}

// Company Profile types
export interface CompanyProfile extends MongoDocument {
  user_id: string;
  company_name: string;
  description?: string;
  website?: string;
  industry?: string;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  location?: string;
  logo_url?: string;
  // Frontend compatibility fields
  size?: string;
  headquarters?: string;
  founded_year?: number;
  benefits?: string[];
  tech_stack?: string[];
  social_links?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  // Populated relationships
  user?: {
    user_id: string;
    email: string;
    role: string;
  };
}

// Student Profile types
export interface StudentProfile extends MongoDocument {
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
  // Frontend compatibility fields
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  phone_number?: string;
  major?: string;
  gpa?: number;
  experience_years?: number;
  portfolio_url?: string;
  // Related data
  resumes?: Resume[];
  projects?: Project[];
  experiences?: Experience[];
  // Populated relationships
  user?: {
    user_id: string;
    email: string;
    role: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Resume types
export interface Resume extends MongoDocument {
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
  views?: number;
  downloads?: number;
  last_viewed?: string;
}

// Project types
export interface Project extends MongoDocument {
  student_id: string;
  title: string;
  description: string;
  technologies: string[];
  project_url?: string;
  github_url?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

// Experience types
export interface Experience extends MongoDocument {
  student_id: string;
  company_name: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
}

// Company Profile Reference
export type CompanyRef = string | {
  _id: string;
  company_name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  description?: string;
};

// Internship types
export interface Internship extends MongoDocument {
  company_id: CompanyRef;
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
  // Frontend compatibility fields
  application_count?: number;
  company_name?: string;
  is_saved?: boolean;
  has_applied?: boolean;
  deadline?: string;
  duration?: string;
  skills?: string[];
  // Populated relationships
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

// Application Status Types
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

// Student Profile Reference
export type StudentRef = string | {
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

// Resume Reference
export type ResumeRef = string | {
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

// Application types
export interface Application extends MongoDocument {
  internship_id: string | Internship;
  student_id: StudentRef;
  resume_id: ResumeRef;
  cover_letter: string;
  status: ApplicationStatus;
  applied_at: string;
  reviewed_at?: string;
  feedback?: string;
  // Populated relationships
  student?: StudentRef;
  internship?: Internship;
  applications_count?: number;
}

// Saved Job types
export interface SavedJob extends MongoDocument {
  student_id: string;
  internship_id: string | Internship;
  saved_at: string;
  // Populated relationships
  internship?: Internship;
}

// Swipe Record types
export interface SwipeRecord extends MongoDocument {
  internship_id: string | Internship;
  direction: 'left' | 'right';
  created_at: string;
  // Populated relationships
  internship?: {
    _id: string;
    title: string;
    company_name: string;
  };
}

// Pagination types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

// List Response types
export interface ListResponse<T> {
  items: T[];
  pagination: PaginationInfo;
  total?: number;
  totalPages?: number;
}

// Internship List Response
export interface InternshipListResponse extends ListResponse<Internship> {
  internships: Internship[];
}

// Application List Response
export interface ApplicationListResponse extends ListResponse<Application> {
  applications: Application[];
}

// Saved Jobs List Response
export interface SavedJobsListResponse extends ListResponse<SavedJob> {
  saved: SavedJob[];
  savedJobs?: SavedJob[];
}

// Swipe List Response
export interface SwipeListResponse extends ListResponse<SwipeRecord> {
  swipes: SwipeRecord[];
}

// Create Application Request
export interface CreateApplicationRequest {
  internship_id: string;
  resume_id: string;
  cover_letter: string;
}

// Update Application Status Request
export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}

// Auth responses
export interface AuthResponse {
  user: User;
  token?: string;
}

// Profile responses
export interface StudentProfileResponse {
  profile: StudentProfile;
}

export interface CompanyProfileResponse {
  profile: CompanyProfile;
}

// Resume responses
export interface ResumeListResponse {
  resumes: Resume[];
}

// Application detail response
export interface ApplicationDetailResponse {
  application: Application;
  applications_count?: number;
}

// Create application response
export interface CreateApplicationResponse {
  application: Application;
  applications_count?: number;
  internship?: Internship; // Full internship object with all fields
  message?: string;
}

// Withdraw application response
export interface WithdrawApplicationResponse {
  message: string;
  internship?: Internship; // Full internship object
}

// Save job response
export interface SaveJobResponse {
  saved: SavedJob;
  internship?: Internship; // Full internship object
  message?: string;
}

// Stats response
export interface StatsResponse {
  [key: string]: number | string;
}

// Filter types for internships
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

// Student search filters
export interface StudentSearchFilters {
  skills?: string;
  university?: string;
  graduation_year?: number;
  page?: number;
  limit?: number;
}

// Company search filters
export interface CompanySearchFilters {
  query?: string;
  industry?: string;
  location?: string;
  page?: number;
  limit?: number;
}

// Resume discovery filters
export interface ResumeDiscoveryFilters {
  page?: number;
  limit?: number;
  skills?: string;
  university?: string;
}

// Update profile types
export interface UpdateStudentProfileRequest {
  bio?: string;
  university?: string;
  degree?: string;
  graduation_year?: number;
  location?: string;
  skills?: string[];
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
}

export interface UpdateCompanyProfileRequest {
  company_name?: string;
  description?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  logo_url?: string;
}

// Create Internship Request
export interface CreateInternshipRequest {
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
}

// Update Internship Request
export interface UpdateInternshipRequest extends Partial<CreateInternshipRequest> {
  status?: 'active' | 'closed' | 'draft';
}

// Utility types
export type ID = string;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;