import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Services pour les offres d'emploi
export const jobsApi = {
  getJobs: (params = {}) => apiClient.get('/jobs', { params }),
  getJobById: (id: string) => apiClient.get(`/jobs/${id}`),
  createJob: (jobData: any) => apiClient.post('/jobs', jobData),
  updateJob: (id: string, jobData: any) => apiClient.put(`/jobs/${id}`, jobData),
  deleteJob: (id: string) => apiClient.delete(`/jobs/${id}`),
  applyToJob: (id: string, applicationData: any) => apiClient.post(`/jobs/${id}/apply`, applicationData),
};

// Services pour l'authentification
export const authApi = {
  login: (credentials: any) => apiClient.post('/auth/login', credentials),
  register: (userData: any) => apiClient.post('/auth/register', userData),
  getCurrentUser: () => apiClient.get('/users/me'),
};

// Services pour les utilisateurs
export const usersApi = {
  getUserProfile: (id: string) => apiClient.get(`/users/${id}`),
  updateUserProfile: (id: string, userData: any) => apiClient.put(`/users/${id}`, userData),
};

export default apiClient; 