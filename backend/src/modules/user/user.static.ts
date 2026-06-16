import mongoose, { PipelineStage } from "mongoose";
import { UserStatic } from "./dtos/user.interface";

const userStatic = {
  async findActivity(this: UserStatic, participantId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: { participantId: new mongoose.Types.ObjectId(participantId) },
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "schedules",
          localField: "scheduleId",
          foreignField: "_id",
          as: "schedule",
        },
      },
      {
        $unwind: { path: "$schedule", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "services",
          localField: "schedule.serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          enrollId: "$_id",
          participantId: 1,
          scheduleDate: "$schedule.scheduleDate",
          serviceName: "$service.name",
          status: 1,
          hash: 1,
        },
      },
    ];
    return this.aggregate(pipeline);
  },
};

export default userStatic;
