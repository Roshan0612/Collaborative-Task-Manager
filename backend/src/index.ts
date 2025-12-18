import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/tasks.routes';
import notificationsRoutes from './routes/notifications.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Configuring Express app...');

console.log('Configuring Express app...');

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

console.log('Registering routes...');

app.get('/', (req, res) => {
  console.log('GET / called');
  res.json({ message: 'Collaborative Task Manager API', status: 'running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

console.log('Creating HTTP server...');

const server = http.createServer(app);

console.log('Setting up Socket.io...');

export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
});

console.log('Starting server on port:', PORT);

server.listen(PORT, () => {
  console.log(`✓ Server listening on http://localhost:${PORT}`);
});

server.on('error', (error: any) => {
  console.error('✗ Server error:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('✗ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

