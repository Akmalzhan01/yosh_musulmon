import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export const registerUser = (userData) => api.post('/users/register', userData);
export const createUser = (userData) => api.post('/users/admin/create', userData);
export const getUsers = (params) => api.get('/users', { params });
export const toggleArrived = (id) => api.put(`/users/${id}/arrive`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const adminLogin = (password) => api.post('/users/admin/login', { password });
export const updateScore = (id, etap, ball) => api.put(`/users/${id}/scores`, { etap, ball });
export const deleteScore = (id, etap) => api.delete(`/users/${id}/scores/${etap}`);
export const migrateIds = () => api.post('/users/admin/migrate-ids');
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

export default api;
