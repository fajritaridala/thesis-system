import { useCallback, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import { Eye, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layouts/Dashboard';
import {
  LimitFilter,
  ScheduleStatusFilter,
  ServiceFilter,
} from '@/components/ui/Button/Filter';
import { Refresh } from '@/components/ui/Button/Refresh';
import { AddModal, ParticipantsModal } from '@/components/ui/Modal';
import {
  ColumnConfig,
  GenericScheduleTable,
} from '@/components/ui/Table/ScheduleTable';
import usePagination from '@/hooks/usePagination';
import { schedulesService, servicesService } from '@/services/admin.service';
import { ScheduleItem } from '@/types/admin.types';
import { formatDate } from '@/utils/common';
import { useDeleteSchedule } from './useDeleteSchedule';
import { useScheduleForm } from './useScheduleForm';
import { useScheduleParticipants } from './useScheduleParticipants';

// ============ ANIMATION VARIANTS ============
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// ============ HOOK: useSchedules ============
const useSchedules = () => {
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

  const {
    data: dataSchedules,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: [
      'admin-schedules',
      currentPage,
      currentLimit,
      currentSearch,
      currentStatus,
      currentServiceId,
    ],
    queryFn: async () => {
      const response = await schedulesService.getAdminSchedules({
        page: Number(currentPage),
        limit: Number(currentLimit),
        search: currentSearch || undefined,
        status:
          currentStatus !== 'all'
            ? (currentStatus as import('@/types/admin.types').ScheduleStatus)
            : undefined,
        serviceId: currentServiceId !== 'all' ? currentServiceId : undefined,
      });
      return response.data;
    },
    enabled: !!currentPage && !!currentLimit,
  });

  const [statusFilter, setStatusFilter] = useState<string>(
    currentStatus ?? 'all'
  );

  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [selectedScheduleForParticipants, setSelectedScheduleForParticipants] =
    useState<ScheduleItem | null>(null);

  // Hook for participants logic
  const participantsLogic = useScheduleParticipants(
    selectedScheduleForParticipants?.scheduleId,
    participantsModalOpen
  );

  // Services dropdown logic
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

  const handleOpenParticipants = useCallback((schedule: ScheduleItem) => {
    setSelectedScheduleForParticipants(schedule);
    setParticipantsModalOpen(true);
  }, []);

  const handleCloseParticipants = useCallback(() => {
    setParticipantsModalOpen(false);
    setTimeout(() => {
      setSelectedScheduleForParticipants(null);
    }, 300);
  }, []);

  return {
    dataSchedules,
    isLoading,
    isRefetching,
    currentSearch,
    handleSearch,
    handleClearSearch,
    currentLimit,
    handleChangeLimit,
    currentPage,
    handleChangePage,
    statusFilter,
    handleStatusChange,
    currentServiceId,
    handleChangeService,
    serviceOptions,
    participantsModalOpen,
    handleOpenParticipants,
    handleCloseParticipants,
    selectedScheduleForParticipants,
    participantsLogic,
  };
};

// ============ PAGE COMPONENT ============
export default function AdminSchedules() {
  const {
    dataSchedules,
    isLoading,
    isRefetching,
    currentSearch,
    handleSearch,
    handleClearSearch,
    currentLimit,
    handleChangeLimit,
    currentPage,
    handleChangePage,
    statusFilter,
    handleStatusChange,
    currentServiceId,
    handleChangeService,
    serviceOptions,
    participantsModalOpen,
    handleOpenParticipants,
    handleCloseParticipants,
    selectedScheduleForParticipants,
    participantsLogic,
  } = useSchedules();

  // State for Add/Edit Form
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editItem, setEditItem] = useState<ScheduleItem | null>(null);
  const isEditing = !!editItem;

  // Custom Hook Form
  const { control, handleSubmit, isSubmitting, errors } = useScheduleForm({
    mode: isEditing ? 'edit' : 'create',
    schedule: editItem,
    isOpen,
    onSuccess: onClose,
  });

  const queryClient = useQueryClient();
  const { deleteSchedule, isDeleting } = useDeleteSchedule({}); // No props needed specifically, hooks handle invalidation

  const handleOpenAdd = () => {
    setEditItem(null);
    onOpen();
  };

  const handleEditClick = (item: ScheduleItem) => {
    setEditItem(item);
    onOpen();
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      deleteSchedule(id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-schedules'] });
  };

  const columns: ColumnConfig[] = [
    { uid: 'serviceName', name: 'Layanan', sortable: true },
    { uid: 'scheduleDate', name: 'Tanggal', sortable: true, align: 'center' },
    { uid: 'quota', name: 'Kuota', align: 'center' },
    { uid: 'registrants', name: 'Terdaftar', align: 'center' },
    { uid: 'status', name: 'Status', align: 'center' },
    {
      uid: 'actions',
      name: 'Aksi',
      align: 'center',
      render: (item) => (
        <div className="flex w-full items-center justify-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => handleOpenParticipants(item)}
            className="text-default-400 hover:text-primary"
            aria-label="Lihat Peserta"
          >
            <Eye size={18} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => handleEditClick(item)}
            className="text-default-400 hover:text-warning"
            aria-label="Edit Jadwal"
          >
            <i className="i-lucide-edit-2 text-lg" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={() => handleDeleteClick(item.scheduleId)}
            className="text-default-400 hover:text-danger"
            aria-label="Hapus Jadwal"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Manajemen Jadwal"
      description="Kelola jadwal tes TOEFL dan kapasitas ruangan."
    >
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-4"
      >
        <GenericScheduleTable
          data={(dataSchedules?.data as ScheduleItem[]) || []}
          isLoading={isLoading}
          isRefetching={isRefetching}
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
              <ScheduleStatusFilter
                value={statusFilter}
                onChange={handleStatusChange}
              />
              <LimitFilter
                value={String(currentLimit)}
                onChange={handleChangeLimit}
              />
              <Refresh isRefetching={isRefetching} onRefresh={handleRefresh} />
              <Button
                color="primary"
                endContent={<Plus size={16} />}
                onPress={handleOpenAdd}
              >
                Tambah Jadwal
              </Button>
            </>
          }
          pagination={{
            page: Number(currentPage),
            total: dataSchedules?.pagination?.totalPages || 1,
            onChange: handleChangePage,
          }}
        />

        <AddModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleSubmit}
          title={isEditing ? 'Edit Jadwal' : 'Tambah Jadwal'}
          description={
            isEditing
              ? 'Perbarui informasi jadwal tes.'
              : 'Buat jadwal tes baru untuk peserta.'
          }
          isSubmitting={isSubmitting}
          submitText={isEditing ? 'Simpan Perubahan' : 'Buat Jadwal'}
        >
          <Controller
            control={control}
            name="serviceId"
            render={({ field }) => (
              <Select
                {...field}
                label="Layanan"
                placeholder="Pilih layanan"
                selectedKeys={field.value ? [field.value] : []}
                isInvalid={!!errors.serviceId}
                errorMessage={errors.serviceId?.message}
              >
                {serviceOptions.map(
                  (option: { value: string; label: string }) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  )
                )}
              </Select>
            )}
          />

          <div className="flex gap-4">
            <Controller
              control={control}
              name="scheduleDate"
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Tanggal Tes"
                  placeholder="Pilih tanggal"
                  isInvalid={!!errors.scheduleDate}
                  errorMessage={errors.scheduleDate?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="capacity"
              render={({ field }) => (
                <Input
                  {...field}
                  value={String(field.value ?? '')}
                  type="number"
                  label="Kapasitas"
                  placeholder="0"
                  isInvalid={!!errors.capacity}
                  errorMessage={errors.capacity?.message}
                />
              )}
            />
          </div>

          <div className="flex gap-4">
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <Input
                  {...field}
                  type="time"
                  label="Waktu Mulai"
                  isInvalid={!!errors.startTime}
                  errorMessage={errors.startTime?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="endTime"
              render={({ field }) => (
                <Input
                  {...field}
                  type="time"
                  label="Waktu Selesai"
                  isInvalid={!!errors.endTime}
                  errorMessage={errors.endTime?.message}
                />
              )}
            />
          </div>
        </AddModal>

        <ParticipantsModal
          isOpen={participantsModalOpen}
          onClose={handleCloseParticipants}
          schedule={selectedScheduleForParticipants}
          enrollments={participantsLogic.enrollments}
          isLoading={participantsLogic.isLoading}
          isRefetching={participantsLogic.isRefetching}
          search={{
            value: participantsLogic.currentSearch,
            onChange: participantsLogic.handleSearch,
            onClear: participantsLogic.handleClearSearch,
          }}
          pagination={{
            page: participantsLogic.currentPage,
            total: participantsLogic.totalPages,
            onChange: participantsLogic.handleChangePage,
          }}
        />
      </motion.section>
    </DashboardLayout>
  );
}
