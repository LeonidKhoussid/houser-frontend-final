import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  MessageCircle,
  Search,
  Heart,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function PropertyDashboard() {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [swipeLoading, setSwipeLoading] = useState(false);

  // API configuration - Update this to match your Laravel backend URL
  const API_BASE_URL = "/api";

  // For demo purposes, you can set a token here or get it from your auth system
  const authToken = "your-auth-token-here"; // Replace with actual token from your auth system

  // Default images for properties without custom images
  const defaultImages = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    "https://images.unsplash.com/photo-1520637836862-4d197d17c60a?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
  ];

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("API call failed:", err);
      throw err;
    }
  };

  // Fetch user data
  const fetchUser = async () => {
    try {
      const userData = await apiCall("/user");
      setUser(userData);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // Don't set error for user fetch failure as it's not critical
    }
  };

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const propertiesData = await apiCall("/properties");

      // Process properties to include multiple images and ensure all required fields
      const processedProperties = propertiesData.map((property) => {
        // Handle image field - could be a single image URL or array
        let images = defaultImages; // Default fallback

        if (property.image && property.image !== "default.jpg") {
          // If image is a string URL, use it
          if (typeof property.image === "string") {
            images = [property.image, ...defaultImages.slice(1)]; // Use property image + defaults
          }
          // If image is an array, use it
          else if (Array.isArray(property.image)) {
            images = property.image.length > 0 ? property.image : defaultImages;
          }
        }

        return {
          ...property,
          images: images,
          seller_name: property.user?.name || "Unknown Seller",
          title: property.title || "Beautiful Property",
          description: property.description || "No description available.",
          price: property.price || 0,
          type: property.type || "rent",
        };
      });

      setProperties(processedProperties);

      // Reset to first property if we have properties
      if (processedProperties.length > 0) {
        setCurrentPropertyIndex(0);
        setCurrentImageIndex(0);
      }
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError("Failed to load properties. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle swipe action
  const handleSwipe = async (isLike) => {
    if (!properties[currentPropertyIndex] || swipeLoading) return;

    try {
      setSwipeLoading(true);
      const property = properties[currentPropertyIndex];

      const response = await apiCall(`/swipe/${property.id}`, {
        method: "POST",
        body: JSON.stringify({ is_like: isLike }),
      });

      if (response.match) {
        // Show match notification
        alert(
          "🎉 It's a match! You and the property owner both liked each other!"
        );
      }

      // Move to next property
      const nextIndex = currentPropertyIndex + 1;
      if (nextIndex < properties.length) {
        setCurrentPropertyIndex(nextIndex);
      } else {
        // If we've reached the end, go back to the first property
        setCurrentPropertyIndex(0);
      }
      setCurrentImageIndex(0);
    } catch (err) {
      console.error("Failed to swipe:", err);
      setError("Failed to process swipe. Please try again.");
    } finally {
      setSwipeLoading(false);
    }
  };

  // Image navigation
  const nextImage = () => {
    if (!properties[currentPropertyIndex]) return;
    const images = properties[currentPropertyIndex].images;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!properties[currentPropertyIndex]) return;
    const images = properties[currentPropertyIndex].images;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Navigate between properties
  const nextProperty = () => {
    if (properties.length === 0) return;
    const nextIndex = (currentPropertyIndex + 1) % properties.length;
    setCurrentPropertyIndex(nextIndex);
    setCurrentImageIndex(0);
  };

  const prevProperty = () => {
    if (properties.length === 0) return;
    const prevIndex =
      (currentPropertyIndex - 1 + properties.length) % properties.length;
    setCurrentPropertyIndex(prevIndex);
    setCurrentImageIndex(0);
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchProperties();
    if (authToken) {
      fetchUser();
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <X className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-semibold">Oops! Something went wrong</p>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProperties}
            className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center mx-auto">
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No properties state
  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-semibold">No Properties Found</p>
          </div>
          <p className="text-gray-600 mb-6">
            There are no properties available at the moment.
          </p>
          <button
            onClick={fetchProperties}
            className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center mx-auto">
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentProperty = properties[currentPropertyIndex];
  const currentImages = currentProperty.images;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar */}
      <div className="w-20 bg-orange-400 flex flex-col items-center py-6 space-y-8">
        {/* Profile Icon */}
        <div
          className="w-12 h-12 bg-black rounded-full flex items-center justify-center"
          title={user?.name || "User"}>
          <User className="w-6 h-6 text-orange-400" />
        </div>

        {/* Chat Icon */}
        <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center border-2 border-orange-600 relative cursor-pointer">
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <span className="text-xs text-orange-400 font-bold">3</span>
          </div>
        </div>

        {/* Search Icon */}
        <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer">
          <Search className="w-6 h-6 text-white" />
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Home Icon */}
        <div className="w-12 h-12 bg-orange-400 rounded flex items-center justify-center cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
            <path
              fill="currentColor"
              d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.5L18 11v7h-2v-6H8v6H6v-7l6-5.5z"
            />
          </svg>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchProperties}
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          title="Refresh Properties">
          <RefreshCw className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Content Area */}
        <div className="flex-1 flex flex-col p-8">
          {/* Header with navigation and property counter */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={prevProperty}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                title="Previous Property">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-gray-600">
                {user?.name && (
                  <span>
                    Welcome, <span className="font-semibold">{user.name}</span>{" "}
                    |{" "}
                  </span>
                )}
                Property {currentPropertyIndex + 1} of {properties.length}
              </div>
              <button
                onClick={nextProperty}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                title="Next Property">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Property Image Section */}
          <div className="flex-1">
            <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-white shadow-lg">
              {/* Image Navigation Arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center z-10 transition-all duration-200">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center z-10 transition-all duration-200">
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Property Image */}
              <div className="w-full h-full relative">
                <img
                  src={currentImages[currentImageIndex]}
                  alt={`${currentProperty.title} - Image ${
                    currentImageIndex + 1
                  }`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default image if current image fails to load
                    e.target.src = defaultImages[0];
                  }}
                />
              </div>

              {/* Image Indicators */}
              {currentImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {currentImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? "bg-white"
                          : "bg-white bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Property Tags */}
              <div className="absolute top-4 left-4 flex space-x-2">
                <span className="bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {currentProperty.type.toUpperCase()}
                </span>
                <span className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  ID: {currentProperty.id}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="mt-6 space-y-4">
              {/* Title and Price */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentProperty.title}
                  </h2>
                  <p className="text-gray-600 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <strong>Seller:</strong>{" "}
                    <span className="ml-1">{currentProperty.seller_name}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600">
                    ${currentProperty.price}
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {currentProperty.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-12 pt-6">
                <button
                  onClick={() => handleSwipe(false)}
                  disabled={swipeLoading}
                  className="w-16 h-16 bg-white border-4 border-red-400 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  title="Pass on this property">
                  {swipeLoading ? (
                    <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
                  ) : (
                    <X className="w-6 h-6 text-red-400" strokeWidth={3} />
                  )}
                </button>
                <button
                  onClick={() => handleSwipe(true)}
                  disabled={swipeLoading}
                  className="w-16 h-16 bg-white border-4 border-green-400 rounded-full flex items-center justify-center hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  title="Like this property">
                  {swipeLoading ? (
                    <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                  ) : (
                    <Heart className="w-6 h-6 text-green-400" strokeWidth={3} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - HOUSER Text */}
        <div className="w-32 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 leading-tight tracking-wider">
              <div className="flex flex-col space-y-1">
                <span>H</span>
                <span>O</span>
                <span>U</span>
                <span>S</span>
                <span>E</span>
                <span>R</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex justify-between items-start">
            <span className="flex-1 mr-2">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
