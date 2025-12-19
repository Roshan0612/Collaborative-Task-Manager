import { useState } from 'react';
import { http } from '../api/http';
import { useAuth } from '../hooks/useAuth';

type TaskItemProps = {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignedToId: string;
    creatorId: string;
    dueDate?: string;
  };
  onStatusChange?: () => void;
  showFullDetails?: boolean;
};

export function TaskItem({ task, onStatusChange, showFullDetails = false }: TaskItemProps) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  
  const isAssignedUser = user?.id === task.assignedToId;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === task.status) return;
    
    try {
      setIsUpdating(true);
      setError('');
      await http.put(`/tasks/${task.id}`, { status: newStatus });
      onStatusChange?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'TODO': 'bg-red-100 text-red-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'REVIEW': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'LOW': 'text-green-600',
      'MEDIUM': 'text-yellow-600',
      'HIGH': 'text-orange-600',
      'URGENT': 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="border p-3 rounded bg-white hover:bg-gray-50 transition">
      <div className="flex justify-between items-start gap-2 flex-wrap">
        <div className="flex-1">
          <div className="font-medium text-sm">{task.title}</div>
          {showFullDetails && task.description && (
            <div className="text-xs text-gray-600 mt-1">{task.description}</div>
          )}
          {showFullDetails && task.dueDate && (
            <div className="text-xs text-gray-500 mt-1">
              Due: {new Date(task.dueDate).toLocaleString()}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {isAssignedUser && (
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className={`text-xs px-2 py-1 rounded border cursor-pointer ${getStatusColor(task.status)} ${
                isUpdating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}
          
          {!isAssignedUser && (
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          )}
          
          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      {isAssignedUser && (
        <div className="text-xs text-blue-600 mt-1">You are assigned to this task</div>
      )}
    </div>
  );
}
