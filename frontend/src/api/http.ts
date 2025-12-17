import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const http = axios.create({ baseURL, withCredentials: true });

// Optional: handle 401 globally
http.interceptors.response.use(
  (res: any) => res,
  (err: any) => {
    if (err?.response?.status === 401) {
      // You could auto-logout here if desired
    }
    return Promise.reject(err);
  }
);
