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
    // Handle 401 globally (token expired)
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;