import { Select, SelectItem } from '@heroui/react';
import { Filter } from 'lucide-react';

type Option = {
  label: string;
  value: string;
};

type ScheduleFilterProps = {
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
};

export function ScheduleFilter({
  value,
  onChange,
  options,
}: ScheduleFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        disallowEmptySelection
        radius="full"
        aria-label="Filter jadwal"
        placeholder="Jadwal"
        startContent={<Filter size={18} className="text-text-muted" />}
        selectedKeys={value && value !== 'all' ? new Set([value]) : new Set([])}
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
          base: 'w-56', // Wider for dates
          trigger:
            'h-9 bg-white border border-gray-200 shadow-sm hover:border-gray-300',
          value: 'text-small text-center font-medium text-gray-700',
          listbox: 'w-full',
          popoverContent: 'w-56',
        }}
      >
        {[{ label: 'Semua Jadwal', value: 'all' }, ...options].map((opt) => (
          <SelectItem key={opt.value} textValue={opt.label}>
            {opt.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
