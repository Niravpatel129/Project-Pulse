import axios from 'axios';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_MOBILE = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

const getLocalUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3004';

  const hostname = window.location.hostname;
  if (hostname === 'localhost') return 'http://localhost:3004';

  const subdomain = hostname.split('.')[0];
  return `http://${subdomain}.toastify.io:3004`;
};

export const connectionUrl =
  IS_PRODUCTION || IS_MOBILE ? 'https://www.api.toastify.io' : getLocalUrl();

export const newRequest = axios.create({
  baseURL: `${connectionUrl}/api`,
  withCredentials: true,
});

newRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

newRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
    }
    return Promise.reject(error);
  },
);
