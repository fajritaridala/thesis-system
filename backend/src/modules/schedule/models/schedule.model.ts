import mongoose from "mongoose";
import { STATUS } from "../schedule.constant";
import type { Schedule, ScheduleModel } from "../schedule.interface";
import { findAllAdmin, findAllPublic } from "./schedule.static";

const Schema = mongoose.Schema;

const ScheduleSchema = new Schema<Schedule, ScheduleModel>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "services",
    },
    scheduleDate: {
      type: Schema.Types.Date,
      required: true,
      index: true,
    },
    startTime: {
      type: Schema.Types.Date,
      required: true,
    },
    endTime: {
      type: Schema.Types.Date,
      required: true,
    },
    capacity: {
      type: Schema.Types.Number,
    },
    quota: {
      type: Schema.Types.Number,
    },
    status: {
      type: Schema.Types.String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },
    registrants: {
      type: Schema.Types.Number,
      default: 0,
    },
    deletedAt: {
      type: Schema.Types.Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    statics: {
      findAllAdmin,
      findAllPublic,
    },
  },
);

// Partial unique index - only enforces uniqueness for non-deleted schedules
ScheduleSchema.index(
  { serviceId: 1, scheduleDate: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

const ScheduleModel = mongoose.model<Schedule, ScheduleModel>(
  "schedules",
  ScheduleSchema,
);

export default ScheduleModel;
