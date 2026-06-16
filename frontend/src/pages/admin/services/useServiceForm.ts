import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as yup from 'yup';
import { servicesService } from '@/services/admin.service';
import { ServiceItem, ServicePayload } from '@/types/admin.types';

// ============ VALIDATION SCHEMA ============
const serviceSchema: yup.ObjectSchema<ServicePayload> = yup.object({
  name: yup.string().required('Nama layanan wajib diisi'),
  description: yup.string().required('Deskripsi wajib diisi'),
  price: yup
    .number()
    .typeError('Harga harus berupa angka')
    .positive('Harga harus lebih dari 0')
    .required('Harga wajib diisi'),
});

type ServiceFormValues = ServicePayload;

type UseServiceFormProps = {
  mode: 'create' | 'edit';
  service?: ServiceItem | null;
  isOpen: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useServiceForm = ({
  mode,
  service,
  isOpen,
  onSuccess,
  onError,
}: UseServiceFormProps) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: yupResolver(serviceSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price ?? undefined,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price ?? undefined,
    });
  }, [service, reset, mode, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: ServicePayload) => {
      if (mode === 'edit' && service?._id) {
        return servicesService.updateService(service._id, payload);
      }
      return servicesService.createService(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  const submit: SubmitHandler<ServiceFormValues> = (values) => {
    mutate(values);
  };

  return {
    control,
    errors,
    handleSubmit: handleSubmit(submit),
    isSubmitting: isPending,
  };
};
