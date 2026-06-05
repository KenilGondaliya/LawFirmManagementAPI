// src/stores/taskStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Task, TaskStatus, TaskPriority, TaskStats, CreateTaskDto } from '../types/index';
import { taskService } from '../services/task.service';
import toast from 'react-hot-toast';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  stats: TaskStats | null;
  isLoading: boolean;
  
  fetchTasks: (params?: {
    matterId?: number;
    contactId?: number;
    status?: string;
    priority?: string;
    search?: string;
  }) => Promise<void>;
  fetchTaskById: (id: number) => Promise<void>;
  createTask: (data: CreateTaskDto) => Promise<Task | null>;
  updateTask: (id: number, data: Partial<CreateTaskDto>) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
  updateTaskStatus: (id: number, statusId: number) => Promise<Task | null>;
  fetchStatuses: () => Promise<void>;
  fetchPriorities: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addAssignee: (taskId: number, userId: number, isPrimary?: boolean) => Promise<void>;
  removeAssignee: (taskId: number, userId: number) => Promise<void>;
  addComment: (taskId: number, comment: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  clearSelectedTask: () => void;
}

export const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      selectedTask: null,
      statuses: [],
      priorities: [],
      stats: null,
      isLoading: false,
      
      fetchTasks: async (params) => {
        set({ isLoading: true });
        try {
          const tasks = await taskService.getAllTasks(params);
          set({ tasks, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
          toast.error('Failed to load tasks');
          set({ isLoading: false });
        }
      },
      
      fetchTaskById: async (id) => {
        set({ isLoading: true });
        try {
          const task = await taskService.getTaskById(id);
          set({ selectedTask: task, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch task:', error);
          toast.error('Failed to load task details');
          set({ isLoading: false });
        }
      },
      
      createTask: async (data) => {
        set({ isLoading: true });
        try {
          const task = await taskService.createTask(data);
          set((state) => ({ 
            tasks: [task, ...state.tasks],
            isLoading: false 
          }));
          toast.success('Task created successfully');
          return task;
        } catch (error: any) {
          console.error('Failed to create task:', error.response?.data || error);
          const errorMessage = error.response?.data?.errors 
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response?.data?.title || 'Failed to create task';
          toast.error(errorMessage);
          set({ isLoading: false });
          return null;
        }
      },
      
      updateTask: async (id, data) => {
        set({ isLoading: true });
        try {
          const task = await taskService.updateTask(id, data);
          set((state) => ({
            tasks: state.tasks.map((t) => t.id === id ? task : t),
            selectedTask: task,
            isLoading: false
          }));
          toast.success('Task updated successfully');
          return task;
        } catch (error) {
          console.error('Failed to update task:', error);
          toast.error('Failed to update task');
          set({ isLoading: false });
          return null;
        }
      },
      
      deleteTask: async (id) => {
        set({ isLoading: true });
        try {
          await taskService.deleteTask(id);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
            isLoading: false
          }));
          toast.success('Task deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete task:', error);
          toast.error('Failed to delete task');
          set({ isLoading: false });
          return false;
        }
      },
      
      updateTaskStatus: async (id, statusId) => {
        set({ isLoading: true });
        try {
          const task = await taskService.updateTaskStatus(id, statusId);
          set((state) => ({
            tasks: state.tasks.map((t) => t.id === id ? task : t),
            selectedTask: task,
            isLoading: false
          }));
          toast.success('Task status updated');
          return task;
        } catch (error) {
          console.error('Failed to update task status:', error);
          toast.error('Failed to update task status');
          set({ isLoading: false });
          return null;
        }
      },
      
      fetchStatuses: async () => {
        try {
          const statuses = await taskService.getTaskStatuses();
          set({ statuses });
        } catch (error) {
          console.error('Failed to fetch statuses:', error);
        }
      },
      
      fetchPriorities: async () => {
        try {
          const priorities = await taskService.getTaskPriorities();
          set({ priorities });
        } catch (error) {
          console.error('Failed to fetch priorities:', error);
        }
      },
      
      fetchStats: async () => {
        try {
          const stats = await taskService.getTaskStats();
          set({ stats });
        } catch (error) {
          console.error('Failed to fetch task stats:', error);
        }
      },
      
      addAssignee: async (taskId, userId, isPrimary = false) => {
        try {
          await taskService.addAssignee(taskId, userId, isPrimary);
          await get().fetchTaskById(taskId);
          toast.success('Assignee added successfully');
        } catch (error) {
          console.error('Failed to add assignee:', error);
          toast.error('Failed to add assignee');
        }
      },
      
      removeAssignee: async (taskId, userId) => {
        try {
          await taskService.removeAssignee(taskId, userId);
          await get().fetchTaskById(taskId);
          toast.success('Assignee removed successfully');
        } catch (error) {
          console.error('Failed to remove assignee:', error);
          toast.error('Failed to remove assignee');
        }
      },
      
      addComment: async (taskId, comment) => {
        try {
          await taskService.addComment(taskId, comment);
          await get().fetchTaskById(taskId);
          toast.success('Comment added successfully');
        } catch (error) {
          console.error('Failed to add comment:', error);
          toast.error('Failed to add comment');
        }
      },
      
      deleteComment: async (commentId) => {
        try {
          await taskService.deleteComment(commentId);
          const { selectedTask } = get();
          if (selectedTask) {
            await get().fetchTaskById(selectedTask.id);
          }
          toast.success('Comment deleted successfully');
        } catch (error) {
          console.error('Failed to delete comment:', error);
          toast.error('Failed to delete comment');
        }
      },
      
      clearSelectedTask: () => {
        set({ selectedTask: null });
      },
    })
  )
);