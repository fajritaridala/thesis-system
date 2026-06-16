import * as yup from "yup";

const verifySchema = yup.object().shape({
  cid: yup.string().required(),
});

type VerifyDto = yup.InferType<typeof verifySchema>;

export { verifySchema };
export type { VerifyDto };
