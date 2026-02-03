// src/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API - FIXED: Added /api prefix
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (userData) => api.post("/api/auth/register", userData),
};

// Families API - FIXED: Added /api prefix
export const familiesAPI = {
  getAll: (params) => api.get("/api/families", { params }),
  getById: (id) => api.get(`/api/families/${id}`),
  create: (familyData) => api.post("/api/families", familyData),
  update: (id, familyData) => api.put(`/api/families/${id}`, familyData),
  delete: (id) => api.delete(`/api/families/${id}`),
  addMember: (familyId, memberData) =>
    api.post(`/api/families/${familyId}/members`, memberData),
  updateMember: (memberId, memberData) =>
    api.put(`/api/families/members/${memberId}`, memberData),
  deleteMember: (memberId) => api.delete(`/api/families/members/${memberId}`),
};

// Deceased API - FIXED: Added /api prefix
export const deceasedAPI = {
  getAll: (params) => api.get("/api/deceased", { params }),
  getById: (id) => api.get(`/api/deceased/${id}`),
  create: (data) => api.post("/api/deceased", data),
  update: (id, data) => api.put(`/api/deceased/${id}`, data),
  delete: (id) => api.delete(`/api/deceased/${id}`),
};

export default api;