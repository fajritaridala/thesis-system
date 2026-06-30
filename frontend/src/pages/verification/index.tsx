import { ChangeEvent, useRef, useState } from 'react';
import { Alert, Button } from '@heroui/react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BaseLayout from '@/components/layouts/Base';
import { UploaderCard } from '@/components/ui/Card/Uploader';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import readCertificatePdf from '@/lib/pdfjs-dist/readCertificatePdf';

// ============ HOOK: useVerification ============
const useVerification = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPreview, setIsPreview] = useState<string>('');
  const [isQrMsg, setIsQrMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  if (!fileInputRef) {
    throw new Error('Gagal menginisialisasi input file');
  }

  async function processFile(file: File) {
    setIsLoading(true);
    setAlertOpen(false);
    try {
      const { qrMessage, previewUrl } = await readCertificatePdf(file);
      if (!qrMessage) {
        throw new Error('Sertifikat tidak memiliki kode QR verifikasi yang valid');
      }
      setIsQrMsg(qrMessage);
      setIsPreview(previewUrl);
    } catch (error) {
      const err = error as Error;
      setAlertMessage(err.message || 'Gagal memproses berkas sertifikat.');
      setAlertOpen(true);
      setIsPreview('');
      setIsQrMsg('');
    } finally {
      setIsLoading(false);
    }
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setAlertMessage('Berkas tidak dapat dimuat.');
      setAlertOpen(true);
      return;
    }
    const file = files[0];
    await processFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleFileDrop(file: File) {
    processFile(file);
  }

  const { isDragging, dragHandlers } = useDragAndDrop({
    onFileDrop: handleFileDrop,
    acceptedTypes: ['application/pdf'],
  });

  async function handleSubmit() {
    router.push(isQrMsg);
  }

  return {
    isPreview,
    alertOpen,
    setAlertOpen,
    alertMessage,
    handleSubmit,
    handleClick,
    handleFile,
    isLoading,
    isDragging,
    dragHandlers,
    fileInputRef,
  };
};

// ============ PAGE COMPONENT ============
export default function VerificationPage() {
  const router = useRouter();
  const {
    isPreview,
    alertOpen,
    setAlertOpen,
    alertMessage,
    handleClick,
    handleFile,
    handleSubmit,
    isLoading,
    isDragging,
    dragHandlers,
    fileInputRef,
  } = useVerification();

  return (
    <BaseLayout title="Verifikasi Sertifikat">
      <section className="flex justify-center bg-white py-10">
        {alertOpen && (
          <div className="fixed top-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
            <Alert
              color="danger"
              title="Gagal Memproses Berkas"
              description={alertMessage}
              isClosable
              onClose={() => setAlertOpen(false)}
              variant="faded"
              className="shadow-box border-danger-200 rounded-xl border bg-white/90 backdrop-blur-sm"
            />
          </div>
        )}
        <div className="animate-fade-bottom my-10 flex w-full flex-col gap-6 px-6 lg:max-w-6xl lg:flex-row">
          {/* Header */}
          <div className="w-full space-y-2 lg:w-1/3">
            <Button
              variant="light"
              data-hover={false}
              onPress={() => router.back()}
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
                Verifikasi Keaslian Sertifikat
              </h1>
              <p className="text-sm text-gray-500">
                Unggah sertifikat resmi SIMPEKA Anda untuk memverifikasi
                keasliannya.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-2/3 lg:pt-8">
            <UploaderCard
              handleSubmit={handleSubmit}
              fileInputRef={fileInputRef}
              handleClick={handleClick}
              handleFile={handleFile}
              isPreview={isPreview}
              loading={isLoading}
              isDragging={isDragging}
              dragHandlers={dragHandlers}
            />
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
