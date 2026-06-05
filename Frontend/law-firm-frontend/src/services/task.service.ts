// src/services/task.service.ts
import api from './api';
import { Task, TaskStatus, TaskPriority, TaskStats, CreateTaskDto } from '../types/index';
import { TaskAssignee, TaskComment } from '../types';

export const taskService = {
  // Get all tasks with filters
  getAllTasks: async (params?: {
    matterId?: number;
    contactId?: number;
    status?: string;
    priority?: string;
    assigneeId?: number;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<Task[]> => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get single task by ID
  getTaskById: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (data: CreateTaskDto): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // Update task
  updateTask: async (id: number, data: Partial<CreateTaskDto>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Update task status
  updateTaskStatus: async (id: number, statusId: number): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/status?statusId=${statusId}`);
    return response.data;
  },

  // Get tasks assigned to current user
  getTasksAssignedToMe: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/assigned-to-me');
    return response.data;
  },

  // Get overdue tasks
  getOverdueTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/overdue');
    return response.data;
  },

  // Get tasks due today
  getTasksDueToday: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/today');
    return response.data;
  },

  // Get tasks due this week
  getTasksDueThisWeek: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/this-week');
    return response.data;
  },

  // Get completed tasks
  getCompletedTasks: async (from?: string, to?: string): Promise<Task[]> => {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const response = await api.get('/tasks/completed', { params });
    return response.data;
  },

  // Get all task statuses
  getTaskStatuses: async (): Promise<TaskStatus[]> => {
    const response = await api.get('/tasks/statuses');
    return response.data;
  },

  // Get all task priorities
  getTaskPriorities: async (): Promise<TaskPriority[]> => {
    const response = await api.get('/tasks/priorities');
    return response.data;
  },

  // Get task statistics
  getTaskStats: async (): Promise<TaskStats> => {
    const response = await api.get('/tasks/stats');
    return response.data;
  },

  // Add assignee to task
  addAssignee: async (taskId: number, userId: number, isPrimary: boolean = false): Promise<TaskAssignee> => {
    const response = await api.post(`/tasks/${taskId}/assignees/${userId}?isPrimary=${isPrimary}`);
    return response.data;
  },

  // Remove assignee from task
  removeAssignee: async (taskId: number, userId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}/assignees/${userId}`);
  },

  // Add comment to task
  addComment: async (taskId: number, comment: string): Promise<TaskComment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, comment);
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/tasks/comments/${commentId}`);
  },
};