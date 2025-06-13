import api from "./api";

export const fetchProperties = () => api.get("/properties");
export const createProperty = (data) => api.post("/properties", data);
export const swipeProperty = (id, data) => api.post(`/swipe/${id}`, data);
export const fetchMatches = () => api.get("/matches");
