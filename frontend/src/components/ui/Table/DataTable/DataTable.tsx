import { ChangeEvent, Key, ReactNode, useMemo, useState } from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { CiSearch } from 'react-icons/ci';
import type { Selection } from '@heroui/react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { FILTER_OPTIONS, LIMIT_LISTS } from '@/constants/list.constants';

type Props = {
  buttonTopContentLabel?: string;
  columns: Record<string, unknown>[];
  currentPage: number;
  data: Record<string, unknown>[];
  emptyContent: string;
  isLoading?: boolean;
  limit: string;
  onChangeLimit: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangePage: (page: number) => void;
  onChangeSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onClickButtonTopContent?: () => void;
  renderCell: (item: Record<string, unknown>, columnKey: Key) => ReactNode;
  totalPages: number;
  rowKeyField?: string;
};

export function DataTable(props: Props) {
  const {
    currentPage,
    columns,
    data,
    emptyContent,
    isLoading,
    limit,
    onChangeLimit,
    onChangePage,
    onChangeSearch,
    onClearSearch,
    renderCell,
    totalPages,
    rowKeyField = '_id',
  } = props;
  const [statusFilter, setStatusFilter] = useState<Selection>('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') {
      return data;
    }
    const selectedKeys = Array.from(
      statusFilter instanceof Set ? statusFilter : [statusFilter]
    );
    return data.filter((item) => {
      const value = item.status as string | undefined;
      if (!value) return false;
      const itemStatus = value.toLowerCase();
      const normalized = selectedKeys.map((key) =>
        (key as string).toLowerCase()
      );
      return normalized.includes(itemStatus);
    });
  }, [data, statusFilter]);

  const TopContent = useMemo(() => {
    return (
      <div className="flex justify-between">
        <div className="flex flex-col-reverse items-start justify-between gap-y-4 lg:w-full">
          <Input
            isClearable
            className="w-full sm:max-w-[20vw]"
            classNames={{
              innerWrapper: ['focus-within:text-primary-800 '],
              inputWrapper: [
                'bg-primary-800 ',
                'shadow-sm',
                'text-white hover:text-primary-800 active:text-black',
                'font-bold',
                'group',
                'focus-within:bg-default-200',
              ],
              input: [
                'placeholder:text-white placeholder:font-semibold',
                'group-hover:placeholder:text-primary-800',
                'transition-all duration-1000',
                'focus-within:placeholder:text-primary-800 !text-primary-800',
              ],
            }}
            placeholder="Search..."
            startContent={<CiSearch size={24} className="stroke-1" />}
            onClear={onClearSearch}
            onChange={onChangeSearch}
          />
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              endContent={<BiChevronDown size={32} />}
              className="bg-primary-800 border font-semibold text-white"
            >
              Status
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Status Filter"
            closeOnSelect={false}
            selectedKeys={statusFilter}
            selectionMode="multiple"
            onSelectionChange={setStatusFilter}
          >
            {FILTER_OPTIONS.map((status) => (
              <DropdownItem
                key={status.uid}
                className="hover:!bg-primary-800 focus-within:!bg-primary-800 transition-all duration-300 focus-within:!text-white"
              >
                {status.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }, [statusFilter, onChangeSearch, onClearSearch]);

  const BottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-center lg:justify-between">
        <Select
          className="hidden max-w-36 lg:block"
          classNames={{
            trigger: [
              'bg-primary-800',
              'transition-all duration-300',
              'text-white font-semibold hover:text-primary-800',
              'groub',
            ],
            selectorIcon: ['stroke-2'],
            value: ['!text-white group-hover:!text-primary-800'],
          }}
          size="md"
          selectedKeys={[limit]}
          selectionMode="single"
          onChange={onChangeLimit}
          startContent={<p className="text-small">Show:</p>}
          disallowEmptySelection
          aria-label="Select number of items to show per page"
        >
          {LIMIT_LISTS.map((item) => (
            <SelectItem key={item.value}>{item.label}</SelectItem>
          ))}
        </Select>

        {totalPages > 1 && (
          <Pagination
            isCompact
            showControls
            color="secondary"
            page={currentPage}
            total={totalPages}
            onChange={onChangePage}
            variant="light"
            loop
            classNames={{
              cursor: ['bg-primary-800'],
              next: [
                'bg-primary-800 hover:!bg-primary-800 active:!bg-primary-800/90',
                'transition-all duration-300',
                'text-white',
              ],
              prev: [
                'bg-primary-800 hover:!bg-primary-800 active:!bg-primary-800/90',
                'transition-all duration-300',
                'text-white',
              ],
            }}
          />
        )}
      </div>
    );
  }, [limit, currentPage, totalPages, onChangeLimit, onChangePage]);

  return (
    <Table
      aria-label="tabel content"
      topContent={TopContent}
      topContentPlacement="outside"
      bottomContent={BottomContent}
      bottomContentPlacement="outside"
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid as Key}>
            {column.name as string}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={filteredData}
        emptyContent={emptyContent}
        isLoading={isLoading}
        loadingContent={
          <div className="bg-foreground-700/30 flex h-full w-full items-center justify-center backdrop-blur-sm">
            <Spinner color="danger" />
          </div>
        }
      >
        {(item) => {
          const keyValue =
            (item[rowKeyField as keyof typeof item] as Key | undefined) ??
            (item['_id' as keyof typeof item] as Key | undefined);
          return (
            <TableRow key={keyValue ?? JSON.stringify(item)}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
