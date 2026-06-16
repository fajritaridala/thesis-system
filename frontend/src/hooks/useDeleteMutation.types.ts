import { QueryKey } from '@tanstack/react-query';

export type UseDeleteMutationOptions<TId = string> = {
  mutationFn: (id: TId) => Promise<unknown>;
  queryKey: QueryKey;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export type UseDeleteMutationReturn<TId = string> = {
  deleteMutate: (id: TId) => void;
  isDeleting: boolean;
};
