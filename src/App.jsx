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
import { subscribeToLikeNotifications, subscribeToUserChannel, unsubscribeFromUserChannel } from './echo';
import LikeNotificationModal from './components/LikeNotificationModal';
import { getUnreadLikesCount, markLikesAsRead, getUnreadMessagesCount, markMessagesAsRead } from './services/property';

// Create context for layout props
const LayoutContext = createContext();

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    return { unreadLikesCount: 0, unreadMessagesCount: 0, onMarkLikesAsRead: () => {}, onMarkMessagesAsRead: () => {} };
  }
  return context;
};

const AppRoutes = () => {
  const { user, token, loading } = useAuth();
  const [likeNotification, setLikeNotification] = useState(null);
  const [unreadLikesCount, setUnreadLikesCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Fetch initial unread likes count
  const fetchUnreadLikesCount = async () => {
    try {
      const response = await getUnreadLikesCount();
      setUnreadLikesCount(response.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread likes count:', error);
      // Don't trigger logout for unread counts - just set to 0
      setUnreadLikesCount(0);
    }
  };

  // Fetch unread messages count
  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await getUnreadMessagesCount();
      // Calculate total unread messages across all conversations
      const total = Object.values(response.data || {}).reduce((sum, count) => sum + count, 0);
      setUnreadMessagesCount(total);
    } catch (error) {
      console.error('Failed to fetch unread messages count:', error);
      // Don't trigger logout for unread counts - just set to 0
      setUnreadMessagesCount(0);
    }
  };

  // Mark likes as read
  const handleMarkLikesAsRead = async () => {
    try {
      await markLikesAsRead();
      setUnreadLikesCount(0);
    } catch (error) {
      console.error('Failed to mark likes as read:', error);
    }
  };

  // Mark messages as read (called when entering chat)
  const handleMarkMessagesAsRead = async () => {
    try {
      await markMessagesAsRead();
      setUnreadMessagesCount(0);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      const setupNotifications = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        fetchUnreadLikesCount();
        fetchUnreadMessagesCount();
      };

      setupNotifications();
      
      const userChannel = subscribeToUserChannel(
        user.id, 
        null,
        (data) => {
          if (data.message && data.message.sender_id !== user.id) {
            const isOnChatPage = window.location.pathname === '/chat';
            
            if (!isOnChatPage) {
              setUnreadMessagesCount(prev => prev + 1);
              toast.success(`New message from ${data.message.sender_name || 'someone'}!`);
            }
          }
        },
        (data) => {
          setLikeNotification({
            ...data,
            timestamp: Date.now()
          });
          
          setUnreadLikesCount(prev => prev + 1);
          toast.success(data.message);
        }
      );

      return () => {
        unsubscribeFromUserChannel();
      };
    }
  }, [user, token]);

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
    unreadMessagesCount,
    onMarkLikesAsRead: handleMarkLikesAsRead,
    onMarkMessagesAsRead: handleMarkMessagesAsRead
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
