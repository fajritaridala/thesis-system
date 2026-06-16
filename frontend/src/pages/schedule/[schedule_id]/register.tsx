'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { Alert, Button } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import * as yup from 'yup';
import BaseLayout from '@/components/layouts/Base';
import { ScheduleRegisterForm } from '@/components/ui/Card/ScheduleRegister';
import { enrollmentsService } from '@/services/admin.service';
import { Gender, ScheduleRegister } from '@/types/admin.types';

export const dynamic = 'force-dynamic';

// ============ VALIDATION SCHEMA ============
const scheduleRegisterSchema = yup.object().shape({
  fullName: yup.string().required('Nama lengkap wajib diisi'),
  birthDate: yup.string().required('Tanggal lahir wajib diisi'),
  gender: yup
    .mixed<Gender>()
    .oneOf(Object.values(Gender), 'Jenis kelamin tidak valid')
    .required('Jenis kelamin wajib diisi'),
  email: yup.string().email('Email tidak valid').required('Email wajib diisi'),
  phoneNumber: yup
    .number()
    .typeError('Nomor telepon harus berupa angka')
    .required('Nomor telepon wajib diisi'),
  nim: yup.string().required('NIM wajib diisi'),
  faculty: yup.string().required('Fakultas wajib diisi'),
  major: yup.string().required('Program studi wajib diisi'),
  paymentDate: yup.string().required('Tanggal pembayaran wajib diisi'),
  paymentProof: yup
    .mixed<File>()
    .nullable()
    .defined()
    .test(
      'fileRequired',
      'Bukti pembayaran wajib diunggah',
      (value) => value instanceof File
    ),
});

// ============ HOOK: useScheduleRegister ============
function useScheduleRegister() {
  const router = useRouter();
  const params = useParams<{ schedule_id?: string }>();
  const schedule_id = params?.schedule_id ?? '';

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'danger';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ScheduleRegister>({
    resolver: yupResolver(scheduleRegisterSchema),
    defaultValues: {
      fullName: '',
      birthDate: '',
      gender: undefined,
      email: '',
      phoneNumber: undefined as number | undefined,
      nim: '',
      faculty: '',
      major: '',
      paymentDate: '',
      paymentProof: null,
    },
  });

  const paymentReceipt = watch('paymentProof');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setValue('paymentProof', e.target.files[0], { shouldValidate: true });
    }
  };

  const handleFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleGoBack = () => {
    router.back();
  };

  const { mutate: registerMutate } = useMutation({
    mutationFn: (payload: ScheduleRegister) =>
      enrollmentsService.register(schedule_id, payload),
    onSuccess: () => {
      setIsLoading(false);
      setAlert({
        isOpen: true,
        message: 'Pendaftaran berhasil! Anda akan dialihkan.',
        type: 'success',
      });
      reset();
      setTimeout(() => {
        router.push('/?success_registration=true');
      }, 2000);
    },
    onError: (
      error: Error & { response?: { data?: { meta?: { message?: string } } } }
    ) => {
      setIsLoading(false);
      const errorMessage =
        error.response?.data?.meta?.message || error.message || '';

      const isDuplicateRegistration =
        errorMessage.toLowerCase().includes('already registered') ||
        errorMessage.toLowerCase().includes('sudah terdaftar') ||
        errorMessage.toLowerCase().includes('schedule') ||
        errorMessage.toLowerCase().includes('duplicate');

      setAlert({
        isOpen: true,
        message: isDuplicateRegistration
          ? 'Anda telah terdaftar pada jadwal ini sebelumnya.'
          : errorMessage || 'Pendaftaran gagal. Silakan coba lagi.',
        type: 'danger',
      });
    },
  });

  const handleRegister = (data: ScheduleRegister) => {
    setIsLoading(true);
    setAlert(null);
    registerMutate(data);
  };

  const onError = (errors: FieldErrors<ScheduleRegister>) => {
    console.error('Form Errors:', errors);
  };

  return {
    control,
    errors,
    isLoading,
    alert,
    setAlert,
    handleSubmit,
    handleRegister,
    onError,
    handleGoBack,
    fileInputRef,
    paymentReceipt,
    handleFileChange,
    handleFilePicker,
  };
}

// ============ PAGE COMPONENT ============
export default function RegisterSchedulePage() {
  const {
    control,
    errors,
    isLoading,
    handleSubmit: handleSubmitAction,
    handleRegister: handleRegisterAction,
    onError: onErrorAction,
    handleGoBack,
    fileInputRef,
    paymentReceipt,
    handleFileChange,
    handleFilePicker,
    alert,
    setAlert,
  } = useScheduleRegister();

  return (
    <>
      <Head>
        <title>Daftar Jadwal - Simpeka</title>
      </Head>
      <BaseLayout title="Daftar Jadwal">
        <section className="flex min-h-screen justify-center bg-white py-10">
          {alert?.isOpen && (
            <div className="fixed top-18 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
              <Alert
                color={alert.type}
                title={
                  alert.type === 'success' ? 'Berhasil' : 'Pendaftaran Gagal'
                }
                description={alert.message}
                isClosable
                onClose={() => setAlert(null)}
                variant="faded"
                className={`shadow-box rounded-xl border bg-white/90 backdrop-blur-sm ${
                  alert.type === 'success'
                    ? 'border-success-200'
                    : 'border-danger-200'
                }`}
              />
            </div>
          )}
          <div className="animate-fade-bottom my-10 flex w-full flex-col gap-6 px-6 lg:max-w-6xl lg:flex-row">
            <div className="w-full space-y-2 lg:w-1/3">
              <Button
                variant="light"
                data-hover={false}
                onPress={handleGoBack}
                className="text-secondary hover:text-secondary/60 group -ml-3 w-fit p-0"
                startContent={
                  <ArrowLeft
                    size={18}
                    className="transform duration-300 group-hover:-translate-x-1"
                  />
                }
              >
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-extrabold text-black">
                  Formulir Pendaftaran Jadwal
                </h1>
                <p className="text-sm text-gray-500">
                  Lengkapi data di bawah ini untuk menyelesaikan pendaftaran
                  Anda.
                </p>
              </div>
            </div>

            <div className="w-full lg:w-2/3 lg:scale-95 lg:pt-8">
              <ScheduleRegisterForm
                control={control}
                errors={errors}
                isLoading={isLoading}
                handleSubmitAction={handleSubmitAction}
                handleRegisterAction={handleRegisterAction}
                onErrorAction={onErrorAction}
                fileInputRef={fileInputRef}
                paymentReceipt={paymentReceipt}
                handleFileChangeAction={handleFileChange}
                handleFilePickerAction={handleFilePicker}
              />
            </div>
          </div>
        </section>
      </BaseLayout>
    </>
  );
}
