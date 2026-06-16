import { Model, Types } from "mongoose";
import { ScheduleResponseDto } from "./schedule.dto";

interface Schedule {
  serviceId: Types.ObjectId;
  scheduleDate: Date;
  startTime: Date;
  endTime: Date;
  status: string;
  capacity: number;
  quota: number;
  registrants: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface AdminOptions {
  skip: number;
  limit: number;
  serviceId?: string;
  status?: string;
  month?: number;
  includeDeleted?: boolean;
}

interface PublicOptions {
  serviceId?: string;
  minDate: Date;
}

interface ScheduleModel extends Model<Schedule> {
  findAllAdmin(options: AdminOptions): Promise<ScheduleResponseDto["findAll"]>;
  findAllPublic(
    options: PublicOptions,
  ): Promise<ScheduleResponseDto["findAll"]>;
}

export type { Schedule, ScheduleModel, AdminOptions, PublicOptions };
