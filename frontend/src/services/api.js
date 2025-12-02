import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : process.env.NODE_ENV === 'production' 
    ? 'https://dropyourfile.onrender.com/api'
    : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// File API calls
export const uploadFile = (formData) => {
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getAllFiles = () => {
  return api.get('/files');
};

export const updateFileStatus = (id, status) => {
  return api.patch(`/files/${id}/status`, { status });
};

export const deleteFile = (id) => {
  return api.delete(`/files/${id}`);
};

export const getFileInfo = (id) => {
  return api.get(`/files/${id}`);
};

export default api;
