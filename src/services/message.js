import api from "./api";

export const getMessages = (propertyId) => api.get(`/messages/${propertyId}`);
export const sendMessage = (propertyId, data) =>
  api.post(`/messages/${propertyId}`, data);
export const markAsRead = (messageId) =>
  api.patch(`/messages/${messageId}/read`);
