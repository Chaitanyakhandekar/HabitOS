import axios from 'axios';

const backendUrl =
  import.meta.env.VITE_ENV === 'production'
    ? import.meta.env.VITE_BACKEND_URL_PROD || ''
    : import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to unwrap data and handle 401s
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      status: error.response?.status,
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(customError);
  }
);

export default api;
