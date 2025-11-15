import type { ApplicationStatus } from '@/types';

// Application status constants with dark mode support
export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; color: string }> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500 dark:bg-yellow-600',
  },
  reviewed: {
    label: 'Reviewed',
    color: 'bg-blue-500 dark:bg-blue-600',
  },
  shortlisted: {
    label: 'Shortlisted',
    color: 'bg-purple-500 dark:bg-purple-600',
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-500 dark:bg-green-600',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500 dark:bg-red-600',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-muted dark:bg-muted',
  },
};

// Application status options for filters and selects
export const APPLICATION_STATUS_OPTIONS: Array<{ value: ApplicationStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

// Internship status constants
export const INTERNSHIP_STATUS = {
  active: {
    label: 'Active',
    color: 'bg-green-500 dark:bg-green-600',
  },
  closed: {
    label: 'Closed',
    color: 'bg-red-500 dark:bg-red-600',
  },
  draft: {
    label: 'Draft',
    color: 'bg-muted dark:bg-muted',
  },
} as const;

// Resume scan status constants
export const RESUME_SCAN_STATUS = {
  pending: {
    label: 'Scanning',
    color: 'bg-yellow-500 dark:bg-yellow-600',
  },
  clean: {
    label: 'Clean',
    color: 'bg-green-500 dark:bg-green-600',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500 dark:bg-red-600',
  },
} as const;

// Resume visibility constants
export const RESUME_VISIBILITY = {
  private: {
    label: 'Private',
    description: 'Only visible to you',
  },
  public: {
    label: 'Public',
    description: 'Visible to companies',
  },
  restricted: {
    label: 'Restricted',
    description: 'Visible to specific companies',
  },
} as const;

// Company size constants
export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
] as const;

// Helper function to get application status info
export const getApplicationStatusInfo = (status: ApplicationStatus) => {
  return APPLICATION_STATUS[status] || APPLICATION_STATUS.pending;
};

// Helper function to get internship status info
export const getInternshipStatusInfo = (status: keyof typeof INTERNSHIP_STATUS) => {
  return INTERNSHIP_STATUS[status] || INTERNSHIP_STATUS.draft;
};

// Helper function to get resume scan status info
export const getResumeScanStatusInfo = (status: keyof typeof RESUME_SCAN_STATUS) => {
  return RESUME_SCAN_STATUS[status] || RESUME_SCAN_STATUS.pending;
};