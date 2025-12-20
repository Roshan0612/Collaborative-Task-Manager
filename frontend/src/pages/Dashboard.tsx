import { useAuth } from '../hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../api/http';
import { socket } from '../api/socket';
import { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import { TaskForm } from './TaskForm';
import { Profile } from './Profile';
import { TaskItem } from '../components/TaskItem';
import { Navbar } from '../components/Navbar';
import styles from './Dashboard.module.css';

type PageView = 'dashboard' | 'profile';

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
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [showTaskFormModal, setShowTaskFormModal] = useState(false);

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
      {/* Navbar */}
      <Navbar
        onCreateTaskClick={() => setShowTaskFormModal(true)}
        onProfileClick={() => setCurrentPage('profile')}
      />

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {currentPage === 'profile' ? (
          <Profile onBack={() => setCurrentPage('dashboard')} />
        ) : (
          <div className={styles.dashboardContent}>
            <div style={{ maxWidth: '7xl', margin: '0 auto' }}>
              <div className={styles.dashboardHeader}>
                <h1 className={styles.dashboardTitle}>Dashboard</h1>
              </div>

              <div className={styles.gridContainer}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Filters</h2>
                  <div className={styles.filterGroup}>
                    <select className={styles.filterSelect} value={status} onChange={(e)=>setStatus(e.target.value)}>
                      <option value="">All Status</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <select className={styles.filterSelect} value={priority} onChange={(e)=>setPriority(e.target.value)}>
                      <option value="">All Priority</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                    <select className={styles.filterSelect} value={sort} onChange={(e)=>setSort(e.target.value as any)}>
                      <option value="none">No Sort</option>
                      <option value="asc">Due Date Asc</option>
                      <option value="desc">Due Date Desc</option>
                    </select>
                  </div>
                </div>

                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>All Tasks</h2>
                  {listQuery.isLoading ? (
                    <div className={styles.loadingText}>Loading tasks...</div>
                  ) : (
                    <ul className={styles.tasksList}>
                      {listQuery.data?.map((t: any) => (
                        <TaskItem
                          key={t.id}
                          task={t}
                          onStatusChange={() => {
                            qc.invalidateQueries({ queryKey: ['tasks'] });
                            qc.invalidateQueries({ queryKey: ['dashboard'] });
                          }}
                          showFullDetails
                        />
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className={styles.multiCardGrid}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>My Tasks (created/assigned)</h2>
                  {dashQuery.isLoading ? <div className={styles.loadingText}>Loading...</div> : (
                    <ul className={styles.tasksList}>
                      {dashQuery.data?.mine?.map((t: any) => (
                        <TaskItem
                          key={t.id}
                          task={t}
                          onStatusChange={() => {
                            qc.invalidateQueries({ queryKey: ['tasks'] });
                            qc.invalidateQueries({ queryKey: ['dashboard'] });
                          }}
                        />
                      ))}
                    </ul>
                  )}
                </div>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Overdue</h2>
                  {dashQuery.isLoading ? <div className={styles.loadingText}>Loading...</div> : (
                    <ul className={styles.tasksList}>
                      {dashQuery.data?.overdue?.map((t: any) => (
                        <li key={t.id} className={styles.overdueItem}>
                          <span className={styles.overdueName}>{t.title}</span>
                          <span className={styles.overdueDate}>{new Date(t.dueDate).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showTaskFormModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Task</h2>
              <button
                onClick={() => setShowTaskFormModal(false)}
                className={styles.closeButton}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <TaskForm onSuccess={() => {
                setShowTaskFormModal(false);
                qc.invalidateQueries({ queryKey: ['tasks'] });
                qc.invalidateQueries({ queryKey: ['dashboard'] });
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
