import api from './api';

export const signup = (data) => api.post('/api/auth/signup', data);
export const login = (data) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');
export const updateProfile = (data) => api.put('/api/auth/profile', data);

export const getProjects = () => api.get('/api/projects');
export const getProject = (id) => api.get(`/api/projects/${id}`);
export const createProject = (data) => api.post('/api/projects', data);
export const updateProject = (id, data) => api.put(`/api/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/api/projects/${id}`);
export const addMember = (id, data) => api.post(`/api/projects/${id}/members`, data);
export const removeMember = (id, userId) => api.delete(`/api/projects/${id}/members/${userId}`);

export const getTasks = (params) => api.get('/api/tasks', { params });
export const getTask = (id) => api.get(`/api/tasks/${id}`);
export const createTask = (data) => api.post('/api/tasks', data);
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);
export const reorderTasks = (data) => api.put('/api/tasks/reorder', data);

export const getDashboardStats = () => api.get('/api/dashboard/stats');

export const getActivities = (params) => api.get('/api/activity', { params });
