import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { internshipAPI, applicationAPI, interactionAPI, studentProfileAPI, companyProfileAPI, authAPI } from '@/lib/api';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';

// Types
export interface UseQueryConfig<T = any> extends Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'> {}
export interface UseMutationConfig<T = any, V = any> extends Omit<UseMutationOptions<T, Error, V>, 'mutationFn'> {}

// Query keys
export const queryKeys = {
  // Internships
  internships: ['internships'],
  internship: (id: string) => ['internships', id],
  companyInternships: ['internships', 'company'],

  // Applications
  studentApplications: ['applications', 'student'],
  companyApplications: ['applications', 'company'],
  application: (id: string) => ['applications', id],

  // Saved jobs
  savedJobs: ['savedJobs'],
  isJobSaved: (id: string) => ['savedJobs', id],

  // Swipes
  swipes: ['swipes'],

  // Profiles
  studentProfile: ['profile', 'student'],
  companyProfile: ['profile', 'company'],

  // Auth
  currentUser: ['auth', 'currentUser'],
} as const;

// ===== INTERNSHIP HOOKS =====

export const useInternships = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  skills?: string;
  remote?: boolean;
}, config?: UseQueryConfig) => {
  return useQuery({
    queryKey: [...queryKeys.internships, params],
    queryFn: () => internshipAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...config,
  });
};

export const useInternship = (id: string, config?: UseQueryConfig) => {
  return useQuery({
    queryKey: queryKeys.internship(id),
    queryFn: () => internshipAPI.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...config,
  });
};

export const useCompanyInternships = (params?: {
  page?: number;
  limit?: number;
}, config?: UseQueryConfig) => {
  return useQuery({
    queryKey: [...queryKeys.companyInternships, params],
    queryFn: () => internshipAPI.getAllByCompanyId(params),
    staleTime: 5 * 60 * 1000,
    ...config,
  });
};

export const useCreateInternship = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: internshipAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyInternships });
    },
    ...config,
  });
};

export const useUpdateInternship = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => internshipAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internship(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.companyInternships });
    },
    ...config,
  });
};

export const usePublishInternship = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: internshipAPI.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyInternships });
    },
    ...config,
  });
};

export const useDeleteInternship = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: internshipAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyInternships });
    },
    ...config,
  });
};

// ===== APPLICATION HOOKS =====

export const useStudentApplications = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}, config?: UseQueryConfig) => {
  return useQuery({
    queryKey: [...queryKeys.studentApplications, params],
    queryFn: () => applicationAPI.getStudentApplications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...config,
  });
};

export const useCompanyApplications = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}, config?: UseQueryConfig) => {
  return useQuery({
    queryKey: [...queryKeys.companyApplications, params],
    queryFn: () => applicationAPI.getCompanyApplications(params),
    staleTime: 2 * 60 * 1000,
    ...config,
  });
};

export const useCreateApplication = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentApplications });
      queryClient.invalidateQueries({ queryKey: queryKeys.companyApplications });
    },
    ...config,
  });
};

export const useUpdateApplicationStatus = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationAPI.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.application(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentApplications });
      queryClient.invalidateQueries({ queryKey: queryKeys.companyApplications });
    },
    ...config,
  });
};

export const useWithdrawApplication = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationAPI.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentApplications });
    },
    ...config,
  });
};

// ===== SAVED JOBS HOOKS =====

export const useSavedJobs = (params?: {
  page?: number;
  limit?: number;
}, config?: UseQueryConfig) => {
  return useQuery({
    queryKey: [...queryKeys.savedJobs, params],
    queryFn: () => interactionAPI.getSavedJobs(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...config,
  });
};

export const useIsJobSaved = (internshipId: string, config?: UseQueryConfig) => {
  return useQuery({
    queryKey: queryKeys.isJobSaved(internshipId),
    queryFn: () => interactionAPI.checkIfSaved(internshipId),
    enabled: !!internshipId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...config,
  });
};

export const useSaveJob = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: interactionAPI.saveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs });
    },
    ...config,
  });
};

export const useUnsaveJob = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: interactionAPI.unsaveJob,
    onSuccess: (_, internshipId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs });
      queryClient.invalidateQueries({ queryKey: queryKeys.isJobSaved(internshipId) });
    },
    ...config,
  });
};

// ===== SWIPE HOOKS =====

export const useSwipes = (params?: {
  page?: number;
  limit?: number;
  direction?: string;
}, config?: UseQueryConfig) => {
  return useQuery({
    queryKey: [...queryKeys.swipes, params],
    queryFn: () => interactionAPI.getSwipes(params),
    staleTime: 5 * 60 * 1000,
    ...config,
  });
};

export const useCreateSwipe = (config?: UseMutationConfig) => {
  return useMutation({
    mutationFn: ({ internship_id, direction }: { internship_id: string; direction: 'left' | 'right' }) =>
      interactionAPI.createSwipe(internship_id, direction),
    ...config,
  });
};

// ===== PROFILE HOOKS =====

export const useStudentProfile = (config?: UseQueryConfig) => {
  return useQuery({
    queryKey: queryKeys.studentProfile,
    queryFn: studentProfileAPI.getProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...config,
  });
};

export const useUpdateStudentProfile = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studentProfileAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentProfile });
    },
    ...config,
  });
};

export const useCompanyProfile = (config?: UseQueryConfig) => {
  return useQuery({
    queryKey: queryKeys.companyProfile,
    queryFn: companyProfileAPI.getProfile,
    staleTime: 10 * 60 * 1000,
    ...config,
  });
};

export const useUpdateCompanyProfile = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyProfileAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companyProfile });
    },
    ...config,
  });
};

// ===== AUTH HOOKS =====

export const useCurrentUser = (config?: UseQueryConfig) => {
  const dispatch = useDispatch<AppDispatch>();

  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authAPI.getCurrentUser,
    retry: 1,
    ...config,
  });
};

export const useUpdateProfile = (config?: UseMutationConfig) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
    ...config,
  });
};