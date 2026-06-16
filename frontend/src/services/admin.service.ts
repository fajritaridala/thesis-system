import endpoints from '@/constants/endpoints';
import instance from '@/lib/axios/instance';
import {
  EnrollmentStatus,
  SchedulePayload,
  ScheduleRegister,
  ScheduleStatus,
} from '@/types/admin.types';
import buildQueryString from '@/utils/helpers/queryString';

type GetServicesQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

type GetServicesParams = string | GetServicesQuery;

type CreateServicePayload = {
  name: string;
  description: string;
  price: number;
  notes?: string;
};

type UpdateServicePayload = {
  name?: string;
  description?: string;
  price?: number;
  notes?: string;
};

export const servicesService = {
  getServices: (query?: GetServicesParams) => {
    const queryString = buildQueryString(query);
    const url = queryString
      ? `${endpoints.SERVICES}?${queryString}`
      : endpoints.SERVICES;
    return instance.get(url);
  },
  createService: (payload: CreateServicePayload) => {
    return instance.post(`${endpoints.SERVICES}`, payload);
  },
  updateService: (id: string, payload: UpdateServicePayload) => {
    return instance.patch(`${endpoints.SERVICES}/${id}`, payload);
  },
  removeService: (id: string) => {
    return instance.delete(`${endpoints.SERVICES}/${id}`);
  },
};

type GetScheduleQuery = {
  page?: number;
  limit?: number;
  search?: string;
  serviceId?: string;
  status?: ScheduleStatus;
  month?: string;
  includeDeleted?: boolean;
};

type GetScheduleParams = string | GetScheduleQuery;

export const schedulesService = {
  getSchedules: (query?: GetScheduleParams) => {
    const queryString = buildQueryString(query);
    const url = queryString
      ? `${endpoints.SCHEDULES}?${queryString}`
      : endpoints.SCHEDULES;
    return instance.get(url);
  },
  getAdminSchedules: (query?: GetScheduleParams) => {
    const queryString = buildQueryString(query);
    const url = queryString
      ? `${endpoints.SCHEDULES}/admin?${queryString}`
      : `${endpoints.SCHEDULES}/admin`;
    return instance.get(url);
  },
  createSchedule: (payload: SchedulePayload) => {
    const { serviceId, ...rest } = payload;
    if (!serviceId) {
      throw new Error('serviceId is required to create schedule');
    }
    const queryString = buildQueryString({ serviceId });
    return instance.post(`${endpoints.SCHEDULES}?${queryString}`, rest);
  },
  updateSchedule: (scheduleId: string, payload: Partial<SchedulePayload>) => {
    return instance.patch(
      `${endpoints.SCHEDULES}/${scheduleId}/update`,
      payload
    );
  },
  removeSchedule: (scheduleId: string) => {
    return instance.patch(`${endpoints.SCHEDULES}/${scheduleId}/delete`);
  },
};

type EnrollmentQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: EnrollmentStatus;
  serviceId?: string;
  scheduleId?: string;
};

export const enrollmentsService = {
  getEnrollments: (query?: EnrollmentQuery) => {
    const queryString = buildQueryString(query);
    const url = queryString
      ? `${endpoints.ENROLLMENTS}?${queryString}`
      : endpoints.ENROLLMENTS;
    return instance.get(url);
  },
  getScheduleEnrollments: (scheduleId: string, query?: EnrollmentQuery) => {
    const queryString = buildQueryString(query);
    const url = queryString
      ? `${endpoints.ENROLLMENTS}/${scheduleId}?${queryString}`
      : `${endpoints.ENROLLMENTS}/${scheduleId}`;
    return instance.get(url);
  },
  register: (scheduleId: string, payload: ScheduleRegister) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'paymentProof' && value instanceof File) {
        formData.append('file', value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    return instance.post(`${endpoints.ENROLLMENTS}/${scheduleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  approve: (enrollId: string, status: 'disetujui' | 'ditolak') => {
    return instance.patch(`${endpoints.ENROLLMENTS}/${enrollId}/approval`, {
      status,
    });
  },
  submitScore: (
    enrollId: string,
    participantId: string,
    scores: { listening: number; structure: number; reading: number }
  ) => {
    return instance.patch(
      `${endpoints.ENROLLMENTS}/${enrollId}/${participantId}/submit-score`,
      scores
    );
  },
  blockchainSuccess: (
    enrollId: string,
    participantId: string,
    hash: string
  ) => {
    return instance.patch(
      `${endpoints.ENROLLMENTS}/${enrollId}/${participantId}/blockchain-success`,
      { hash }
    );
  },
};
