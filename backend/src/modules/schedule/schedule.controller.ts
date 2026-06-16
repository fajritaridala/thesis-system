import type { Request, Response } from "express";
import { FilterDto, filterSchema } from "../../common/dtos/query.dto";
import response from "../../common/utils/response";
import { ReqUser } from "../auth/auth.dto";
import {
  type CreateScheduleDto,
  type ScheduleAdminQueryDto,
  type ScheduleParamsDto,
  type UpdateScheduleDto,
  createScheduleSchema,
  scheduleAdminQuerySchema,
  scheduleParamsSchema,
  updateScheduleSchema,
} from "./schedule.dto";
import scheduleService from "./schedule.service";

const scheduleController = {
  create: async (req: ReqUser, res: Response) => {
    const query: FilterDto = await filterSchema.validate(req.query);
    const body: CreateScheduleDto = await createScheduleSchema.validate(
      req.body,
    );
    const result = await scheduleService.create(query, body);
    return response.success(res, result, "jadwal berhasil dibuat");
  },
  findAllAdmin: async (req: ReqUser, res: Response) => {
    console.log(req.query)
    const baseQuery: FilterDto = await filterSchema.validate(req.query);
    const adminQuery = await scheduleAdminQuerySchema.validate(req.query);
    const query: ScheduleAdminQueryDto = { ...baseQuery, ...adminQuery };
    const result = await scheduleService.findAllAdmin(query);
    return response.pagination({
      res,
      data: result.data,
      pagination: result.pagination,
      message: "jadwal berhasil ditemukan",
    });
  },
  findAllPublic: async (req: Request, res: Response) => {
    const query: FilterDto = await filterSchema.validate(req.query);
    const result = await scheduleService.findAllPublic(query);
    return response.success(res, result.data, "jadwal berhasil ditemukan");
  },

  update: async (req: ReqUser, res: Response) => {
    const params: ScheduleParamsDto = await scheduleParamsSchema.validate(
      req.params,
    );
    const body: UpdateScheduleDto = await updateScheduleSchema.validate(
      req.body,
    );
    const result = await scheduleService.update(params, body);
    return response.success(res, result, "jadwal berhasil diperbarui");
  },
  remove: async (req: ReqUser, res: Response) => {
    const params: ScheduleParamsDto = await scheduleParamsSchema.validate(
      req.params,
    );
    const result = await scheduleService.remove(params);
    return response.success(res, result, "jadwal berhasil dihapus");
  },
};

export default scheduleController;
