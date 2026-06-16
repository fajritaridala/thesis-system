import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
} from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import AuthLayout from '@/components/layouts/Auth';
import { AuthCard } from '@/components/ui/Card/Auth';
import metamask from '@/lib/metamask/metamask';
import authServices from '@/services/auth.service';
import { IRegister } from '@/types/auth.types';
import randomize from '@/utils/config/randomize';

// ============ VALIDATION SCHEMA ============
const registerSchema = Yup.object().shape({
  username: Yup.string()
    .required('Nama Pengguna wajib diisi')
    .min(3, 'Nama Pengguna minimal 3 karakter')
    .max(50, 'Nama Pengguna maksimal 50 karakter')
    .matches(
      /^[a-zA-Z0-9\s._]+$/,
      'Nama Pengguna hanya boleh mengandung huruf, angka, spasi, titik, dan underscore'
    ),
  email: Yup.string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),
  roleToken: Yup.string().optional(),
});

// ============ HOOK: useRegister ============
function useRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAddress, setIsAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const addressQuery = router.query.address as string;

  useEffect(() => {
    const handleDecrypt = async () => {
      if (addressQuery && !isAddress) {
        try {
          const decodedQuery = decodeURIComponent(addressQuery);
          const decrypted = await randomize.decrypt(decodedQuery);

          if (decrypted) {
            setIsAddress(decrypted);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Gagal mendekripsi alamat:', error);
          setAlertOpen(true);
          setAlertMessage('Tautan registrasi tidak valid atau kadaluarsa.');
        }
      }
    };

    if (router.isReady) {
      handleDecrypt();
    }
  }, [addressQuery, router.isReady, isAddress]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      roleToken: '',
    },
  });

  async function registerService(payload: IRegister) {
    try {
      const result = await authServices.register(payload);
      if (!result) {
        throw new Error('Tidak ada respons dari server.');
      }
      return result;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message || err.message || 'Registrasi gagal';
      throw new Error(errorMessage);
    }
  }

  const { mutate: mutateRegister } = useMutation({
    mutationFn: registerService,
    async onSuccess(result) {
      const role = result?.data?.data?.role;
      try {
        const signInResult = await signIn('credentials', {
          address: isAddress,
          redirect: false,
        });

        if (signInResult?.ok) {
          if (role === 'admin') {
            await router.push('/admin/dashboard');
          } else {
            await router.push('/');
          }
          reset();
        } else {
          await router.push('/auth/login');
        }
      } catch {
        await router.push('/auth/login');
      }
    },
    onError(error) {
      setIsLoading(false);
      setAlertOpen(true);
      setAlertMessage(error.message);
    },
  });

  async function connectMetamask() {
    try {
      setIsLoading(true);
      const { address } = await metamask.switchWallet();
      if (address) {
        setIsConnected(true);
        setIsAddress(address);
        setAlertOpen(false);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      const err = error as Error;
      setAlertOpen(true);
      setAlertMessage(err.message);
    }
  }

  function handleRegister(data: Omit<IRegister, 'address'>) {
    if (!isAddress) {
      setAlertOpen(true);
      setAlertMessage(
        'Alamat dompet tidak terdeteksi. Silakan hubungkan ulang MetaMask.'
      );
      return;
    }

    setIsLoading(true);
    const payload = {
      address: isAddress,
      username: data.username,
      email: data.email,
      roleToken: data.roleToken || '',
    };

    mutateRegister(payload);
  }

  return {
    connectMetamask,
    handleRegister,
    handleSubmit,
    control,
    alertOpen,
    setAlertOpen,
    alertMessage,
    isLoading,
    isConnected,
    errors,
  };
}

// ============ PAGE COMPONENT ============
export default function RegisterPage() {
  const router = useRouter();
  const {
    connectMetamask,
    handleRegister,
    handleSubmit,
    control,
    alertOpen,
    setAlertOpen,
    alertMessage,
    isLoading,
    isConnected,
    errors,
  } = useRegister();

  return (
    <AuthLayout title="Register - Simpeka">
      {alertOpen && (
        <div className="fixed top-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
          <Alert
            color="danger"
            title="Registrasi Gagal"
            description={alertMessage}
            isClosable
            onClose={() => setAlertOpen(false)}
            variant="faded"
            className="shadow-box border-danger-200 rounded-xl border bg-white/90 backdrop-blur-sm"
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
      >
        {!isConnected ? (
          <div className="w-full max-w-md">
            <Button
              variant="light"
              data-hover={false}
              onPress={() => router.back()}
              className="text-secondary hover:text-secondary/60 group mb-6 -ml-3 w-fit p-0"
              startContent={
                <ArrowLeft
                  size={18}
                  className="transform duration-300 group-hover:-translate-x-1"
                />
              }
            >
              Kembali
            </Button>
            <AuthCard
              heading="Daftar"
              buttonLabel="Hubungkan MetaMask"
              isLoading={isLoading}
              handleOnPress={connectMetamask}
            />
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <Button
              variant="light"
              data-hover={false}
              onPress={() => router.back()}
              className="text-secondary hover:text-secondary/60 group mb-6 -ml-3 w-fit p-0"
              startContent={
                <ArrowLeft
                  size={18}
                  className="transform duration-300 group-hover:-translate-x-1"
                />
              }
            >
              Kembali
            </Button>
            <Card className="border-border shadow-main w-full rounded-2xl border bg-white p-6 md:p-8">
              <CardHeader className="flex-col items-start px-4 pt-2 pb-0">
                <h1 className="text-text text-3xl font-bold tracking-tight">
                  Buat Akun
                </h1>
                <p className="text-text-muted mt-2 text-sm">
                  Silakan isi detail Anda untuk melanjutkan.
                </p>
              </CardHeader>
              <CardBody className="overflow-visible py-6">
                <Form
                  onSubmit={handleSubmit(handleRegister)}
                  className="flex flex-col gap-6"
                >
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        label="Nama Pengguna"
                        labelPlacement="outside"
                        placeholder="Masukan nama pengguna Anda"
                        type="text"
                        variant="bordered"
                        color={errors.username ? 'danger' : 'default'}
                        validationBehavior="aria"
                        classNames={{
                          inputWrapper:
                            'border-border shadow-none hover:border-primary/50 focus-within:!border-primary rounded-lg transition-colors',
                          label: 'text-text-muted font-medium mb-1',
                        }}
                        isInvalid={!!errors.username}
                        errorMessage={errors.username?.message}
                      />
                    )}
                  />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        isRequired
                        label="Email"
                        labelPlacement="outside"
                        placeholder="nama@contoh.com"
                        type="email"
                        variant="bordered"
                        color={errors.email ? 'danger' : 'default'}
                        validationBehavior="aria"
                        classNames={{
                          inputWrapper:
                            'border-border shadow-none hover:border-primary/50 focus-within:!border-primary rounded-lg transition-colors',
                          label: 'text-text-muted font-medium mb-1',
                        }}
                        isInvalid={!!errors.email}
                        errorMessage={errors.email?.message}
                      />
                    )}
                  />
                  <Controller
                    name="roleToken"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Token Peran"
                        labelPlacement="outside"
                        placeholder="Opsional"
                        type="text"
                        variant="bordered"
                        color={errors.roleToken ? 'danger' : 'default'}
                        validationBehavior="aria"
                        classNames={{
                          inputWrapper:
                            'border-border shadow-none hover:border-primary/50 focus-within:!border-primary rounded-lg transition-colors',
                          label: 'text-text-muted font-medium mb-1',
                        }}
                        isInvalid={!!errors.roleToken}
                        errorMessage={errors.roleToken?.message}
                      />
                    )}
                  />

                  <Button
                    color="primary"
                    type="submit"
                    size="lg"
                    className="bg-primary shadow-primary/20 hover:shadow-primary/30 mt-4 w-full rounded-full font-bold text-white shadow-lg transition-all duration-100 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Membuat Akun...' : 'Daftar'}
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </div>
        )}
      </motion.div>
    </AuthLayout>
  );
}
