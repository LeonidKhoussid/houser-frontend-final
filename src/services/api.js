import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// API helper function that can be used across components
export const apiCall = async (endpoint, options = {}) => {
  const url = `/api${endpoint}`;
  const token = localStorage.getItem("auth_token");

  if (!token) {
    window.location.href = "/signin";
    return;
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      const body = await response.text();
      if (endpoint === "/matches") return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
};

// Utility function to get proper image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80";
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Use the proper Yandex Cloud Storage URL
  return `https://storage.yandexcloud.net/houser/${imagePath}`;
};

// Utility function to get proper image URLs for multiple images
export const getImageUrls = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80"];
  }
  
  return images.map(img => getImageUrl(img));
};

export default api;
