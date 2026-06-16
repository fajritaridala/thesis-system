import mongoose from "mongoose";
import { GENDER } from "../../../common/utils/constants";
import { UserStatic } from "../../user/dtos/user.interface";
import userStatic from "../../user/user.static";
import { Enrollment } from "../enrollment.interface";
import enrollStatic from "./enrollment.static";
import { STATUS } from "../enrollment.constant";

const Schema = mongoose.Schema;

const EnrollmentSchema = new Schema<Enrollment, UserStatic>(
  {
    scheduleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "schedules",
    },
    participantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    paymentId: {
      type: Schema.Types.String,
      required: true,
    },
    paymentProof: {
      type: Schema.Types.String,
      required: true,
    },
    paymentDate: {
      type: Schema.Types.Date,
      required: true,
    },
    candidate: {
      _id: false,
      fullName: { type: Schema.Types.String, required: true, index: true },
      gender: {
        type: Schema.Types.String,
        enum: Object.values(GENDER),
        required: true,
      },
      birthDate: { type: Schema.Types.Date, required: true },
      email: { type: Schema.Types.String, required: true },
      phoneNumber: { type: Schema.Types.Number, required: true },
      nim: { type: Schema.Types.String, required: true, index: true },
      faculty: { type: Schema.Types.String, required: true },
      major: { type: Schema.Types.String, required: true },
    },
    status: {
      type: Schema.Types.String,
      enum: Object.values(STATUS),
      default: STATUS.PENDING,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "users" },
    verifiedAt: { type: Schema.Types.Date },
    hash: { type: Schema.Types.String },
  },
  {
    timestamps: true,
    statics: {
      findAll: enrollStatic.findAll,
      getScheduleParticipants: enrollStatic.getScheduleParticipants,
      findParticipant: enrollStatic.findParticipant,
      findActivity: userStatic.findActivity,
    },
  },
);

EnrollmentSchema.index({ scheduleId: 1, participantId: 1 }, { unique: true });
EnrollmentSchema.index({ status: 1, createdAt: -1 }); // Optimize findAll with status filter + sort
EnrollmentSchema.index({ scheduleId: 1, createdAt: -1 }); // Optimize getScheduleParticipants

const EnrollmentModel = mongoose.model<Enrollment, UserStatic>(
  "enrollments",
  EnrollmentSchema,
);

export default EnrollmentModel;
