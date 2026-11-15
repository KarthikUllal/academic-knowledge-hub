
import api from "./api";

// Fetch approved resources
export const getResources = (params) => {
  return api.get("/resources", { params });
};

// Fetch a single resource
export const getResourceById = (id) => {
  return api.get(`/resources/${id}`);
};

// Preview a resource
export const previewResource = (id) => {
  return api.get(`/resources/${id}/preview`);
};

// Download a resource
export const downloadResource = (id) => {
  return api.get(`/resources/${id}/download`);
};

// Upload a resource
export const uploadResource = (formData) => {
  return api.post("/resources", formData);
};

// Update a resource
export const updateResource = (id, data) => {
  return api.put(`/resources/${id}`, data);
};

// Delete a resource
export const deleteResource = (id) => {
  return api.delete(`/resources/${id}`);
};
