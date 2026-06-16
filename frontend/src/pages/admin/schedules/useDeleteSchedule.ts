import { useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesService } from '@/services/admin.service';

type UseDeleteScheduleProps = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useDeleteSchedule = ({
  onSuccess,
  onError,
}: UseDeleteScheduleProps = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => schedulesService.removeSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  return {
    deleteSchedule: mutate,
    isDeleting: isPending,
  };
};
