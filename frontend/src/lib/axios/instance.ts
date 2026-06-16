import axios from 'axios';
import { getSession } from 'next-auth/react';
import { SessionExt } from '@/types/auth.types';
import { API_URL } from '@/utils/config/env';

const headers = {
  'Content-Type': 'application/json',
};

const instance = axios.create({
  baseURL: API_URL,
  headers,
  timeout: 60 * 1000, // 60 seconds
});

// Menyiapkan request sebelum dikirim ke server
instance.interceptors.request.use(
  async (request) => {
    const session = (await getSession()) as SessionExt | null;
    if (session && session.user?.accessToken) {
      request.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

// Mempersiapkan response dari server
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;
    const { message } = response.data;
    error.message = message;
    return Promise.reject(error);
  }
);

export default instance;
