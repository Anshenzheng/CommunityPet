import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const login = (username, password) => {
  return api.post('/login', { username, password });
};

export const register = (userData) => {
  return api.post('/register', userData);
};

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const addPet = (petData) => {
  const formData = new FormData();
  Object.keys(petData).forEach((key) => {
    if (petData[key] !== null && petData[key] !== undefined) {
      formData.append(key, petData[key]);
    }
  });
  return api.post('/pets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getOwnerPets = (ownerId) => {
  return api.get(`/pets/owner/${ownerId}`);
};

export const getAllPets = (params = {}) => {
  return api.get('/admin/pets', { params });
};

export const getBuildings = () => {
  return api.get('/admin/buildings');
};

export const reviewPet = (petId, status) => {
  return api.put(`/admin/pets/${petId}/review`, { status });
};

export const editPet = (petId, petData) => {
  return api.put(`/admin/pets/${petId}`, petData);
};

export const cancelPet = (petId) => {
  return api.put(`/admin/pets/${petId}/cancel`);
};

export const getImageUrl = (filename) => {
  return filename ? `${API_BASE_URL}/uploads/${filename}` : null;
};

export default api;
