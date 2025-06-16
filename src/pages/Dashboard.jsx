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
  MapPin,
  Filter,
  LogOut,
} from "lucide-react";

export default function PropertyDashboard() {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [userCity, setUserCity] = useState("");
  const [showCityModal, setShowCityModal] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    tags: [],
  });
  const [matches, setMatches] = useState(0);

  // API configuration
  const API_BASE_URL = "/api";

  // Default images for properties without custom images
  const defaultImages = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    "https://images.unsplash.com/photo-1520637836862-4d197d17c60a?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
  ];

  // Check authentication on mount
  useEffect(() => {
    // Small delay to ensure localStorage is properly set after redirect
    const checkAuth = setTimeout(() => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token found, redirecting to signin");
        window.location.href = "/signin";
        return;
      }

      // Get user data from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // If user has a city, use it as default
          if (userData.city && !localStorage.getItem("user_city")) {
            setUserCity(userData.city);
            localStorage.setItem("user_city", userData.city);
            setFilters((prev) => ({ ...prev, city: userData.city }));
          }
        } catch (e) {
          console.error("Failed to parse user data:", e);
        }
      }

      // Get saved city preference
      const savedCity = localStorage.getItem("user_city");
      if (savedCity) {
        setUserCity(savedCity);
        setFilters((prev) => ({ ...prev, city: savedCity }));
      } else if (!storedUser || !JSON.parse(storedUser).city) {
        setShowCityModal(true);
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, []);

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
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
        // // Only clear storage if we get a 401 (unauthorized)
        // console.error("Token expired or invalid for endpoint:", endpoint);
        // // Don't immediately clear - check if it's a real auth issue
        // if (endpoint == "/properties") {
        //   // Properties endpoint doesn't require auth for GET
        //   localStorage.removeItem("auth_token");
        //   localStorage.removeItem("user");
        //   window.location.href = "/signin";
        // }
        // return;

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

  // Don't fetch user on mount - we already have it in localStorage
  const fetchUser = async () => {
    // Only fetch if we don't have user data
    if (!user) {
      try {
        const userData = await apiCall("/user");
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Failed to fetch user:", err);
        // Don't redirect on user fetch failure - use localStorage data
      }
    }
  };

  // Build query string for filters
  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.city) params.append("city", filters.city);
    if (filters.type) params.append("type", filters.type);
    if (filters.minPrice) params.append("min_price", filters.minPrice);
    if (filters.maxPrice) params.append("max_price", filters.maxPrice);
    if (filters.tags.length > 0) params.append("tags", filters.tags.join(","));

    return params.toString() ? `?${params.toString()}` : "";
  };

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString();
      const response = await apiCall(`/properties${queryString}`);

      // Handle paginated response or array
      const propertiesData = response.data || response;

      if (!Array.isArray(propertiesData)) {
        console.error("Properties response is not an array:", propertiesData);
        setProperties([]);
        return;
      }

      if (propertiesData.length === 0 && !filters.city) {
        setShowCityModal(true);
        setLoading(false);
        return;
      }

      // Process properties to ensure all required fields
      const processedProperties = propertiesData.map((property) => {
        let images = defaultImages;

        if (property.image && property.image !== "default.jpg") {
          if (typeof property.image === "string") {
            images = [property.image, ...defaultImages.slice(1)];
          } else if (Array.isArray(property.image)) {
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
          city: property.city || "Unknown",
          tags: property.tags || [],
        };
      });

      setProperties(processedProperties);

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

  // Save city preference
  const saveCityPreference = () => {
    if (userCity.trim()) {
      localStorage.setItem("user_city", userCity);
      setFilters((prev) => ({ ...prev, city: userCity }));
      setShowCityModal(false);
      fetchProperties();
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
        alert(
          "🎉 It's a match! You and the property owner both liked each other!"
        );
      }

      // Move to next property
      const nextIndex = currentPropertyIndex + 1;
      if (nextIndex < properties.length) {
        setCurrentPropertyIndex(nextIndex);
      } else {
        // Reached the end, fetch more properties or restart
        await fetchProperties();
      }
      setCurrentImageIndex(0);
    } catch (err) {
      console.error("Failed to swipe:", err);
      setError("Failed to process swipe. Please try again.");
    } finally {
      setSwipeLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_city");
    window.location.href = "/signin";
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

  // Fetch matches count
  const fetchMatchesCount = async () => {
    try {
      const response = await apiCall("/matches");
      console.log("Matches response:", response);
      setMatches(Array.isArray(response) ? response.length : 0);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    if (filters.city) {
      fetchProperties();
      // Don't fetch user immediately - we have it in localStorage
      fetchUser();
      fetchMatchesCount();
    }
  }, [filters.city]);

  // City Selection Modal
  if (showCityModal) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <MapPin className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Houser!
            </h2>
            <p className="text-gray-600">
              Please enter your city to see properties near you
            </p>
          </div>

          <input
            type="text"
            placeholder="Enter your city..."
            value={userCity}
            onChange={(e) => setUserCity(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && saveCityPreference()}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none mb-4"
          />

          <button
            onClick={saveCityPreference}
            disabled={!userCity.trim()}
            className="w-full bg-orange-400 text-white py-3 rounded-lg hover:bg-orange-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold">
            Start Browsing Properties
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            Loading properties in {filters.city}...
          </p>
        </div>
      </div>
    );
  }

  // No properties state
  if (properties.length === 0 && !loading) {
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
            className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center  relative cursor-pointer"
            onClick={() => (window.location.href = "/chat")}
            title="View Chats">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>

          {/* Filter Icon */}
          <div
            className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setShowCityModal(true)}
            title="Change City">
            <MapPin className="w-6 h-6 text-white" />
          </div>

          {/* Search Icon */}
          <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer">
            <Search className="w-6 h-6 text-white" />
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Refresh Button */}
          <button
            onClick={fetchProperties}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            title="Refresh Properties">
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

        {/* Main Content - No properties message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-2" />
              <p className="text-lg font-semibold">No Properties Found</p>
            </div>
            <p className="text-gray-600 mb-6">
              There are no properties available in {filters.city} at the moment.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowCityModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5 mr-2" />
                Change City
              </button>
              <button
                onClick={fetchProperties}
                className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center mx-auto">
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
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

        {/* Filter Icon */}
        <div
          className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer"
          onClick={() => setShowCityModal(true)}
          title="Change City">
          <MapPin className="w-6 h-6 text-white" />
        </div>

        {/* Search Icon */}
        <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer">
          <Search className="w-6 h-6 text-white" />
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Refresh Button */}
        <button
          onClick={fetchProperties}
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          title="Refresh Properties">
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
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="font-semibold">{filters.city}</span>
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
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%]">
                <span className="bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {currentProperty.type.toUpperCase()}
                </span>
                {currentProperty.tags &&
                  currentProperty.tags.length > 0 &&
                  currentProperty.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
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
                  <div className="space-y-1">
                    <p className="text-gray-600 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <strong>Seller:</strong>{" "}
                      <span className="ml-1">
                        {currentProperty.seller_name}
                      </span>
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <strong>Location:</strong>{" "}
                      <span className="ml-1">
                        {currentProperty.city}
                        {currentProperty.state && `, ${currentProperty.state}`}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600">
                    ${parseFloat(currentProperty.price).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentProperty.type === "rent"
                      ? "per month"
                      : "sale price"}
                  </div>
                </div>
              </div>

              {/* Tags Display */}
              {currentProperty.tags && currentProperty.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentProperty.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

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
