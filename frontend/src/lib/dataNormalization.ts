import type {
  Application,
  Internship,
  SavedJob,
  CompanyProfile,
  StudentProfile,
  Resume,
  StudentRef,
  CompanyRef,
  ResumeRef
} from '@/types';

// Utility functions to normalize data and handle nested objects

/**
 * Extracts internship data from nested structures
 */
export const extractInternship = (source: any): Internship | null => {
  if (!source) return null;

  // If it's already an internship object
  if (source.title && source.description) {
    return {
      ...source,
      _id: source._id || source.id,
      id: source.id || source._id, // Keep id for frontend compatibility
      company_id: extractCompanyRef(source.company_id || source.company),
      created_at: source.created_at || new Date().toISOString(),
      updated_at: source.updated_at || source.created_at || new Date().toISOString(),
    };
  }

  return null;
};

/**
 * Extracts company reference from nested structures
 */
export const extractCompanyRef = (source: any): CompanyRef => {
  if (!source) return '';

  // If it's already a string ID
  if (typeof source === 'string') {
    return source;
  }

  // If it's a company object
  if (source.company_name || source._id) {
    return {
      _id: source._id || source.id,
      company_name: source.company_name,
      logo_url: source.logo_url,
      website: source.website,
      industry: source.industry,
      company_size: source.company_size,
      location: source.location,
      description: source.description,
    };
  }

  return '';
};

/**
 * Extracts and normalizes application data
 */
export const extractApplication = (source: any): Application | null => {
  if (!source) return null;

  return {
    ...source,
    _id: source._id || source.id,
    id: source.id || source._id, // Keep id for frontend compatibility
    created_at: source.applied_at || source.created_at || new Date().toISOString(),
    updated_at: source.updated_at || source.applied_at || new Date().toISOString(),
  };
};

/**
 * Extracts and normalizes saved job data
 */
export const extractSavedJob = (source: any): SavedJob | null => {
  if (!source) return null;

  return {
    ...source,
    _id: source._id || source.id,
    id: source.id || source._id, // Keep id for frontend compatibility
    student_id: source.student_id || '',
    internship_id: source.internship_id,
    saved_at: source.saved_at || new Date().toISOString(),
    created_at: source.saved_at || source.created_at || new Date().toISOString(),
    updated_at: source.saved_at || source.updated_at || new Date().toISOString(),
  };
};

/**
 * Extracts student reference from nested structures
 */
export const extractStudentRef = (source: any): StudentRef => {
  if (!source) return '';

  // If it's already a string ID
  if (typeof source === 'string') {
    return source;
  }

  // If it's a student object
  if (source.full_name || source._id) {
    return {
      _id: source._id || source.id,
      user_id: source.user_id,
      full_name: source.full_name,
      email: source.email,
      avatar_url: source.avatar_url,
      university: source.university,
      degree: source.degree,
      graduation_year: source.graduation_year,
      location: source.location,
      phone: source.phone,
      linkedin_url: source.linkedin_url,
      github_url: source.github_url,
      bio: source.bio,
      skills: source.skills,
    };
  }

  return '';
};

/**
 * Extracts resume reference from nested structures
 */
export const extractResumeRef = (source: any): ResumeRef => {
  if (!source) return '';

  // If it's already a string ID
  if (typeof source === 'string') {
    return source;
  }

  // If it's a resume object
  if (source.file_name || source._id) {
    return {
      _id: source._id || source.id,
      file_name: source.file_name,
      file_path: source.file_path,
      file_size: source.file_size,
      mime_type: source.mime_type,
      visibility: source.visibility,
      is_primary: source.is_primary,
      scan_status: source.scan_status,
      scan_message: source.scan_message,
      uploaded_at: source.uploaded_at,
      updated_at: source.updated_at,
      views_count: source.views_count,
      downloads_count: source.downloads_count,
      last_viewed_at: source.last_viewed_at,
      last_downloaded_at: source.last_downloaded_at,
    };
  }

  return '';
};

/**
 * Normalizes application data from API response
 */
export const normalizeApplication = (application: any): Application => {
  return {
    ...application,
    _id: application._id || application.id,
    id: application.id || application._id, // Keep id for frontend compatibility
    internship_id: application.internship || extractInternship(application.internship_id) || application.internship_id,
    student_id: extractStudentRef(application.student_id) || application.student_id,
    resume_id: extractResumeRef(application.resume_id) || application.resume_id,
    internship: application.internship || extractInternship(application.internship_id),
    student: application.student || extractStudentRef(application.student_id),
    created_at: application.created_at || application.applied_at,
    updated_at: application.updated_at || application.applied_at,
  };
};

/**
 * Normalizes internship data from API response
 */
export const normalizeInternship = (internship: any): Internship => {
  return {
    ...internship,
    _id: internship._id || internship.id,
    id: internship.id || internship._id, // Keep id for frontend compatibility
    company_id: extractCompanyRef(internship.company_id) || internship.company_id,
    company: internship.company || (typeof internship.company_id === 'object' ? internship.company_id : null),
    created_at: internship.created_at || new Date().toISOString(),
    updated_at: internship.updated_at || internship.created_at || new Date().toISOString(),
  };
};

/**
 * Normalizes saved job data from API response
 */
export const normalizeSavedJob = (savedJob: any): SavedJob => {
  return {
    ...savedJob,
    _id: savedJob._id || savedJob.id,
    id: savedJob.id || savedJob._id, // Keep id for frontend compatibility
    internship_id: savedJob.internship || extractInternship(savedJob.internship_id) || savedJob.internship_id,
    internship: savedJob.internship || extractInternship(savedJob.internship_id),
    created_at: savedJob.created_at || savedJob.saved_at,
    updated_at: savedJob.updated_at || savedJob.saved_at,
  };
};

/**
 * Normalizes student profile data from API response
 */
export const normalizeStudentProfile = (profile: any): StudentProfile => {
  return {
    ...profile,
    _id: profile._id || profile.id,
    id: profile.id || profile._id, // Keep id for frontend compatibility
    user: profile.user || {
      user_id: profile.user_id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    },
    created_at: profile.created_at || new Date().toISOString(),
    updated_at: profile.updated_at || profile.created_at || new Date().toISOString(),
  };
};

/**
 * Normalizes company profile data from API response
 */
export const normalizeCompanyProfile = (profile: any): CompanyProfile => {
  return {
    ...profile,
    _id: profile._id || profile.id,
    id: profile.id || profile._id, // Keep id for frontend compatibility
    user: profile.user || {
      user_id: profile.user_id,
      email: profile.email,
      role: profile.role,
    },
    created_at: profile.created_at || new Date().toISOString(),
    updated_at: profile.updated_at || profile.created_at || new Date().toISOString(),
  };
};

/**
 * Normalizes resume data from API response
 */
export const normalizeResume = (resume: any): Resume => {
  return {
    ...resume,
    _id: resume._id || resume.id,
    id: resume.id || resume._id, // Keep id for frontend compatibility
    student_id: resume.student_id || resume.user_id,
    user_id: resume.user_id || resume.student_id,
    created_at: resume.created_at || resume.uploaded_at,
    updated_at: resume.updated_at || resume.uploaded_at,
  };
};

/**
 * Gets the correct ID from a MongoDB document
 */
export const getId = (doc: any): string => {
  return doc?._id || doc?.id || '';
};

/**
 * Checks if two IDs are the same (handles _id vs id)
 */
export const isSameId = (id1: string | undefined, id2: string | undefined): boolean => {
  if (!id1 || !id2) return false;
  return id1 === id2;
};

/**
 * Helper to safely get nested company data
 */
export const getCompanyData = (internship: any) => {
  if (internship?.company) {
    return internship.company;
  }
  if (typeof internship?.company_id === 'object') {
    return internship.company_id;
  }
  return null;
};

/**
 * Helper to safely get nested student data
 */
export const getStudentData = (application: any) => {
  if (application?.student) {
    return application.student;
  }
  if (typeof application?.student_id === 'object') {
    return application.student_id;
  }
  return null;
};

/**
 * Helper to safely get nested resume data
 */
export const getResumeData = (application: any) => {
  if (application?.resume) {
    return application.resume;
  }
  if (typeof application?.resume_id === 'object') {
    return application.resume_id;
  }
  return null;
};

/**
 * Helper to safely get nested internship data from application
 */
export const getInternshipData = (application: any) => {
  if (application?.internship) {
    return application.internship;
  }
  if (typeof application?.internship_id === 'object') {
    return application.internship_id;
  }
  return null;
};