import { Model, Types } from "mongoose";
import {
  FindAllEnrollOptionsDto,
  GetScheduleEnrollOptionsDto,
  SubmitEnrollParamsDto,
} from "./dtos/enrollment.req.dto";
import {
  FindAllEnrollResponseDto,
  FindParticipantResponseDto,
  GetScheduleEnrollResponseDto,
} from "./dtos/enrollment.res.dto";

interface Enrollment {
  scheduleId: Types.ObjectId;
  participantId: Types.ObjectId;
  paymentId: string;
  paymentProof: string;
  paymentDate: Date;
  candidate: {
    fullName: string;
    gender: string;
    birthDate: Date;
    email: string;
    phoneNumber: number;
    nim: string;
    faculty: string;
    major: string;
  };
  status: string;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  hash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EnrollModel extends Model<Enrollment> {
  findAll: (
    options: FindAllEnrollOptionsDto,
  ) => Promise<FindAllEnrollResponseDto>;
  getScheduleParticipants: (
    options: GetScheduleEnrollOptionsDto,
  ) => Promise<GetScheduleEnrollResponseDto>;
  findParticipant: (
    options: SubmitEnrollParamsDto,
  ) => Promise<FindParticipantResponseDto>;
}

type EnrollPinataJson = Enrollment["candidate"] & {
  serviceName: string;
  scheduleDate: Date;
  listening: number;
  reading: number;
  structure: number;
  totalScore: number;
};

export type { Enrollment, EnrollModel, EnrollPinataJson };
