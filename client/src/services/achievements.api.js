import api from './api.js';

export const achievementsApi = {
  getAll: () => api.get('/achievements'),
  getProgress: () => api.get('/achievements/progress'),
};

export default achievementsApi;
