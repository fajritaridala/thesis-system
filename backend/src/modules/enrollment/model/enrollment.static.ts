import mongoose, { PipelineStage } from "mongoose";
import { STATUS } from "../enrollment.constant";
import {
  FindAllEnrollOptionsDto,
  GetScheduleEnrollOptionsDto,
  SubmitEnrollParamsDto,
} from "../dtos/enrollment.req.dto";
import { EnrollModel } from "../enrollment.interface";

const enrollStatic = {
  async findAll(this: EnrollModel, options: FindAllEnrollOptionsDto) {
    const { skip = 0, limit = 10, status, search } = options;
    const matchQuery: Record<string, any> = {};

    if (status) {
      matchQuery.status = status;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      matchQuery.$or = [
        { "candidate.fullName": regex },
        { "candidate.email": regex },
        { "candidate.nim": regex },
      ];
    }

    const pipeline: PipelineStage[] = [
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          rows: [
            { $skip: skip },
            { $limit: limit },
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
            {
              $unwind: { path: "$service", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                _id: 0,
                enrollId: "$_id",
                scheduleId: 1,
                participantId: 1,
                scheduleDate: "$schedule.scheduleDate",
                serviceName: "$service.name",
                paymentProof: 1,
                paymentDate: 1,
                status: 1,
                fullName: "$candidate.fullName",
                gender: "$candidate.gender",
                birthDate: "$candidate.birthDate",
                email: "$candidate.email",
                phoneNumber: "$candidate.phoneNumber",
                nim: "$candidate.nim",
                faculty: "$candidate.faculty",
                major: "$candidate.major",
                registerAt: "$createdAt",
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await this.aggregate(pipeline).exec();
    console.log(result[0])
    const facetResult = result[0];
    const rows = facetResult?.rows || [];
    const total = facetResult?.total[0]?.count || 0;

    const current = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data: rows,
      pagination: {
        current,
        total,
        totalPages,
      },
    };
  },
  async getScheduleParticipants(
    this: EnrollModel,
    options: GetScheduleEnrollOptionsDto,
  ) {
    const { skip = 0, limit = 10, scheduleId, search } = options;
    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: {
        scheduleId: new mongoose.Types.ObjectId(scheduleId),
      },
    });

    if (search) {
      const regex = { $regex: search, $options: "i" };
      pipeline.push({
        $match: {
          $or: [
            { "candidate.fullName": regex },
            { "candidate.email": regex },
            { "candidate.nim": regex },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        rows: [
          { $sort: { createdAt: -1 } },
          {
            $skip: skip,
          },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              paymentProof: 1,
              paymentDate: 1,
              status: 1,
              fullName: "$candidate.fullName",
              gender: "$candidate.gender",
              email: "$candidate.email",
              phoneNumber: "$candidate.phoneNumber",
              nim: "$candidate.nim",
              faculty: "$candidate.faculty",
              major: "$candidate.major",
              registerAt: "$createdAt",
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    });

    const result = await this.aggregate(pipeline).exec();
    const facetResult = result[0];
    const rows = facetResult?.rows || [];
    const total = facetResult?.total[0]?.count || 0;

    const current = Math.floor(skip / limit + 1);
    const totalPages = Math.ceil(total / limit);

    return {
      data: rows,
      pagination: {
        current,
        total,
        totalPages,
      },
    };
  },
  async findParticipant(this: EnrollModel, options: SubmitEnrollParamsDto) {
    const pipeline: PipelineStage[] = [];

    pipeline.push(
      {
        $match: {
          _id: new mongoose.Types.ObjectId(options.enrollId),
          participantId: new mongoose.Types.ObjectId(options.participantId),
          status: STATUS.APPROVED,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participantId",
          foreignField: "_id",
          as: "participant",
        },
      },
      {
        $unwind: {
          path: "$participant",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "schedules",
          localField: "scheduleId",
          foreignField: "_id",
          as: "schedule",
        },
      },
      {
        $unwind: {
          path: "$schedule",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "schedule.serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: {
          path: "$service",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          certificate: {
            serviceName: "$service.name",
            scheduleDate: "$schedule.scheduleDate",
            fullName: "$candidate.fullName",
            gender: "$candidate.gender",
            birthDate: "$candidate.birthDate",
            email: "$candidate.email",
            phoneNumber: "$candidate.phoneNumber",
            nim: "$candidate.nim",
            faculty: "$candidate.faculty",
            major: "$candidate.major",
            registerAt: "$createdAt",
          },
          address: "$participant.address",
        },
      },
    );

    const result = await this.aggregate(pipeline).exec();
    return result[0];
  },
};

export default enrollStatic;
