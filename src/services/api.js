import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// API helper function that can be used across components
export const apiCall = async (endpoint, options = {}) => {
  const url = `/api${endpoint}`;
  const token = localStorage.getItem("auth_token");

  console.log("Making API call to:", url);
  console.log("Token exists:", !!token);

  if (!token) {
    console.error("No auth token found");
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

    console.log("Response status:", response.status);

    if (response.status === 401) {
      const body = await response.text();
      console.warn("401 response body for /matches:", body);

      // Do not redirect — just return null
      if (endpoint === "/matches") return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (err) {
    console.error("API call failed:", err);
    throw err;
  }
};

export default api;
