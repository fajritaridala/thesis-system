import { Select, SelectItem } from '@heroui/react';
import { Filter } from 'lucide-react';
import { EnrollmentStatus } from '@/types/admin.types';

type Option = {
  label: string;
  value: string;
};

type StatusFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options?: Option[]; // Optional override
};

// Default options based on EnrollmentStatus Enum, similar to LIST_CONSTANTS
const DEFAULT_OPTIONS = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: EnrollmentStatus.PENDING },
  { label: 'Disetujui', value: EnrollmentStatus.APPROVED },
  { label: 'Ditolak', value: EnrollmentStatus.REJECTED },
];

export function StatusFilter({ value, onChange, options = DEFAULT_OPTIONS }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        disallowEmptySelection
        radius="full"
        aria-label="Filter status"
        placeholder="Status"
        startContent={<Filter size={18} className="text-text-muted" />}
        selectedKeys={value === 'all' ? new Set([]) : new Set([value])}
        onSelectionChange={(keys) => {
            if (keys === 'all') {
                onChange('all');
                return;
            }
            if ((keys as Set<string>).size === 0) {
               onChange('all');
               return;
            }
            const selectedValue = Array.from(keys)[0] as string;
            onChange(selectedValue);
        }}
        classNames={{
          base: 'w-32', // Slightly wider for ease
          trigger: 'h-9 bg-white border border-gray-200 shadow-sm hover:border-gray-300',
          value: 'text-small text-center font-medium text-gray-700',
          listbox: 'w-full',
          popoverContent: 'w-34',
        }}
      >
        {options.map((opt) => (
          <SelectItem key={opt.value} textValue={opt.label}>
            {opt.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
