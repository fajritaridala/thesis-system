import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import { Check, Eye, X } from 'lucide-react';
import DashboardLayout from '@/components/layouts/Dashboard';
import { LimitFilter } from '@/components/ui/Button/Filter';
import { Refresh } from '@/components/ui/Button/Refresh';
import { DetailModal } from '@/components/ui/Modal';
import {
  ColumnConfig,
  GenericEnrollmentTable,
} from '@/components/ui/Table/Enrollments';
import usePagination from '@/hooks/usePagination';
import { enrollmentsService } from '@/services/admin.service';
import { EnrollmentItem, EnrollmentStatus } from '@/types/admin.types';
import { formatDate } from '@/utils/common';

// ============ ANIMATION VARIANTS ============
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// ============ HOOK: useValidation ============
const useValidation = () => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  const queryClient = useQueryClient();

  const {
    currentPage,
    currentLimit,
    handleChangePage,
    handleChangeLimit,
    handleSearch,
    handleClearSearch,
  } = usePagination();

  // Fetch enrollments with fixed status = PENDING
  const {
    data: dataEnrollments,
    isLoading: isLoadingEnrollments,
    isRefetching: isRefetchingEnrollments,
  } = useQuery({
    queryKey: ['enrollments', 'validation', currentPage, currentLimit],
    queryFn: async () => {
      const response = await enrollmentsService.getEnrollments({
        page: Number(currentPage),
        limit: Number(currentLimit),
        status: EnrollmentStatus.PENDING,
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
      __rowKey: item.enrollId || item.participantId || `enrollment-${idx}`,
    }));
  }, [dataEnrollments]);

  const totalPages = dataEnrollments?.pagination?.totalPages || 1;

  // Mutations
  const { mutate: approveParticipant, isPending: isApproving } = useMutation({
    mutationFn: async (id: string) => {
      const response = await enrollmentsService.approve(id, 'disetujui');
      return response;
    },
    onSuccess: () => {
      setPreviewModalOpen(false);
      setDetailModalOpen(false);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      }, 450);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      alert(
        `Gagal menyetujui peserta: ${error?.response?.data?.message || error.message}`
      );
    },
  });

  const { mutate: rejectParticipant, isPending: isRejecting } = useMutation({
    mutationFn: async (id: string) => {
      const response = await enrollmentsService.approve(id, 'ditolak');
      return response;
    },
    onSuccess: () => {
      setPreviewModalOpen(false);
      setDetailModalOpen(false);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      }, 450);
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      alert(
        `Gagal menolak peserta: ${error?.response?.data?.message || error.message}`
      );
    },
  });

  const handleOpenPreview = useCallback((index: number) => {
    setCurrentPreviewIndex(index);
    setPreviewModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['enrollments'] });
  }, [queryClient]);

  const handleClosePreview = useCallback(() => {
    setPreviewModalOpen(false);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailModalOpen(false);
    setPreviewModalOpen(true);
  }, []);

  const isProcessing = isApproving || isRejecting;
  const currentParticipant = participants[currentPreviewIndex];

  return {
    previewModalOpen,
    detailModalOpen,
    searchInput,
    participants,
    currentParticipant,
    totalPages,
    currentLimit,
    currentPage,
    isLoadingEnrollments,
    isRefetchingEnrollments,
    isProcessing,
    setSearchInput,
    handleOpenPreview,
    handleRefresh,
    handleClosePreview,
    handleCloseDetail,
    handleChangeLimit,
    handleChangePage,
    handleClearSearch,
    approveParticipant,
    rejectParticipant,
  };
};

// ============ PAGE COMPONENT ============
export default function AdminParticipantsValidation() {
  const {
    previewModalOpen,
    detailModalOpen,
    searchInput,
    participants,
    currentParticipant,
    totalPages,
    currentLimit,
    currentPage,
    isLoadingEnrollments,
    isRefetchingEnrollments,
    isProcessing,
    setSearchInput,
    handleOpenPreview,
    handleRefresh,
    handleClosePreview,
    handleCloseDetail,
    handleChangeLimit,
    handleChangePage,
    handleClearSearch,
    approveParticipant,
    rejectParticipant,
  } = useValidation();

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
      uid: 'paymentProof',
      name: 'Bukti Bayar',
      align: 'center',
      render: (item) => (
        <div className="flex justify-center-safe">
          <button
            onClick={() => {
              const index = participants.findIndex(
                (p) => p.enrollId === item.enrollId
              );
              handleOpenPreview(index >= 0 ? index : 0);
            }}
            className="border-info text-info hover:shadow-box inline-flex items-center gap-1.5 rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            Lihat Bukti
          </button>
        </div>
      ),
    },
    {
      uid: 'actions',
      name: 'Actions',
      align: 'center',
      render: (item) => (
        <div className="flex w-full items-center justify-center-safe gap-2">
          <button
            onClick={() => approveParticipant(item.enrollId)}
            disabled={isProcessing}
            title="Approve"
            className="border-success text-success hover:shadow-box inline-flex items-center gap-1.5 rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => rejectParticipant(item.enrollId)}
            disabled={isProcessing}
            title="Reject"
            className="border-danger text-danger hover:shadow-box inline-flex items-center gap-1.5 rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Validasi Pendaftaran"
      description="Verifikasi bukti pembayaran dan berkas peserta."
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
                <Check className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-900">
                Tidak ada peserta menunggu validasi
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Semua peserta sudah diproses
              </p>
            </div>
          }
        />

        {currentParticipant && (
          <DetailModal
            isOpen={previewModalOpen || detailModalOpen}
            onClose={() => {
              if (previewModalOpen) handleClosePreview();
              if (detailModalOpen) handleCloseDetail();
            }}
            participant={currentParticipant}
            onApprove={(id) => approveParticipant(id)}
            onReject={(id) => rejectParticipant(id)}
            isProcessing={isProcessing}
          />
        )}
      </motion.section>
    </DashboardLayout>
  );
}
