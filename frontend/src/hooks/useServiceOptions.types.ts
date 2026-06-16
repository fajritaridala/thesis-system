export type ServiceOption = {
  label: string;
  value: string;
};

export type UseServiceOptionsReturn = {
  serviceOptions: ServiceOption[];
  isLoading: boolean;
};
