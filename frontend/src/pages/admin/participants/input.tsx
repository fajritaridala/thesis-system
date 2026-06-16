import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import { PenSquare } from 'lucide-react';
import DashboardLayout from '@/components/layouts/Dashboard';
import { LimitFilter } from '@/components/ui/Button/Filter';
import { Refresh } from '@/components/ui/Button/Refresh';
import { EnrollmentStatus as EnrollmentStatusChip } from '@/components/ui/Chip/EnrollmentStatus';
import { InputModal } from '@/components/ui/Modal';
import {
  ColumnConfig,
  GenericEnrollmentTable,
} from '@/components/ui/Table/Enrollments';
import usePagination from '@/hooks/usePagination';
import { storeToBlockchain } from '@/lib/blockchain/storeToBlockchain';
import { enrollmentsService } from '@/services/admin.service';
import { EnrollmentItem, EnrollmentStatus } from '@/types/admin.types';
import { formatDate } from '@/utils/common';

// ============ TYPES ============
interface SubmitScoreResponse {
  success: boolean;
  message: string;
  data?: {
    hash: string;
    cid: string;
    participantId: string;
    enrollId: string;
    scores: {
      listening: number;
      structure: number;
      reading: number;
      total: number;
    };
  };
}

// ============ ANIMATION VARIANTS ============
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// ============ HOOK: useScores ============
const useScores = () => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    enrollId: string;
    participantId: string;
    fullName: string;
    nim: string;
    scheduleId?: string;
  } | null>(null);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [blockchainStatus, setBlockchainStatus] = useState<
    | 'idle'
    | 'submitting'
    | 'uploading-ipfs'
    | 'storing-blockchain'
    | 'updating-status'
    | 'success'
    | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [pendingBlockchainData, setPendingBlockchainData] = useState<{
    hash: string;
    cid: string;
    enrollId: string;
    participantId: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const {
    currentPage,
    currentLimit,
    handleChangePage,
    handleChangeLimit,
    handleSearch,
    handleClearSearch,
  } = usePagination();

  // Fetch enrollments with fixed status = APPROVED
  const {
    data: dataEnrollments,
    isLoading: isLoadingEnrollments,
    isRefetching: isRefetchingEnrollments,
  } = useQuery({
    queryKey: ['enrollments', 'scores', currentPage, currentLimit],
    queryFn: async () => {
      const response = await enrollmentsService.getEnrollments({
        page: Number(currentPage),
        limit: Number(currentLimit),
        status: EnrollmentStatus.APPROVED,
      });
      return response.data;
    },
    enabled: !!currentPage && !!currentLimit,
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, handleSearch]);

  const participants = useMemo(() => {
    const items = (dataEnrollments?.data as EnrollmentItem[]) || [];
    return items.map((item, idx) => ({
      ...item,
      __rowKey: item.enrollId || item.participantId || `score-${idx}`,
    }));
  }, [dataEnrollments]);

  const totalPages = dataEnrollments?.pagination?.totalPages || 1;

  // Score submission mutation
  const { mutate: submitScore, isPending: isSubmittingScore } = useMutation({
    mutationFn: async ({
      enrollId,
      participantId,
      scores,
    }: {
      enrollId: string;
      participantId: string;
      scores: { listening: number; structure: number; reading: number };
    }) => {
      setBlockchainStatus('submitting');
      setStatusMessage('Mengirim nilai ke server...');

      const response = await enrollmentsService.submitScore(
        enrollId,
        participantId,
        scores
      );

      return response.data as SubmitScoreResponse;
    },
    onSuccess: async (response) => {
      if (!response.data) {
        throw new Error('Invalid response from backend');
      }

      const { hash, cid, participantId, enrollId } = response.data;

      if (!hash || !cid) {
        throw new Error('Hash or CID missing from backend response');
      }

      try {
        setBlockchainStatus('storing-blockchain');
        setStatusMessage('Menyimpan ke blockchain...');

        await storeToBlockchain({ hash, cid });

        setBlockchainStatus('updating-status');
        setStatusMessage('Memperbarui status peserta...');

        try {
          await enrollmentsService.blockchainSuccess(
            enrollId,
            participantId,
            hash
          );
        } catch (backendError) {
          const err = backendError as Error & {
            response?: { data?: { message?: string } };
          };
          alert(
            `⚠️ Blockchain berhasil, tapi update database gagal!\n\n` +
              `Error: ${err.response?.data?.message || err.message}\n` +
              `Sertifikat sudah ada di blockchain. Silakan hubungi administrator.`
          );
        }

        setBlockchainStatus('success');
        setStatusMessage('Sertifikat berhasil disimpan!');

        queryClient.invalidateQueries({ queryKey: ['enrollments'] });

        alert(
          `🎉 Sertifikat berhasil disimpan dan diverifikasi di blockchain!`
        );

        setTimeout(() => {
          setScoreModalOpen(false);
          setSelectedParticipant(null);
          setBlockchainStatus('idle');
          setStatusMessage('');
        }, 1500);
      } catch (blockchainError) {
        const err = blockchainError as Error;
        setBlockchainStatus('error');
        setStatusMessage(`Error Blockchain: ${err.message}`);

        setPendingBlockchainData({ hash, cid, enrollId, participantId });

        alert(
          `❌ Gagal menyimpan ke blockchain!\n\n` +
            `Error: ${err.message}\n` +
            `Nilai tersimpan di database, tapi gagal di blockchain.\n` +
            `Gunakan tombol "Coba Lagi" untuk mencoba kembali.`
        );
      }
    },
    onError: (error: Error) => {
      setBlockchainStatus('error');
      setStatusMessage(`Error: ${error.message}`);
      alert(`❌ Gagal mengirim nilai:\n${error.message}`);

      setTimeout(() => {
        setBlockchainStatus('idle');
        setStatusMessage('');
      }, 3000);
    },
  });

  const handleOpenScoreModal = useCallback((participant: EnrollmentItem) => {
    setSelectedParticipant({
      enrollId: participant.enrollId,
      participantId: participant.participantId,
      fullName: participant.fullName,
      nim: participant.nim,
      scheduleId: participant.scheduleId,
    });
    setScoreModalOpen(true);
  }, []);

  const handleSubmitScore = useCallback(
    (
      enrollId: string,
      participantId: string,
      scores: { listening: number; structure: number; reading: number }
    ) => {
      submitScore({ enrollId, participantId, scores });
    },
    [submitScore]
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['enrollments'] });
  }, [queryClient]);

  const handleCloseModal = useCallback(() => {
    setScoreModalOpen(false);
    setTimeout(() => {
      setSelectedParticipant(null);
      setPendingBlockchainData(null);
      setBlockchainStatus('idle');
      setStatusMessage('');
    }, 400);
  }, []);

  const handleRetryBlockchain = useCallback(async () => {
    if (!pendingBlockchainData) return;

    const { hash, cid, enrollId, participantId } = pendingBlockchainData;

    try {
      setBlockchainStatus('storing-blockchain');
      setStatusMessage('Mencoba ulang menyimpan ke blockchain...');

      await storeToBlockchain({ hash, cid });

      setBlockchainStatus('updating-status');
      setStatusMessage('Memperbarui status peserta...');

      try {
        await enrollmentsService.blockchainSuccess(
          enrollId,
          participantId,
          hash
        );
      } catch (backendError) {
        const err = backendError as Error & {
          response?: { data?: { message?: string } };
        };
        alert(
          `⚠️ Blockchain berhasil, tapi update database gagal!\n\n` +
            `Error: ${err.response?.data?.message || err.message}\n` +
            `Sertifikat sudah ada di blockchain. Silakan hubungi administrator.`
        );
      }

      setBlockchainStatus('success');
      setStatusMessage('Sertifikat berhasil disimpan!');
      setPendingBlockchainData(null);

      queryClient.invalidateQueries({ queryKey: ['enrollments'] });

      alert(`🎉 Sertifikat berhasil disimpan dan diverifikasi di blockchain!`);

      setTimeout(() => {
        setScoreModalOpen(false);
        setSelectedParticipant(null);
        setBlockchainStatus('idle');
        setStatusMessage('');
      }, 1500);
    } catch (retryError) {
      const err = retryError as Error;
      setBlockchainStatus('error');
      setStatusMessage(`Error: ${err.message}`);
    }
  }, [pendingBlockchainData, queryClient]);

  return {
    selectedParticipant,
    scoreModalOpen,
    searchInput,
    participants,
    totalPages,
    currentLimit,
    currentPage,
    isLoadingEnrollments,
    isRefetchingEnrollments,
    isSubmittingScore,
    blockchainStatus,
    statusMessage,
    setSearchInput,
    handleOpenScoreModal,
    handleSubmitScore,
    handleRefresh,
    handleCloseModal,
    handleRetryBlockchain,
    handleChangeLimit,
    handleChangePage,
    handleClearSearch,
  };
};

// ============ PAGE COMPONENT ============
export default function AdminParticipantsInput() {
  const {
    selectedParticipant,
    scoreModalOpen,
    searchInput,
    participants,
    totalPages,
    currentLimit,
    currentPage,
    isLoadingEnrollments,
    isRefetchingEnrollments,
    isSubmittingScore,
    blockchainStatus,
    statusMessage,
    setSearchInput,
    handleOpenScoreModal,
    handleSubmitScore,
    handleRefresh,
    handleCloseModal,
    handleRetryBlockchain,
    handleChangeLimit,
    handleChangePage,
    handleClearSearch,
  } = useScores();

  const columns: ColumnConfig[] = [
    { uid: 'fullName', name: 'Nama Lengkap', align: 'start' },
    { uid: 'nim', name: 'NIM', align: 'center' },
    { uid: 'serviceName', name: 'Layanan', align: 'center' },
    {
      uid: 'scheduleDate',
      name: 'Jadwal',
      align: 'center',
      render: (item) => (
        <p className="text-center text-sm text-gray-700">
          {formatDate(item.scheduleDate)}
        </p>
      ),
    },
    {
      uid: 'status',
      name: 'Status',
      align: 'center',
      render: (item) => <EnrollmentStatusChip status={item.status} />,
    },
    {
      uid: 'actions',
      name: 'Actions',
      align: 'center',
      render: (item) => (
        <div className="text-center">
          <button
            onClick={() => handleOpenScoreModal(item)}
            className="hover:shadow-box inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100"
          >
            <PenSquare className="h-3.5 w-3.5" />
            Input Nilai
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Input Nilai Peserta"
      description="Masukkan hasil tes dan terbitkan sertifikat."
    >
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-4"
      >
        <GenericEnrollmentTable
          data={participants}
          isLoading={isLoadingEnrollments}
          isRefetching={isRefetchingEnrollments}
          columns={columns}
          search={{
            value: searchInput,
            onChange: setSearchInput,
            onClear: handleClearSearch,
          }}
          filterContent={
            <>
              <LimitFilter
                value={String(currentLimit)}
                onChange={handleChangeLimit}
              />
              <Refresh
                isRefetching={isRefetchingEnrollments}
                onRefresh={handleRefresh}
              />
            </>
          }
          pagination={{
            page: Number(currentPage),
            total: totalPages,
            onChange: handleChangePage,
          }}
          emptyContent={
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <PenSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900">
                Tidak ada peserta yang disetujui
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Belum ada peserta untuk input nilai
              </p>
            </div>
          }
        />

        <InputModal
          isOpen={scoreModalOpen}
          onClose={handleCloseModal}
          participant={selectedParticipant}
          onSubmit={handleSubmitScore}
          isSubmitting={isSubmittingScore}
          blockchainStatus={blockchainStatus}
          statusMessage={statusMessage}
          onRetry={handleRetryBlockchain}
        />
      </motion.section>
    </DashboardLayout>
  );
}
