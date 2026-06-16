import { type PipelineStage, Types } from "mongoose";
import type { OptionsDto } from "../../../common/dtos/query.dto";
import type { ScheduleModel } from "../schedule.interface";

interface AdminOptions {
  skip: number;
  limit: number;
  serviceId?: string;
  status?: string;
  month?: number;
  includeDeleted?: boolean;
}

interface PublicOptions {
  skip: number;
  limit: number;
  serviceId?: string;
  minDate: Date;
}

async function findAllAdmin(this: ScheduleModel, options: AdminOptions) {
  const { skip, limit, serviceId, status, month, includeDeleted } = options;
  const pipeline: PipelineStage[] = [];
  console.log(options)

  // Default: exclude deleted records unless includeDeleted is true
  if (!includeDeleted) {
    pipeline.push({
      $match: { deletedAt: null },
    });
  }

  if (serviceId) {
    pipeline.push({
      $match: { serviceId: new Types.ObjectId(serviceId) },
    });
  }

  if (status) {
    pipeline.push({
      $match: { status },
    });
  }

  if (month) {
    pipeline.push({
      $match: {
        $expr: {
          $eq: [{ $month: "$scheduleDate" }, month],
        },
      },
    });
  }

  pipeline.push({
    $facet: {
      data: [
        {
          $sort: {
            scheduleDate: 1,
          },
        },
        {
          $skip: skip,
        },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
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
            scheduleId: "$_id",
            scheduleDate: 1,
            startTime: 1,
            endTime: 1,
            status: 1,
            capacity: 1,
            quota: 1,
            serviceId: 1,
            serviceName: "$service.name",
            registrants: 1,
            deletedAt: 1,
          },
        },
      ],
      counts: [{ $count: "count" }],
    },
  });

  const result = await this.aggregate(pipeline);
  const data = result[0].data;
  const total = result[0].counts[0]?.count || 0;

  const current = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      current,
      total,
      totalPages,
    },
  };
}

async function findAllPublic(this: ScheduleModel, options: PublicOptions) {
  const { serviceId, minDate } = options;
  const pipeline: PipelineStage[] = [];

  // Always exclude deleted records for public
  pipeline.push({
    $match: { deletedAt: null },
  });

  if (serviceId) {
    pipeline.push({
      $match: { serviceId: new Types.ObjectId(serviceId) },
    });
  }

  // Filter by minimum date
  pipeline.push({
    $match: {
      scheduleDate: { $gte: minDate },
    },
  });

  pipeline.push({
    $sort: {
      scheduleDate: 1,
    },
  });

  pipeline.push({
    $lookup: {
      from: "services",
      localField: "serviceId",
      foreignField: "_id",
      as: "service",
    },
  });

  pipeline.push({
    $unwind: {
      path: "$service",
      preserveNullAndEmptyArrays: true,
    },
  });

  pipeline.push({
    $project: {
      _id: 0,
      scheduleId: "$_id",
      scheduleDate: 1,
      startTime: 1,
      endTime: 1,
      status: 1,
      capacity: 1,
      quota: 1,
      serviceId: 1,
      serviceName: "$service.name",
      registrants: 1,
    },
  });

  const data = await this.aggregate(pipeline);

  return { data };
}

export { findAllAdmin, findAllPublic };
