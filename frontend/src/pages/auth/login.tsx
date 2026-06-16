import { useState } from 'react';
import { Alert, Button } from '@heroui/react';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import AuthLayout from '@/components/layouts/Auth';
import { AuthCard } from '@/components/ui/Card/Auth';
import metamask from '@/lib/metamask/metamask';
import randomize from '@/utils/config/randomize';

// ============ VALIDATION SCHEMA ============
const loginSchema = Yup.object().shape({
  address: Yup.string()
    .required('Alamat dompet diperlukan')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Format alamat Ethereum tidak valid'),
});

// ============ HOOK: useLogin ============
const useLogin = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [address, setAddress] = useState('');

  const callbackUrl = (router.query.callbackUrl as string) ?? '/';

  const loginService = async (address: string) => {
    const result = await signIn('credentials', {
      address,
      redirect: false,
      callbackUrl,
    });

    if (!result) {
      throw new Error('Tidak ada respons dari layanan masuk.');
    }

    if (!result.ok) {
      if (result.error === 'CredentialsSignin') {
        throw new Error(
          'Gagal Masuk: Akun tidak ditemukan atau terjadi kesalahan pada server.'
        );
      }
      throw new Error(
        result.error ||
          'Login gagal! Mohon periksa kembali koneksi atau kredensial Anda.'
      );
    }

    return result;
  };

  const { mutate: mutateLogin } = useMutation({
    mutationFn: loginService,
    async onSuccess() {
      async function waitForSession(maxTries = 5, delayMs = 200) {
        for (let attempt = 0; attempt < maxTries; attempt++) {
          const session = await getSession();
          if (session?.user) return session;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        return await getSession();
      }

      const session = await waitForSession();
      const user = session?.user as
        | {
            address?: string;
            needsRegistration?: boolean;
            role?: string;
          }
        | undefined;

      if (user?.needsRegistration && user.address) {
        const encryptedAddress = await randomize.encrypt(user.address);
        await router.push(
          `/auth/register?address=${encodeURIComponent(encryptedAddress)}`
        );
        return;
      }

      switch (user?.role) {
        case 'admin':
          await router.push('/admin/dashboard');
          break;
        case 'peserta':
          await router.push('/');
          break;
        default:
          await router.push('/');
          break;
      }
    },
    onError(error) {
      setIsLoading(false);
      setAlertOpen(true);
      const err = error as Error;
      setAlertMessage(err.message || 'Terjadi kesalahan yang tidak terduga');
    },
  });

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setAlertOpen(false);
      const { address } = await metamask.switchWallet();
      setAddress(address);
      await loginSchema.validate({ address });
      mutateLogin(address);
    } catch (error) {
      setIsLoading(false);
      const err = error as Error;
      setAlertOpen(true);
      setAlertMessage(err.message);
    }
  };

  return {
    handleLogin,
    alertOpen,
    setAlertOpen,
    alertMessage,
    isLoading,
    address,
  };
};

// ============ PAGE COMPONENT ============
export default function LoginPage() {
  const router = useRouter();
  const { isLoading, alertOpen, setAlertOpen, alertMessage, handleLogin } =
    useLogin();

  return (
    <AuthLayout title="Login - Simpeka">
      {alertOpen && (
        <div className="fixed top-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
          <Alert
            color="danger"
            title="Gagal Masuk"
            description={alertMessage}
            isClosable
            onClose={() => setAlertOpen(false)}
            variant="faded"
            className="shadow-box border-danger-200 rounded-xl border bg-white/90 backdrop-blur-sm"
          />
        </div>
      )}
      <div className="w-lg">
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
          heading="Masuk"
          buttonLabel="Hubungkan MetaMask"
          isLoading={isLoading}
          handleOnPress={handleLogin}
        />
      </div>
    </AuthLayout>
  );
}
