// Types for usePagination hook

export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
};

export type UsePaginationOptions = {
  defaults?: Partial<PaginationParams>;
  debounceDelay?: number;
};

export type UsePaginationReturn = {
  // Current values from URL
  currentPage: string;
  currentLimit: string;
  currentSearch: string;
  getParam: (key: string) => string;
  
  // URL manipulation
  setParams: (
    updates: Record<string, string | null | undefined>,
    method?: 'push' | 'replace'
  ) => void;
  
  // Convenience handlers
  handleChangePage: (page: number) => void;
  handleChangeLimit: (limit: string) => void;
  handleSearch: (value: string) => void;
  handleClearSearch: () => void;
};
