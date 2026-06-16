import * as yup from "yup";

const createServiceSchema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string().required(),
  price: yup.number().required().min(0),
  notes: yup.string().optional().nullable(),
});

const updateServiceSchema = createServiceSchema.partial();

type CreateServiceDto = yup.InferType<typeof createServiceSchema>;
type UpdateServiceDto = yup.InferType<typeof updateServiceSchema>;

export { createServiceSchema, updateServiceSchema };
export type { CreateServiceDto, UpdateServiceDto };
