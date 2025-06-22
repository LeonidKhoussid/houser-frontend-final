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

export default function Layout({ children, user, onRefresh, onLogout, onCityChange, onFilterToggle }) {
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_city");
    window.location.href = "/signin";
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
          onClick={() => (window.location.href = "/chat")}
          title="View Chats">
          <MessageCircle className="w-6 h-6 text-white" />
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