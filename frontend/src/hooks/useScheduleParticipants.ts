import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import usePagination from '@/hooks/usePagination';
import { enrollmentsService } from '@/services/admin.service';

export const useScheduleParticipants = (
  scheduleId?: string,
  isOpen?: boolean
) => {
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleSearch,
    handleClearSearch,
  } = usePagination();

  const {
    data: enrollmentsResponse,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [
      'schedule-enrollments',
      scheduleId,
      currentPage,
      currentLimit,
      currentSearch,
    ],
    queryFn: async () => {
      if (!scheduleId) return { data: [], pagination: { totalPages: 1 } };
      const response = await enrollmentsService.getScheduleEnrollments(
        scheduleId,
        {
          page: Number(currentPage),
          limit: Number(currentLimit),
          search: currentSearch,
        }
      );
      return response.data;
    },
    enabled: !!scheduleId && !!isOpen,
  });

  const enrollments = useMemo(() => {
    return enrollmentsResponse?.data || [];
  }, [enrollmentsResponse]);

  const totalPages = enrollmentsResponse?.pagination?.totalPages || 1;

  return {
    enrollments,
    isLoading,
    isRefetching,
    currentPage: Number(currentPage),
    totalPages,
    currentSearch,
    handleChangePage,
    handleSearch,
    handleClearSearch,
  };
};
