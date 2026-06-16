import * as yup from "yup";

const querySchema = yup.object().shape({
  page: yup.number().optional().default(1),
  limit: yup.number().optional().default(10),
  search: yup.string().optional(),
});

const paramsSchema = yup.object().shape({
  serviceId: yup.string().required(),
});

const filterSchema = querySchema.shape({
  serviceId: (paramsSchema.fields.serviceId as yup.StringSchema).optional(),
  status: yup.string().optional(),
  month: yup.number().optional(),
});

const paginationSchema = yup.object().shape({
  current: yup.number().min(1).required(),
  total: yup.number().min(1).required(),
  totalPages: yup.number().min(1).required(),
});

type QueryDto = yup.InferType<typeof querySchema>;
type FilterDto = yup.InferType<typeof filterSchema>;
type ParamsDto = yup.InferType<typeof paramsSchema>;
type OptionsDto = Omit<FilterDto, "page"> & { 
  skip: number; 
  minDate?: Date;
  excludeDeleted?: boolean;
  includeDeleted?: boolean;
};
type PaginationDto = yup.InferType<typeof paginationSchema>;

export { filterSchema, paramsSchema, querySchema };
export type { FilterDto, OptionsDto, PaginationDto, ParamsDto, QueryDto };
