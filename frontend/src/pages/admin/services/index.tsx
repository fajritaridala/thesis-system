import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Textarea,
} from '@heroui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type Variants, motion } from 'framer-motion';
import Head from 'next/head';
import DashboardLayout from '@/components/layouts/Dashboard';
import { AddModal } from '@/components/ui/Modal';
import { ServiceTable } from '@/components/ui/Table/ServiceTable';
import usePagination from '@/hooks/usePagination';
import { servicesService } from '@/services/admin.service';
import { ServiceItem, ServiceListResponse } from '@/types/admin.types';
import { useDeleteService } from './useDeleteService';
import { useServiceForm } from './useServiceForm';

// ============ CONSTANTS ============
type ServiceTableColumn = {
  key: 'name' | 'price' | 'notes' | 'description' | 'actions';
  label: string;
  className?: string;
};

const SERVICE_TABLE_COLUMNS: ServiceTableColumn[] = [
  { key: 'name', label: 'Nama' },
  { key: 'price', label: 'Harga' },
  { key: 'notes', label: 'Catatan', className: 'w-36' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'actions', label: 'Aksi', className: 'w-20 text-right' },
];

// ============ ANIMATION VARIANTS ============
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// ============ HOOK: useServices ============
const useServices = () => {
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleSearch,
    handleClearSearch,
  } = usePagination();

  const {
    data: servicesResponse,
    isLoading: isLoadingServices,
    isRefetching: isRefetchingServices,
  } = useQuery({
    queryKey: ['services', 'admin', currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const response = await servicesService.getServices({
        page: Number(currentPage),
        limit: Number(currentLimit),
        search: currentSearch,
      });
      return response.data as ServiceListResponse;
    },
    enabled: !!currentPage && !!currentLimit,
  });

  const services = useMemo(() => {
    const items = servicesResponse?.data || [];
    return items.map((item, idx) => ({
      ...item,
      __rowKey: item._id || `service-${idx}`,
    }));
  }, [servicesResponse]);

  const pagination = useMemo(
    () => servicesResponse?.pagination,
    [servicesResponse]
  );

  return {
    services,
    pagination,
    isLoadingServices,
    isRefetchingServices,
    currentLimit,
    currentPage,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleSearch,
    handleClearSearch,
  };
};

// ============ PAGE COMPONENT ============
export default function AdminServices() {
  const queryClient = useQueryClient();

  const {
    services,
    pagination,
    isLoadingServices,
    isRefetchingServices,
    currentPage,
    currentSearch,
    currentLimit,
    handleChangePage,
    handleChangeLimit,
    handleSearch,
    handleClearSearch,
  } = useServices();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['services'] });
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openCreateModal = () => {
    setFormMode('create');
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setFormMode('edit');
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
  };

  const handleDeleteModal = (service: ServiceItem) => {
    setDeleteTarget(service);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTimeout(() => {
      setDeleteTarget(null);
    }, 400);
  };

  // Form Hook
  const { control, errors, handleSubmit, isSubmitting } = useServiceForm({
    mode: formMode,
    service: selectedService,
    isOpen: isFormOpen,
    onSuccess: closeFormModal,
  });

  // Delete Hook
  const { deleteService, isDeleting } = useDeleteService({
    onSuccess: closeDeleteModal,
  });

  // Derived Values
  const modalTitle = formMode === 'create' ? 'Tambah Layanan' : 'Ubah Layanan';

  return (
    <>
      <Head>
        <title>Kelola Layanan - Simpeka</title>
      </Head>
      <DashboardLayout
        title="Manajemen Layanan"
        description="Kelola jenis layanan tes yang tersedia."
      >
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-6 pt-4"
        >
          <ServiceTable
            columns={SERVICE_TABLE_COLUMNS}
            services={services}
            isLoading={isLoadingServices}
            isRefetching={isRefetchingServices}
            currentPage={Number(currentPage)}
            totalPages={pagination?.totalPages || 1}
            currentSearch={currentSearch}
            currentLimit={currentLimit}
            onChangeLimit={(val: number) => handleChangeLimit(String(val))}
            onChangePage={handleChangePage}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            onRefresh={handleRefresh}
            onAdd={openCreateModal}
            onEdit={openEditModal}
            onDelete={handleDeleteModal}
          />

          {/* ADD/EDIT MODAL */}
          <AddModal
            isOpen={isFormOpen}
            onClose={closeFormModal}
            title={modalTitle}
            description="Isi informasi layanan secara lengkap sebelum menyimpan."
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  isRequired
                  variant="bordered"
                  label="Nama layanan"
                  labelPlacement="outside"
                  placeholder="Contoh: TOEFL ITP"
                  errorMessage={errors.name?.message}
                  isInvalid={!!errors.name}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  isRequired
                  minRows={3}
                  variant="bordered"
                  label="Deskripsi"
                  labelPlacement="outside"
                  placeholder="Tuliskan deskripsi singkat layanan"
                  errorMessage={errors.description?.message}
                  isInvalid={!!errors.description}
                />
              )}
            />

            <Controller
              name="price"
              control={control}
              render={({ field }) => {
                const { ref, value, onChange, ...restField } = field;
                return (
                  <NumberInput
                    {...restField}
                    ref={ref}
                    isRequired
                    hideStepper
                    min={0}
                    variant="bordered"
                    label="Harga (Rp)"
                    labelPlacement="outside"
                    placeholder="Masukkan harga"
                    value={
                      typeof value === 'number'
                        ? value
                        : value
                          ? Number(value)
                          : undefined
                    }
                    onValueChange={(nextValue) =>
                      onChange(
                        typeof nextValue === 'number' &&
                          !Number.isNaN(nextValue)
                          ? nextValue
                          : undefined
                      )
                    }
                    errorMessage={errors.price?.message}
                    isInvalid={!!errors.price}
                  />
                );
              }}
            />
          </AddModal>

          {/* DELETE MODAL */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            backdrop="blur"
          >
            <ModalContent>
              {() => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    <h1 className="text-text text-xl font-bold">
                      Hapus Layanan
                    </h1>
                  </ModalHeader>
                  <ModalBody>
                    <p className="text-text-muted">
                      Apakah Anda yakin ingin menghapus layanan{' '}
                      <span className="text-text font-semibold">
                        {deleteTarget?.name}
                      </span>
                      ? Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="light"
                      onPress={closeDeleteModal}
                      className="font-medium"
                    >
                      Batal
                    </Button>
                    <Button
                      color="danger"
                      onPress={() =>
                        deleteTarget?._id && deleteService(deleteTarget._id)
                      }
                      isLoading={isDeleting}
                      className="font-medium"
                    >
                      Hapus
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </motion.section>
      </DashboardLayout>
    </>
  );
}
