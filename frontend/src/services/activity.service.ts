import endpoints from '@/constants/endpoints';
import instance from '@/lib/axios/instance';

export interface ActivityItem {
  enrollId: string;
  participantId: string;
  serviceName: string;
  scheduleDate: string;
  status: string; // 'menunggu' | 'disetujui' | 'ditolak' | 'selesai'
  hash?: string;
}

interface ActivityResponse {
  success: boolean;
  message: string;
  data: ActivityItem[];
}

export const activityService = {
  getActivity: () => {
    return instance.get<ActivityResponse>(endpoints.USERS + '/activity');
  },
};
