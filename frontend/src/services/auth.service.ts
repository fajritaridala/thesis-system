import endpoints from '@/constants/endpoints';
import instance from '@/lib/axios/instance';
import { IRegister } from '@/types/auth.types';

const authServices = {
  login(address: string) {
    return instance.post(`${endpoints.AUTH}/login`, { address });
  },
  register(payload: IRegister) {
    return instance.post(`${endpoints.AUTH}/register`, payload);
  },
  getProfileWithToken(token: string) {
    return instance.get(`${endpoints.AUTH}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default authServices;
