import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardFooter, Skeleton } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';
import BaseLayout from '@/components/layouts/Base';
import { getRecordFromBlockchain } from '@/lib/blockchain/storeToBlockchain';
import { generateCertificate } from '@/lib/jspdf/generateCertificate';
import certificateService from '@/services/certificate.service';
import { CertificatePayload } from '@/types/certificate.types';
import { CERTIFICATE_LINK } from '@/utils/config/env';

// ============ ANIMATION VARIANTS ============
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// ============ HOOK: useCertificate ============
const useCertificate = () => {
  const router = useRouter();
  const { hash: queryHash } = router.query;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const hash = queryHash as string | undefined;

  const {
    data: cid,
    isLoading: isLoadingCid,
    error: cidError,
  } = useQuery({
    queryKey: ['certificateCid', hash],
    queryFn: () => getRecordFromBlockchain(hash!),
    enabled: !!hash,
    retry: 1,
  });

  const {
    data: certificateData,
    isLoading: isLoadingIpfs,
    error: ipfsError,
  } = useQuery({
    queryKey: ['certificateIpfs', cid],
    queryFn: () => certificateService.getDataFromIpfs(cid!),
    enabled: !!cid,
    retry: 1,
  });
  console.log(certificateData);

  const url = `${CERTIFICATE_LINK}?hash=${hash}`;

  useEffect(() => {
    const init = async () => {
      if (!hash || !certificateData) return;

      try {
        setIsGenerating(true);

        const qrUrl = await QRCode.toDataURL(url);
        setQrCodeUrl(qrUrl);

        const payload = certificateData?.content;
        const doc = await generateCertificate(payload, qrUrl);
        const blobUrl = doc.output('bloburl');
        setPdfBlobUrl(blobUrl.toString());
      } catch (err) {
        console.error('Failed to generate certificate preview', err);
      } finally {
        setIsGenerating(false);
      }
    };

    init();

    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, certificateData]);

  const handleDownload = async () => {
    if (!qrCodeUrl || !certificateData) return;
    try {
      const payload = certificateData.content as CertificatePayload;
      const doc = await generateCertificate(payload, qrCodeUrl);
      doc.save(`Sertifikat-${payload.fullName}.pdf`);
    } catch (error) {
      console.error('Gagal download PDF:', error);
    }
  };

  const isLoading = isLoadingCid || isLoadingIpfs || isGenerating;
  const error = cidError || ipfsError;

  return {
    certificateData: certificateData as CertificatePayload | undefined,
    isLoading,
    error,
    qrCodeUrl,
    pdfBlobUrl,
    handleDownload,
    hash,
    cid,
  };
};

// ============ PAGE COMPONENT ============
export default function CertificatePage() {
  const router = useRouter();
  const { isLoading, error, pdfBlobUrl, handleDownload } = useCertificate();

  const showSkeleton = isLoading || error || !pdfBlobUrl;

  return (
    <BaseLayout title="Sertifikat">
      <div className="bg-bg-light min-h-screen pt-24 pb-12">
        <main className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-8"
          >
            {/* Left Column: Header & Description */}
            <div className="flex flex-col items-start lg:w-1/3">
              <Button
                variant="light"
                className="text-secondary hover:text-secondary/80 group -ml-3 h-auto p-2 font-medium data-[hover=true]:bg-transparent"
                startContent={
                  <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                }
                onPress={() => router.back()}
                disableRipple
              >
                Kembali
              </Button>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-black">
                  Sertifikat Hasil Tes
                </h1>
                <p className="text-text-muted">
                  {showSkeleton
                    ? 'Sedang memproses dokumen sertifikat Anda...'
                    : 'Berikut adalah pratinjau sertifikat resmi SIMPEKA Anda. Silakan unduh file PDF untuk keperluan administratif.'}
                </p>
              </div>
            </div>

            {/* Right Column: Certificate Card */}
            <div className="w-full lg:w-2/3 lg:pt-8">
              <Card
                className="shadow-neo w-full border border-gray-200"
                radius="lg"
              >
                <CardBody className="overflow-hidden bg-white p-0">
                  <div className="w-full">
                    {/* Aspect Ratio A4 Landscape */}
                    <div
                      className="relative mx-auto w-full bg-gray-50"
                      style={{ aspectRatio: '1.414/1' }}
                    >
                      {showSkeleton ? (
                        <Skeleton className="h-full w-full" />
                      ) : (
                        <iframe
                          src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="h-full w-full border-0"
                          title="Certificate Preview"
                        />
                      )}
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="border-border justify-end gap-3 border-t bg-white p-6">
                  {showSkeleton ? (
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                  ) : (
                    <Button
                      color="primary"
                      size="lg"
                      radius="full"
                      className="font-semibold shadow-md"
                      startContent={<Download size={20} />}
                      onPress={handleDownload}
                    >
                      Unduh PDF
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </BaseLayout>
  );
}
