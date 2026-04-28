import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: (data) => api.post('/auth/logout', data),
};

export const voiceAPI = {
  list: () => api.get('/voices'),
  all: () => api.get('/voices/all'),
  create: (data) => api.post('/voices', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/voices/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/voices/${id}`),
};

export const orderAPI = {
  calculate: (data) => api.post('/orders/calculate', data),
  create: (data) => api.post('/orders', data),
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
};

export const paymentAPI = {
  createIntent: (data) => api.post('/payments/intent', data),
  createCreditIntent: (data) => api.post('/payments/credit-intent', data),
};

export const creditAPI = {
  balance: () => api.get('/credits/balance'),
  transactions: (params) => api.get('/credits/transactions', { params }),
};

export const settingsAPI = {
  public: () => api.get('/settings/public'),
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  orders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),
  uploadAudio: (id, data) => api.post(`/admin/orders/${id}/audio`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  users: (params) => api.get('/admin/users', { params }),
  adjustCredits: (id, data) => api.patch(`/admin/users/${id}/credits`, data),
  reports: (params) => api.get('/admin/reports', { params }),
};

export default api;
