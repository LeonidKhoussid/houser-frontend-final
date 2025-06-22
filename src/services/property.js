import api from "./api";

export const fetchProperties = () => api.get("/properties");
export const createProperty = (data) => api.post("/properties", data);
export const swipeProperty = (propertyId, data) =>
  api.post(`/swipe/${propertyId}`, data);
export const fetchMatches = () => api.get("/matches");
export const getUnreadLikesCount = () => api.get('/unread-likes-count');
export const markLikesAsRead = () => api.post('/mark-likes-as-read');
