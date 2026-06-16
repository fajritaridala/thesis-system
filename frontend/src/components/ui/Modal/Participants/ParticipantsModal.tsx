import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { EnrollmentStatus } from '@/components/ui/Chip/EnrollmentStatus';
import {
  ColumnConfig,
  GenericEnrollmentTable,
} from '@/components/ui/Table/Enrollments';
import { EnrollmentItem, ScheduleItem } from '@/types/admin.types';

type Props = {
  isOpen: boolean;
  schedule: ScheduleItem | null;
  onClose: () => void;
  enrollments: EnrollmentItem[];
  isLoading: boolean;
  isRefetching: boolean;
  search: {
    value: string;
    onChange: (val: string) => void;
    onClear: () => void;
  };
  pagination: {
    page: number;
    total: number;
    onChange: (page: number) => void;
  };
};

const COLUMNS: ColumnConfig[] = [
  { uid: 'fullName', name: 'Nama', sortable: true },
  { uid: 'nim', name: 'NIM', sortable: true, align: 'center' },
  {
    uid: 'status',
    name: 'Status',
    render: (item) => <EnrollmentStatus status={item.status} />,
    align: 'center',
  },
];

export function ParticipantsModal({
  isOpen,
  schedule,
  onClose,
  enrollments,
  isLoading,
  isRefetching,
  search,
  pagination,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="max-h-[90vh]">
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Daftar Peserta</h2>
              <div className="text-sm font-normal text-gray-500">
                Jadwal: {schedule?.serviceName} - {schedule?.scheduleDate}
              </div>
            </ModalHeader>
            <ModalBody className="pb-6">
              <GenericEnrollmentTable
                data={enrollments}
                isLoading={isLoading}
                isRefetching={isRefetching}
                columns={COLUMNS}
                search={{
                  value: search.value,
                  onChange: search.onChange,
                  onClear: search.onClear,
                  placeholder: 'Cari nama atau NIM...',
                }}
                pagination={{
                  page: pagination.page,
                  total: pagination.total,
                  onChange: pagination.onChange,
                }}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
