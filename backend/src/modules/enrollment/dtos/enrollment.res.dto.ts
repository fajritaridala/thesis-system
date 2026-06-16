import { Types } from "mongoose";
import { PaginationDto } from "../../../common/dtos/query.dto";
import { RegisterEnrollDto } from "./enrollment.req.dto";

interface EnrollmentItem extends RegisterEnrollDto {
  enrollId: Types.ObjectId | string;
  scheduleId: Types.ObjectId | string;
  participantId: Types.ObjectId | string;
  serviceName: string;
  paymentProof: string;
  paymentDate: Date;
  scheduleDate: Date;
  status: string;
  registerAt: Date;
}

interface FindAllEnrollResponseDto {
  data: EnrollmentItem[];
  pagination: PaginationDto;
}

interface GetScheduleEnrollResponseDto {
  data: Omit<FindAllEnrollResponseDto["data"], "scheduleId" | "scheduleDate">;
  pagination: PaginationDto;
}

interface FindParticipantResponseDto {
  certificate: Omit<RegisterEnrollDto, "paymentDate"> & {
    serviceName: string;
    scheduleDate: Date;
  };
  address: string;
}

export type {
  FindAllEnrollResponseDto,
  FindParticipantResponseDto,
  GetScheduleEnrollResponseDto,
};
