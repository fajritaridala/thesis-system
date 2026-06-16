'use client';

import { EnrollmentStatus as EnrollmentStatusEnum } from '@/types/admin.types';

interface EnrollmentStatusProps {
  status: EnrollmentStatusEnum | string;
}

const statusConfig: Record<
  string,
  {
    bgColor: string;
    borderColor: string;
    textColor: string;
    dotColor: string;
    label: string;
  }
> = {
  [EnrollmentStatusEnum.APPROVED]: {
    bgColor: 'bg-transparent',
    borderColor: 'border-green-600',
    textColor: 'text-green-700',
    dotColor: 'bg-green-600',
    label: 'Disetujui',
  },
  [EnrollmentStatusEnum.REJECTED]: {
    bgColor: 'bg-transparent',
    borderColor: 'border-red-600',
    textColor: 'text-red-700',
    dotColor: 'bg-red-600',
    label: 'Ditolak',
  },
  [EnrollmentStatusEnum.PENDING]: {
    bgColor: 'bg-transparent',
    borderColor: 'border-yellow-600',
    textColor: 'text-yellow-700',
    dotColor: 'bg-yellow-600',
    label: 'Menunggu',
  },
  [EnrollmentStatusEnum.COMPLETED]: {
    bgColor: 'bg-transparent',
    borderColor: 'border-green-600',
    textColor: 'text-green-700',
    dotColor: 'bg-green-600',
    label: 'Selesai',
  },
};

export function EnrollmentStatus({ status }: EnrollmentStatusProps) {
  const normalizedStatus = status as string;

  const style = statusConfig[normalizedStatus] || {
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-400',
    label: status,
  };

  return (
    <div className="text-center">
      <span
        className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-3 py-1.5 ${style.bgColor} ${style.borderColor} ${style.textColor} text-sm font-medium`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${style.dotColor}`}></span>
        {style.label}
      </span>
    </div>
  );
}
