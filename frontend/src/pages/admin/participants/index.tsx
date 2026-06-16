import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@heroui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import DashboardLayout from '@/components/layouts/Dashboard';
import {
  LimitFilter,
  ScheduleFilter,
  ServiceFilter,
  StatusFilter,
} from '@/components/ui/Button/Filter';
import { Refresh } from '@/components/ui/Button/Refresh';
import { EnrollmentStatus } from '@/components/ui/Chip/EnrollmentStatus';
import { DetailModal } from '@/components/ui/Modal';
import {
  ColumnConfig,
  GenericEnrollmentTable,
} from '@/components/ui/Table/Enrollments';
import { FILTER_OPTIONS } from '@/constants/list.constants';
import usePagination from '@/hooks/usePagination';
import {
  enrollmentsService,
  schedulesService,
  servicesService,
} from '@/services/admin.service';
import { EnrollmentItem } from '@/types/admin.types';
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

// ============ HOOK: useParticipants ============
const useParticipants = () => {
  const {
    currentPage,
    currentLimit,
    currentSearch,
    getParam,
    setParams,
    handleChangePage,
    handleChangeLimit,
    handleSearch,
    handleClearSearch,
  } = usePagination();

  const currentStatus = getParam('status') || 'all';
  const currentServiceId = getParam('serviceId') || 'all';
  const currentScheduleId = getParam('scheduleId') || 'all';

  const normalizedStatus =
    currentStatus !== 'all'
      ? (currentStatus as EnrollmentItem['status'])
      : undefined;
  const normalizedServiceId =
    currentServiceId !== 'all' ? currentServiceId : undefined;
  const normalizedScheduleId =
    currentScheduleId !== 'all' ? currentScheduleId : undefined;

  const {
    data: dataEnrollments,
    isLoading: isLoadingEnrollments,
    isRefetching: isRefetchingEnrollments,
  } = useQuery({
    queryKey: [
      'enrollments',
      currentPage,
      currentLimit,
      currentSearch,
      normalizedStatus,
      normalizedServiceId,
      normalizedScheduleId,
    ],
    queryFn: async () => {
      const response = await enrollmentsService.getEnrollments({
        page: Number(currentPage),
        limit: Number(currentLimit),
        search: currentSearch || undefined,
        status: normalizedStatus,
        serviceId: normalizedServiceId,
        scheduleId: normalizedScheduleId,
      });
      return response.data;
    },
    enabled: !!currentPage && !!currentLimit,
  });

  const [statusFilter, setStatusFilter] = useState<string>(
    currentStatus ?? 'all'
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<EnrollmentItem | null>(null);

  useEffect(() => {
    setStatusFilter(currentStatus ?? 'all');
  }, [currentStatus]);

  const tableData = useMemo(
    () => (dataEnrollments?.data as EnrollmentItem[]) || [],
    [dataEnrollments]
  );

  const totalPages = dataEnrollments?.pagination?.totalPages || 1;
  const currentPageNumber = Number(currentPage) || 1;
  const currentLimitValue = String(currentLimit);

  const filteredParticipants = useMemo(() => {
    if (statusFilter === 'all') return tableData;
    return tableData.filter(
      (participant) => participant.status === statusFilter
    );
  }, [statusFilter, tableData]);

  const tableItems = useMemo(() => {
    return filteredParticipants.map((participant, idx) => {
      const baseKey =
        participant.enrollId ||
        participant.participantId ||
        `${participant.nim}-${participant.scheduleId}` ||
        `${participant.fullName}-${participant.scheduleId}`;

      return {
        ...participant,
        __rowKey: baseKey || `row-${idx}`,
      };
    });
  }, [filteredParticipants]);

  const statusOptions = useMemo(
    () => [
      { label: 'Semua Status', value: 'all' },
      ...FILTER_OPTIONS.map((option) => ({
        label: option.name,
        value: option.uid,
      })),
    ],
    []
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      setParams({
        status: !value || value === 'all' ? null : value,
        page: '1',
      });
    },
    [setParams]
  );

  const handleChangeService = useCallback(
    (serviceId: string) => {
      setParams({
        serviceId: !serviceId || serviceId === 'all' ? null : serviceId,
        page: '1',
      });
    },
    [setParams]
  );

  const handleChangeSchedule = useCallback(
    (scheduleId: string) => {
      setParams({
        scheduleId: !scheduleId || scheduleId === 'all' ? null : scheduleId,
        page: '1',
      });
    },
    [setParams]
  );

  const handleOpenDetail = useCallback((participant: EnrollmentItem) => {
    setSelectedParticipant(participant);
    setDetailModalOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailModalOpen(false);
    setTimeout(() => {
      setSelectedParticipant(null);
    }, 400);
  }, []);

  // Services dropdown options
  const { data: servicesData } = useQuery({
    queryKey: ['services', 'options'],
    queryFn: async () => {
      const response = await servicesService.getServices({ limit: 100 });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const serviceOptions = useMemo(() => {
    const items = servicesData?.data || [];
    return items.map((svc: { name: string; _id: string }) => ({
      label: svc.name,
      value: svc._id,
    }));
  }, [servicesData]);

  // Schedules dropdown options
  const { data: schedulesData } = useQuery({
    queryKey: ['schedules', 'options', currentServiceId],
    queryFn: async () => {
      const query =
        currentServiceId && currentServiceId !== 'all'
          ? { serviceId: currentServiceId, limit: 100 }
          : { limit: 100 };
      const response = await schedulesService.getAdminSchedules(query);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const scheduleOptions = useMemo(() => {
    const items = schedulesData?.data || [];
    return items.map((sch: { date: string; _id: string; quota: number }) => ({
      label: `${formatDate(sch.date)} (Kuota: ${sch.quota})`,
      value: sch._id,
    }));
  }, [schedulesData]);

  return {
    tableItems,
    statusFilter,
    statusOptions,
    currentSearch,
    currentLimitValue,
    currentPageNumber,
    totalPages,
    isLoadingEnrollments,
    isRefetchingEnrollments,
    detailModalOpen,
    selectedParticipant,
    currentServiceId,
    serviceOptions,
    handleSearch,
    handleClearSearch,
    handleStatusChange,
    handleChangeLimit,
    handleChangePage,
    handleOpenDetail,
    handleCloseDetail,
    handleChangeService,
    currentScheduleId,
    handleChangeSchedule,
    scheduleOptions,
  };
};

// ============ PAGE COMPONENT ============
export default function AdminParticipants() {
  const {
    tableItems,
    statusFilter,
    statusOptions,
    currentSearch,
    currentLimitValue,
    currentPageNumber,
    totalPages,
    isLoadingEnrollments,
    isRefetchingEnrollments,
    detailModalOpen,
    selectedParticipant,
    handleSearch,
    handleClearSearch,
    handleStatusChange,
    handleChangeLimit,
    handleChangePage,
    handleOpenDetail,
    handleCloseDetail,
    currentServiceId,
    serviceOptions,
    handleChangeService,
    currentScheduleId,
    scheduleOptions,
    handleChangeSchedule,
  } = useParticipants();

  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['enrollments'] });
  };

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
      render: (item) => <EnrollmentStatus status={item.status} />,
    },
    {
      uid: 'actions',
      name: 'Aksi',
      align: 'center',
      render: (item) => (
        <div className="text-center">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="full"
            aria-label="Lihat detail"
            className="hover:text-primary text-gray-600"
            onPress={() => handleOpenDetail(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Manajemen Peserta"
      description="Kelola data pendaftar dan status pendaftaran."
    >
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-4"
      >
        <GenericEnrollmentTable
          data={tableItems as EnrollmentItem[]}
          isLoading={isLoadingEnrollments}
          isRefetching={isRefetchingEnrollments}
          columns={columns}
          search={{
            value: currentSearch,
            onChange: handleSearch,
            onClear: handleClearSearch,
          }}
          filterContent={
            <>
              <ServiceFilter
                value={currentServiceId}
                onChange={handleChangeService}
                options={serviceOptions}
              />
              <ScheduleFilter
                value={currentScheduleId}
                onChange={handleChangeSchedule}
                options={scheduleOptions}
              />
              <StatusFilter
                value={statusFilter}
                onChange={handleStatusChange}
                options={statusOptions}
              />
              <LimitFilter
                value={currentLimitValue}
                onChange={handleChangeLimit}
              />
              <Refresh
                isRefetching={isRefetchingEnrollments}
                onRefresh={handleRefresh}
              />
            </>
          }
          pagination={{
            page: currentPageNumber,
            total: totalPages,
            onChange: handleChangePage,
          }}
        />

        {selectedParticipant && (
          <DetailModal
            isOpen={detailModalOpen}
            onClose={handleCloseDetail}
            participant={selectedParticipant}
          />
        )}
      </motion.section>
    </DashboardLayout>
  );
}
