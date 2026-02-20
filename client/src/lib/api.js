import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const registerUser = (userData) => api.post('/users/register', userData);
export const getUsers = (params) => api.get('/users', { params });
export const toggleArrived = (id) => api.put(`/users/${id}/arrive`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const adminLogin = (password) => api.post('/users/admin/login', { password });

export default api;
