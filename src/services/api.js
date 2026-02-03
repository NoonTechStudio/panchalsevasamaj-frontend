// src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:5001/api";

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

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
};

// Families API
export const familiesAPI = {
  getAll: (params) => api.get("/families", { params }),
  getById: (id) => api.get(`/families/${id}`),
  create: (familyData) => api.post("/families", familyData),
  update: (id, familyData) => api.put(`/families/${id}`, familyData),
  delete: (id) => api.delete(`/families/${id}`),
  addMember: (familyId, memberData) =>
    api.post(`/families/${familyId}/members`, memberData),
  updateMember: (memberId, memberData) =>
    api.put(`/families/members/${memberId}`, memberData),
  deleteMember: (memberId) => api.delete(`/families/members/${memberId}`),
};

// Deceased API
export const deceasedAPI = {
  getAll: (params) => api.get("/deceased", { params }),
  getById: (id) => api.get(`/deceased/${id}`), // Add this line
  create: (data) => api.post("/deceased", data),
  update: (id, data) => api.put(`/deceased/${id}`, data),
  delete: (id) => api.delete(`/deceased/${id}`),
};

export default api;
