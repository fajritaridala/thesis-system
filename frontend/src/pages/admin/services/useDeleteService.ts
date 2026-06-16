import { useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '@/services/admin.service';

type UseDeleteServiceProps = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useDeleteService = ({
  onSuccess,
  onError,
}: UseDeleteServiceProps = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => servicesService.removeService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  return {
    deleteService: mutate,
    isDeleting: isPending,
  };
};
