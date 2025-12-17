import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const http = axios.create({ baseURL, withCredentials: true });

http.interceptors.response.use(
  (res: any) => res,
  (err: any) => {
    if (err?.response?.status === 401) {}
    return Promise.reject(err);
  }
);
