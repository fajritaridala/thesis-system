import { Types } from "mongoose";

interface FindActivityResponse {
  enrollId: string | Types.ObjectId;
  participantId: string | Types.ObjectId;
  scheduleDate: Date;
  serviceName: string;
  status: string;
  hash: string;
}

export type { FindActivityResponse };
