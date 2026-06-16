import endpoints from '@/constants/endpoints';
import instance from '@/lib/axios/instance';

// NOTE: User akan refactor fitur ini untuk langsung ke Pinata
// Untuk sementara endpoint diupdate agar tidak terjadi compile error
const verificationService = {
  getVerification: (cid: string) =>
    instance.get(endpoints.VERIFY, {
      params: { cid },
    }),
};

export default verificationService;
