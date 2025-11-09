import { useState, useCallback } from 'react';
import type { PaginationInfo } from '@/types';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
  handlePageChange: (page: number) => void;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handleLimitChange: (limit: number) => void;
  resetPagination: () => void;
  getPaginationParams: () => { page: number; limit: number };
}

export const usePagination = ({
  initialPage = 1,
  initialLimit = 20,
  onPageChange,
  onLimitChange,
}: UsePaginationOptions = {}): UsePaginationReturn => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const offset = (page - 1) * limit;

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  }, [onPageChange]);

  const handleNextPage = useCallback(() => {
    handlePageChange(page + 1);
  }, [page, handlePageChange]);

  const handlePreviousPage = useCallback(() => {
    handlePageChange(Math.max(1, page - 1));
  }, [page, handlePageChange]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    onPageChange?.(1); // Reset to first page when limit changes
    onLimitChange?.(newLimit);
  }, [onPageChange, onLimitChange]);

  const resetPagination = useCallback(() => {
    handlePageChange(initialPage);
    setLimit(initialLimit);
  }, [handlePageChange, initialPage, initialLimit]);

  const getPaginationParams = useCallback(() => ({
    page,
    limit,
  }), [page, limit]);

  return {
    page,
    limit,
    offset,
    hasNextPage: false, // Will be calculated when pagination data is available
    hasPreviousPage: page > 1,
    totalPages: 1, // Will be calculated when pagination data is available
    handlePageChange,
    handleNextPage,
    handlePreviousPage,
    handleLimitChange,
    resetPagination,
    getPaginationParams,
  };
};

interface UsePaginationWithDataOptions extends UsePaginationOptions {
  total?: number;
}

interface UsePaginationWithDataReturn extends UsePaginationReturn {
  hasNextPage: boolean;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export const usePaginationWithData = ({
  total = 0,
  ...paginationOptions
}: UsePaginationWithDataOptions): UsePaginationWithDataReturn => {
  const pagination = usePagination(paginationOptions);

  const totalPages = Math.ceil(total / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPreviousPage = pagination.page > 1;
  const isFirstPage = pagination.page === 1;
  const isLastPage = pagination.page === totalPages;

  return {
    ...pagination,
    hasNextPage,
    totalPages,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
  };
};

/**
 * Hook to work with API pagination response data
 */
export const useApiPagination = (paginationData?: PaginationInfo) => {
  return usePaginationWithData({
    total: paginationData?.total,
    initialPage: paginationData?.page || 1,
    initialLimit: paginationData?.limit || 20,
  });
};

/**
 * Utility to calculate pagination info
 */
export const calculatePaginationInfo = (
  total: number,
  page: number,
  limit: number
): PaginationInfo => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

/**
 * Utility to get page range for pagination controls
 */
export const getPageRange = (
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): number[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const halfVisible = Math.floor(maxVisible / 2);
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  // Adjust if we're at the end
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
};