import { useAuth } from '../hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../api/http';
import { socket } from '../api/socket';
import { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import { TaskForm } from './TaskForm';
import styles from './Dashboard.module.css';

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW'|'MEDIUM'|'HIGH'|'URGENT';
  status: 'TODO'|'IN_PROGRESS'|'REVIEW'|'COMPLETED';
  creatorId: string;
  assignedToId: string;
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const { addNotification } = useNotifications();
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [sort, setSort] = useState<'asc'|'desc'|'none'>('none');

  const listQuery = useQuery({
    queryKey: ['tasks', { status, priority, sort }],
    queryFn: async () => {
      const params: any = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (sort !== 'none') params.sort = sort;
      const { data } = await http.get<Task[]>('/tasks', { params });
      return data;
    },
  });

  const dashQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await http.get<{ mine: Task[]; overdue: Task[] }>('/tasks/dashboard');
      return data;
    },
  });

  useEffect(() => {
    const onAny = () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    };
    socket.on('task:created', onAny);
    socket.on('task:updated', onAny);
    socket.on('task:deleted', onAny);
    const onAssigned = (payload: any) => {
      if (user && payload?.assignedToId === user.id) {
        addNotification('You were assigned a new task');
      }
      onAny();
    };
    socket.on('task:assigned', onAssigned);
    return () => {
      socket.off('task:created', onAny);
      socket.off('task:updated', onAny);
      socket.off('task:deleted', onAny);
      socket.off('task:assigned', onAssigned);
    };
  }, [qc, user, addNotification]);

  if (!user) return <div className="p-8">Please login.</div>;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button className="text-sm px-3 py-2 border rounded" onClick={logout}>Logout</button>
      </div>

      <TaskForm onSuccess={() => {
        qc.invalidateQueries({ queryKey: ['tasks'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
      }} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Filters</h2>
          <div className="space-y-2">
            <select className="border p-2 w-full" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select className="border p-2 w-full" value={priority} onChange={(e)=>setPriority(e.target.value)}>
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <select className="border p-2 w-full" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
              <option value="none">No Sort</option>
              <option value="asc">Due Date Asc</option>
              <option value="desc">Due Date Desc</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 border rounded p-4">
          <h2 className="font-semibold mb-2">All Tasks</h2>
          {listQuery.isLoading ? (
            <div></div>
          ) : (
            <ul className="space-y-2">
              {listQuery.data?.map((t: any) => (
                <li key={t.id} className="border p-2 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{t.title}</span>
                    <span className="text-xs">{new Date(t.dueDate).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">{t.description}</div>
                  <div className="text-xs">Priority: {t.priority} | Status: {t.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">My Tasks (created/assigned)</h2>
          {dashQuery.isLoading ? <div></div> : (
            <ul className="space-y-2">
              {dashQuery.data?.mine?.map((t: any) => (
                <li key={t.id} className="border p-2 rounded flex justify-between">
                  <span>{t.title}</span>
                  <span className="text-xs">{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Overdue</h2>
          {dashQuery.isLoading ? <div></div> : (
            <ul className="space-y-2">
              {dashQuery.data?.overdue?.map((t: any) => (
                <li key={t.id} className="border p-2 rounded flex justify-between">
                  <span>{t.title}</span>
                  <span className="text-xs">{new Date(t.dueDate).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
