'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PAGINATION_OPTIONS } from '@/constants/list.constants';
import useDebounceCallback from './useDebounce';
import type { UsePaginationOptions, UsePaginationReturn } from './usePagination.types';

/**
 * Shared hook for URL-based pagination, search, and filtering.
 * Replaces duplicate logic in useServices, useSchedules, useEnrollments.
 */
function usePagination(options?: UsePaginationOptions): UsePaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounce = useDebounceCallback();
  
  const debounceDelay = options?.debounceDelay ?? PAGINATION_OPTIONS.delay;

  // Current values from URL
  const currentLimit = searchParams?.get('limit') ?? String(PAGINATION_OPTIONS.limitDefault);
  const currentPage = searchParams?.get('page') ?? String(PAGINATION_OPTIONS.pageDefault);
  const currentSearch = searchParams?.get('search') ?? '';

  const getParam = useCallback(
    (key: string): string => searchParams?.get(key) ?? '',
    [searchParams]
  );

  const setParams = useCallback(
    (
      updates: Record<string, string | null | undefined>,
      method: 'push' | 'replace' = 'push'
    ) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      const href = queryString ? `${pathname}?${queryString}` : pathname;
      router[method](href);
    },
    [pathname, router, searchParams]
  );

  // Ensure default params are set on mount
  useEffect(() => {
    const hasLimit = searchParams?.has('limit');
    const hasPage = searchParams?.has('page');
    if (hasLimit && hasPage) return;

    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (!hasLimit) params.set('limit', String(PAGINATION_OPTIONS.limitDefault));
    if (!hasPage) params.set('page', String(PAGINATION_OPTIONS.pageDefault));
    
    const queryString = params.toString();
    const href = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(href);
  }, [pathname, router, searchParams]);

  const handleChangePage = useCallback(
    (page: number) => {
      setParams({ page: String(page) });
    },
    [setParams]
  );

  const handleChangeLimit = useCallback(
    (limit: string) => {
      setParams({ limit, page: String(PAGINATION_OPTIONS.pageDefault) });
    },
    [setParams]
  );

  const handleSearch = useCallback(
    (value: string) => {
      debounce(() => {
        setParams({ search: value, page: String(PAGINATION_OPTIONS.pageDefault) });
      }, debounceDelay);
    },
    [debounce, debounceDelay, setParams]
  );

  const handleClearSearch = useCallback(() => {
    setParams({ search: null, page: String(PAGINATION_OPTIONS.pageDefault) });
  }, [setParams]);

  return {
    currentPage,
    currentLimit,
    currentSearch,
    getParam,
    setParams,
    handleChangePage,
    handleChangeLimit,
    handleSearch,
    handleClearSearch,
  };
}

export default usePagination;
