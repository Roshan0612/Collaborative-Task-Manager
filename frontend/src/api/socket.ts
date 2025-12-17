import { io as client } from 'socket.io-client';

const URL = (import.meta.env.VITE_API_URL?.replace('/api/v1', '')) || 'http://localhost:5000';
export const socket = client(URL, { withCredentials: true });
