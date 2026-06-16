import type { FilterDto } from "../../common/dtos/query.dto";
import time from "../../common/utils/time";
import ScheduleModel from "./models/schedule.model";
import {
  type CreateScheduleDto,
  type ScheduleAdminQueryDto,
  type ScheduleParamsDto,
  type UpdateScheduleDto,
} from "./schedule.dto";

const scheduleService = {
  create: async (query: FilterDto, body: CreateScheduleDto) => {
    const scheduleDate = time.parseDate(body.scheduleDate);

    const startTime = time.applyTime({
      date: body.scheduleDate,
      hour: body.startTime,
    });

    const endTime = time.applyTime({
      date: body.scheduleDate,
      hour: body.endTime,
    });

    const capacity = body.capacity || 100;

    const data = {
      serviceId: query.serviceId,
      scheduleDate,
      startTime,
      endTime,
      capacity: body.capacity || capacity,
      quota: body.capacity || capacity,
    } as unknown as CreateScheduleDto;
    const doc = await ScheduleModel.create(data);
    const result = doc.toObject({
      transform: (doc, ret) => {
        const { __v, ...rest } = ret;
        return rest;
      },
    });
    return result;
  },
  findAllAdmin: async (query: ScheduleAdminQueryDto) => {
    const { page, limit, includeDeleted, ...params } = query;
    const skip = (page - 1) * limit;

    const options = { skip, limit, includeDeleted, ...params };
    const { data, pagination } = await ScheduleModel.findAllAdmin(options);

    const result = data.map((item) => {
      return {
        scheduleId: item.scheduleId,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        scheduleDate: item.scheduleDate,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
        capacity: item.capacity,
        quota: item.quota,
        registrants: item.registrants,
        deletedAt: item.deletedAt,
      };
    });

    return { data: result, pagination };
  },
  findAllPublic: async (query: FilterDto) => {
    const { serviceId } = query;
    const minDate = time.minDate(7);

    const options = { serviceId, minDate };
    const { data } = await ScheduleModel.findAllPublic(options);

    const result = data.map((item) => {
      return {
        scheduleId: item.scheduleId,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        scheduleDate: item.scheduleDate,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
        capacity: item.capacity,
        quota: item.quota,
        registrants: item.registrants,
      };
    });

    return { data: result };
  },

  update: async (params: ScheduleParamsDto, body: UpdateScheduleDto) => {
    const existingSchedule = await ScheduleModel.findOne({
      _id: params.scheduleId,
      deletedAt: null,
    });
    if (!existingSchedule) {
      throw new Error("Jadwal tidak ditemukan atau sudah dihapus");
    }
    // Handle Capacity & Quota Logic
    if (
      body.capacity !== undefined &&
      body.capacity !== existingSchedule.capacity
    ) {
      const capacityDiff = body.capacity - existingSchedule.capacity;
      const newQuota = existingSchedule.quota + capacityDiff;

      const registrants = existingSchedule.capacity - existingSchedule.quota;
      if (body.capacity < registrants) {
        throw new Error(
          `Capacity tidak boleh kurang dari jumlah pendaftar (${registrants} orang)`,
        );
      }
      body.quota = Math.max(0, newQuota);
    }

    const payload: any = { ...body };

    if (body.scheduleDate && body.startTime && body.endTime) {
      payload.scheduleDate = time.parseDate(body.scheduleDate);

      payload.startTime = time.applyTime({
        date: body.scheduleDate,
        hour: body.startTime,
      });

      payload.endTime = time.applyTime({
        date: body.scheduleDate,
        hour: body.endTime,
      });
    }

    const data = await ScheduleModel.findOneAndUpdate(
      { _id: params.scheduleId, deletedAt: null },
      { $set: payload },
      { new: true },
    );
    return data;
  },
  remove: async (params: ScheduleParamsDto) => {
    const data = await ScheduleModel.findByIdAndUpdate(
      {
        _id: params.scheduleId,
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      },
      {
        new: true,
      },
    );
    return data;
  },
};

export default scheduleService;
