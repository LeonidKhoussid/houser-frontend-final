import React from 'react';
import {
  User,
  MessageCircle,
  MapPin,
  Search,
  RefreshCw,
  LogOut,
  Filter,
} from "lucide-react";
import { useLayoutContext } from '../App';

export default function Layout({ children, user, onRefresh, onLogout, onCityChange, onFilterToggle }) {
  const { unreadLikesCount, onMarkLikesAsRead } = useLayoutContext();
  
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_city");
    window.location.href = "/signin";
  };

  const handleChatClick = async () => {
    // Mark likes as read when clicking on chat
    if (unreadLikesCount > 0 && onMarkLikesAsRead) {
      try {
        await onMarkLikesAsRead();
      } catch (error) {
        console.error('Failed to mark likes as read:', error);
      }
    }
    // Navigate to chat
    window.location.href = "/chat";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar - Always visible */}
      <div className="w-20 bg-orange-400 flex flex-col items-center py-6 space-y-8">
        {/* Profile Icon */}
        <div
          className="w-12 h-12 bg-black rounded-full flex items-center justify-center cursor-pointer"
          onClick={() => (window.location.href = "/profile")}
          title={user?.name || "User"}>
          <User className="w-6 h-6 text-orange-400" />
        </div>

        {/* Chat Icon */}
        <div
          className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center relative cursor-pointer"
          onClick={handleChatClick}
          title="View Chats">
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadLikesCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {unreadLikesCount > 99 ? '99+' : unreadLikesCount}
              </span>
            </div>
          )}
        </div>

        {/* Dashboard Icon */}
        <div
          className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer"
          onClick={() => (window.location.href = "/dashboard")}
          title="Dashboard">
          <Search className="w-6 h-6 text-white" />
        </div>

        {/* Filter Icon */}
        <div
          className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer"
          onClick={onCityChange}
          title="Change City">
          <MapPin className="w-6 h-6 text-white" />
        </div>

        {/* Advanced Filter Icon */}
        <button
          onClick={onFilterToggle}
          className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer"
          title="Advanced Filters">
          <Filter className="w-6 h-6 text-white" />
        </button>

        <div className="flex-1"></div>
        
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          title="Refresh">
          <RefreshCw className="w-6 h-6 text-white" />
        </button>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Logout">
          <LogOut className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 