import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseDeleteMutationOptions, UseDeleteMutationReturn } from './useDeleteMutation.types';

/**
 * Generic hook for delete mutations with cache invalidation.
 * Replaces duplicate patterns in useDeleteServiceModal, useDeleteScheduleModal.
 */
function useDeleteMutation<TId = string>({
  mutationFn,
  queryKey,
  onSuccess,
  onError,
}: UseDeleteMutationOptions<TId>): UseDeleteMutationReturn<TId> {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  return {
    deleteMutate: mutate,
    isDeleting: isPending,
  };
}

export default useDeleteMutation;
