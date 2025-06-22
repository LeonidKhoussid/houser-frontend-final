import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUser as getUserService, login as loginService, register as registerService, logout as logoutService } from '../services/auth';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (!user) {
        getUserService()
          .then(response => {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          })
          .catch(error => {
            if (error.response?.status === 401) {
              localStorage.removeItem('auth_token');
              setToken(null);
              setUser(null);
              delete api.defaults.headers.common['Authorization'];
            } else {
              setUser(null);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    const response = await loginService(credentials);
    const { access_token, user } = response.data;
    
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    setUser(user);
    setToken(access_token);
  };

  const register = async (data) => {
    const response = await registerService(data);
    const { access_token, user } = response.data;
    
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(user);
    setToken(access_token);
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout request failed, but clearing local data anyway:', error);
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 