import axios, { InternalAxiosRequestConfig } from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://ololade-sule.wl.r.appspot.com/', // Your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the auth token for all requests
axiosClient.interceptors.request.use(function (config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem('token');
  if (config.headers) {
    config.headers['x-access-token'] = token ? token : '';
  }
  return config;
});

export default axiosClient;
