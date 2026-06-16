import { Select, SelectItem } from '@heroui/react';
import { LIMIT_LISTS } from '@/constants/list.constants';

type LimitFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LimitFilter({ value, onChange }: LimitFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        startContent={<p className="text-small text-text-muted">Tampilkan</p>}
        disallowEmptySelection
        radius="full"
        aria-label="Items per page"
        selectedKeys={new Set([String(value)])}
        onSelectionChange={(keys) => {
          const selectedValue = Array.from(keys)[0] as string;
          onChange(selectedValue);
        }}
        classNames={{
          base: 'w-36',
          trigger: 'h-9 bg-white border border-gray-200 shadow-sm hover:border-gray-300',
          value: 'text-small text-center font-medium text-gray-700',
          listbox: 'w-full',
          popoverContent: 'w-36',
        }}
      >
        {LIMIT_LISTS.map((limit) => (
          <SelectItem key={String(limit.value)} textValue={limit.label}>{limit.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
