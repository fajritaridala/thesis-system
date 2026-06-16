import { Response } from "express";
import {
  ParamsDto,
  QueryDto,
  paramsSchema,
  querySchema,
} from "../../common/dtos/query.dto";
import response from "../../common/utils/response";
import type { ReqUser } from "../auth/auth.dto";
import {
  CreateServiceDto,
  UpdateServiceDto,
  createServiceSchema,
  updateServiceSchema,
} from "./service.dto";
import serviceService from "./service.service";

const serviceController = {
  findAll: async (req: ReqUser, res: Response) => {
    const query: QueryDto = await querySchema.validate(req.query);
    const result = await serviceService.findAll(query);
    return response.success(res, result, "berhasil mendapatkan daftar layanan");
  },
  create: async (req: ReqUser, res: Response) => {
    const body: CreateServiceDto = await createServiceSchema.validate(req.body);
    const result = await serviceService.create(body);
    return response.success(res, result, "layanan berhasil dibuat");
  },
  update: async (req: ReqUser, res: Response) => {
    const params: ParamsDto = await paramsSchema.validate(req.params);
    const body: UpdateServiceDto = await updateServiceSchema.validate(req.body);
    const result = await serviceService.update(params, body);
    return response.success(res, result, "layanan berhasil diperbarui");
  },
  remove: async (req: ReqUser, res: Response) => {
    const params: ParamsDto = await paramsSchema.validate(req.params);
    const result = await serviceService.remove(params);
    return response.success(res, result, "layanan berhasil dihapus");
  },
};

export default serviceController;
