import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Don't add auth token for login/register requests
    const isAuthRequest = config.url?.includes('/login') || config.url?.includes('/register');
    
    if (!isAuthRequest) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} without token`);
      }
    } else {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} (auth endpoint)`);
    }
    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} -`, error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized error detected');
      
      // Define endpoints that should NOT trigger automatic logout
      const nonCriticalEndpoints = [
        '/unread-likes-count',
        '/unread-counts',
        '/mark-likes-as-read',
        '/mark-messages-as-read'
      ];
      
      const isNonCriticalEndpoint = nonCriticalEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      if (isNonCriticalEndpoint) {
        console.log('401 on non-critical endpoint, not triggering logout');
        // For non-critical endpoints, just return the error without logging out
        return Promise.reject(error);
      } else {
        console.log('401 on critical endpoint, removing token and redirecting');
        // For critical endpoints (login, user info, etc.), remove token and redirect
        localStorage.removeItem("auth_token");
        delete api.defaults.headers.common["Authorization"];
        window.location.href = "/signin";
      }
    }
    
    return Promise.reject(error);
  }
);

// API helper function that can be used across components
export const apiCall = async (endpoint, options = {}) => {
  const url = `http://localhost:8000/api${endpoint}`;
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
