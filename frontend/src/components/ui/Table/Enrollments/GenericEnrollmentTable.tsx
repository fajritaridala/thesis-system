'use client';

import { Key, ReactNode, useEffect, useState } from 'react';
import {
  Input,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { EnrollmentItem } from '@/types/admin.types';

export interface ColumnConfig {
  uid: string;
  name: string;
  sortable?: boolean;
  width?: number;
  align?: 'start' | 'center' | 'end';
  render?: (item: EnrollmentItem) => ReactNode;
}

interface GenericEnrollmentTableProps {
  // Data props
  data: EnrollmentItem[];
  isLoading: boolean;
  isRefetching?: boolean;
  emptyContent?: ReactNode;

  // Configuration
  columns: ColumnConfig[];

  // Search props
  search: {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
  };

  // Modular Filters Slot
  filterContent?: ReactNode;

  // Pagination props
  pagination: {
    page: number;
    total: number;
    onChange: (page: number) => void;
  };
}

export function GenericEnrollmentTable({
  data,
  isLoading,
  isRefetching,
  emptyContent,
  columns,
  search,
  filterContent,
  pagination,
}: GenericEnrollmentTableProps) {
  // Internal debounce for search input to prevent jitter
  // The parent likely handles debounce for API calls, but UI needs robust handling
  const [searchInput, setSearchInput] = useState(search.value);
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    // Determine if we should propagate the change
    // If the parent value changes externally, sync local state
    if (search.value !== searchInput) {
      // If parent holds a different value (e.g. from URL or clear action), update local
      // But be careful not to create loop if parent updates on every keystroke
      if (search.value !== debouncedSearch) {
        setSearchInput(search.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.value]);

  useEffect(() => {
    if (debouncedSearch !== search.value) {
      search.onChange(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleClearSearch = () => {
    setSearchInput('');
    search.onClear();
  };

  const renderCell = (item: EnrollmentItem, columnKey: Key) => {
    const column = columns.find((col) => col.uid === columnKey);
    if (column?.render) {
      return column.render(item);
    }

    // Default renderings based on common fields if no custom render provided
    switch (columnKey) {
      case 'fullName':
        return (
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-gray-900">{item.fullName}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        );
      case 'nim':
        return (
          <p className="text-center font-medium text-gray-700">{item.nim}</p>
        );
      case 'serviceName':
        return (
          <p className="text-center font-medium text-gray-700">
            {item.serviceName || '-'}
          </p>
        );
      default:
        // @ts-expect-error - dynamic value for row key - dynamic access
        return item[columnKey] as ReactNode;
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md shadow-gray-100/50">
      {/* Header: Filters & Search */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-t-xl border-b border-gray-50 bg-transparent px-6 py-4 sm:flex-row">
        <Input
          isClearable
          type="search"
          radius="full"
          placeholder={search.placeholder || 'Cari nama atau NIM peserta...'}
          startContent={<Search className="h-4 w-4 text-gray-400" />}
          value={searchInput}
          onClear={handleClearSearch}
          onValueChange={setSearchInput}
          classNames={{
            base: 'w-full sm:max-w-md',
            inputWrapper: 'h-9 bg-gray-50 border border-gray-200 shadow-sm',
            input: 'text-sm',
          }}
        />

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          {filterContent}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table
          aria-label="Tabel Data Peserta"
          selectionMode="none"
          removeWrapper
          classNames={{
            th: 'bg-gray-50/80 text-gray-500 font-bold text-xs uppercase tracking-wider px-6 py-4 border-b border-gray-100',
            td: 'px-6 py-4 text-sm text-gray-700 border-b border-gray-50',
            tr: 'hover:bg-gray-50/50 transition-colors',
            base: 'min-w-full',
            table: isRefetching
              ? 'opacity-50 transition-opacity duration-200 pointer-events-none'
              : 'transition-opacity duration-200',
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={
                  column.align ||
                  (column.uid === 'fullName' ? 'start' : 'center')
                }
                className={
                  column.uid === 'fullName' ? 'text-left' : 'text-center'
                }
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={data}
            isLoading={isLoading}
            loadingContent={
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" color="primary" />
                <p className="mt-3 text-sm text-gray-500">Memuat data...</p>
              </div>
            }
            emptyContent={
              emptyContent || (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    Tidak ada data ditemukan
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Coba ubah filter atau kata kunci pencarian
                  </p>
                </div>
              )
            }
          >
            {(item) => (
              <TableRow key={item.enrollId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && pagination.total > 1 && (
        <div className="rounded-b-xl border-t border-gray-100 bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-end-safe">
            <Pagination
              showShadow
              showControls
              page={pagination.page}
              total={pagination.total}
              onChange={pagination.onChange}
              variant="light"
              classNames={{
                wrapper: 'gap-1',
                item: 'w-8 h-8 min-w-8 bg-white shadow-sm border border-gray-200',
                cursor: 'bg-primary text-white font-semibold border-primary',
                prev: 'bg-transparent',
                next: 'bg-transparent',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
