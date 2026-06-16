import {
  Button,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { Download } from 'lucide-react';
import { EnrollmentStatus as EnrollmentStatusChip } from '@/components/ui/Chip/EnrollmentStatus';
import { EnrollmentItem, EnrollmentStatus } from '@/types/admin.types';
import { formatDate } from '@/utils/common';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  participant: EnrollmentItem | null;
  /** Optional external handler for approve */
  onApprove?: (id: string) => void;
  /** Optional external handler for reject */
  onReject?: (id: string) => void;
  /** Optional loading state for external handlers */
  isProcessing?: boolean;
};

export function DetailModal({
  isOpen,
  onClose,
  participant,
  onApprove,
  onReject,
  isProcessing = false,
}: Props) {
  if (!participant) return null;

  const isPending = participant.status === EnrollmentStatus.PENDING;

  // Use isProcessing or just simple action if provided
  const hasActions = !!onApprove && !!onReject;

  // We need to track which action is loading, but since this is dump component,
  // we rely on parent to tell us "isProcessing".
  // Refinement: parent just says "isProcessing". We don't distinguish which button
  // caused it here unless we add more props. For simplicity, we disable both.

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Detail Pendaftaran</h2>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-500">
                <span>ID: {participant.enrollId}</span>
                <EnrollmentStatusChip status={participant.status} />
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Data Peserta */}
                <div className="space-y-4">
                  <h3 className="border-b pb-2 font-semibold text-gray-900">
                    Informasi Peserta
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Nama Lengkap</p>
                      <p className="font-medium">{participant.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">NIM</p>
                      <p className="font-medium">{participant.nim}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Program Studi</p>
                      <p className="font-medium">{participant.major || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fakultas</p>
                      <p className="font-medium">
                        {participant.faculty || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{participant.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">No. WhatsApp</p>
                      <p className="font-medium">
                        {participant.phoneNumber || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Layanan */}
                <div className="space-y-4">
                  <h3 className="border-b pb-2 font-semibold text-gray-900">
                    Informasi Layanan
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Jenis Layanan</p>
                      <p className="font-medium">{participant.serviceName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Jadwal Tes</p>
                      <p className="font-medium">
                        {formatDate(participant.scheduleDate || '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tanggal Daftar</p>
                      <p className="font-medium">
                        {formatDate(participant.registerAt || '')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bukti Pembayaran */}
              <div className="mt-6 space-y-4">
                <h3 className="border-b pb-2 font-semibold text-gray-900">
                  Bukti Pembayaran
                </h3>
                {participant.paymentProof ? (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm text-gray-500">Preview Gambar</p>
                      <Button
                        as={Link}
                        href={participant.paymentProof}
                        isExternal
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<Download size={14} />}
                      >
                        Unduh
                      </Button>
                    </div>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={participant.paymentProof}
                        alt="Bukti Pembayaran"
                        className="object-contain"
                        classNames={{
                          wrapper: 'w-full h-full',
                          img: 'w-full h-full',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
                    <p className="text-gray-500">Tidak ada bukti pembayaran</p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Tutup
              </Button>
              {isPending && hasActions && (
                <>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => onReject && onReject(participant.enrollId)}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                  >
                    Tolak
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => onApprove && onApprove(participant.enrollId)}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                  >
                    Setujui
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
