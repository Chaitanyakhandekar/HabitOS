import api from './api.js';

export const analyticsApi = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getHeatmap: (params) => api.get('/analytics/heatmap', { params }),
  getHabitAnalytics: (habitId, params) => api.get(`/analytics/habit/${habitId}`, { params }),
  getInsights: () => api.get('/analytics/insights'),
};

export default analyticsApi;
