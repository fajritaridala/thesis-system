import { ChangeEvent, useRef, useState } from 'react';
import { Button } from '@heroui/react';
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

  if (!fileInputRef) {
    throw new Error('Gagal menginisialisasi input file');
  }

  async function processFile(file: File) {
    setIsLoading(true);
    try {
      const { qrMessage, previewUrl } = await readCertificatePdf(file);
      setIsQrMsg(qrMessage);
      setIsPreview(previewUrl);
    } catch {
      throw new Error('Error processing file');
    } finally {
      setIsLoading(false);
    }
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) {
      throw new Error('file tidak dapat dimuat');
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
