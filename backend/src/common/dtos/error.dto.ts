interface ErrorDto {
  meta: {
    status: number;
    message: string;
  };
  data: any;
}

export type { ErrorDto };
