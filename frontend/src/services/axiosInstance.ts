import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,

  // Send cookies with every request (for HTTP-only JWT cookies)
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

//resonse
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isMeRequest = error.config?.url?.includes('/auth/me');
    // Handle 401 globally (token expired)
    if (error.response?.status === 401 && !isLoginRequest && isMeRequest) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
