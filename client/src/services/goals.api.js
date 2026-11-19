import api from './api.js';

export const goalsApi = {
  getAll: (params) => api.get('/goals', { params }),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.patch(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

export default goalsApi;
