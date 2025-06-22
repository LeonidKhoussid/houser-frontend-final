import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import AddHome from "./pages/AddHome";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import PropertyDetail from './pages/PropertyDetail';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { subscribeToLikeNotifications, unsubscribeFromUserChannel } from './echo';
import LikeNotificationModal from './components/LikeNotificationModal';
import { getUnreadLikesCount, markLikesAsRead } from './services/property';

// Create context for layout props
const LayoutContext = createContext();

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    return { unreadLikesCount: 0, onMarkLikesAsRead: () => {} };
  }
  return context;
};

const AppRoutes = () => {
  const { user, token, loading } = useAuth();
  const [likeNotification, setLikeNotification] = useState(null);
  const [unreadLikesCount, setUnreadLikesCount] = useState(0);

  // Fetch initial unread likes count
  const fetchUnreadLikesCount = async () => {
    try {
      const response = await getUnreadLikesCount();
      setUnreadLikesCount(response.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread likes count:', error);
      setUnreadLikesCount(0);
    }
  };

  // Mark likes as read
  const handleMarkLikesAsRead = async () => {
    await markLikesAsRead();
    setUnreadLikesCount(0);
  };

  useEffect(() => {
    if (user) {
      // Initial fetch of unread count
      fetchUnreadLikesCount();
      
      console.log('App.jsx: Subscribing to like notifications for user:', user.id);
      const channel = subscribeToLikeNotifications(user.id, (data) => {
        console.log('App.jsx: Received property.liked event:', data);
        
        // Show popup notification
        setLikeNotification({
          ...data,
          timestamp: Date.now()
        });
        
        // Increment red dot count
        setUnreadLikesCount(prev => prev + 1);
        
        // Show toast
        toast.success(data.message);
      });

      return () => {
        console.log('App.jsx: Cleaning up like notification subscription.');
      };
    }
  }, [user]);

  const handleLikeBack = () => {
    toast.success("Thanks for liking back!");
    setLikeNotification(null);
  };

  const handleCloseNotification = () => {
    setLikeNotification(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const layoutContextValue = {
    unreadLikesCount,
    onMarkLikesAsRead: handleMarkLikesAsRead
  };

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <Toaster position="top-center" reverseOrder={false} />

      <LikeNotificationModal
        notification={likeNotification}
        onLikeBack={handleLikeBack}
        onClose={handleCloseNotification}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/add-home" element={<AddHome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/property/:propertyId" element={<PropertyDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:userId" element={<UserProfile />} />
      </Routes>
    </LayoutContext.Provider>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </Router>
);

export default App;
