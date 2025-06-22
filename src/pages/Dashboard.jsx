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
import Layout from "../components/Layout";

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
  // Modal filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const toggleFilterModal = () => setIsFilterModalOpen((prev) => !prev);

  // Unified filters state for modal and sidebar
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    tags: "",
    price: "",
  });

  // For filtered properties
  const [filteredProperties, setFilteredProperties] = useState([]);

  // Function to apply filters (replaces previous stub)
  const applyFilters = () => {
    const filtered = properties.filter((property) => {
      const matchesCity =
        filters.city === "" ||
        property.city.toLowerCase().includes(filters.city.toLowerCase());
      const matchesCountry =
        filters.country === "" ||
        property.country.toLowerCase().includes(filters.country.toLowerCase());
      const matchesTags =
        filters.tags === "" ||
        (Array.isArray(property.tags) && property.tags.some((tag) =>
          tag.toLowerCase().includes(filters.tags.toLowerCase())
        ));
      const matchesPrice =
        filters.price === "" || property.price <= parseFloat(filters.price);

      return matchesCity && matchesCountry && matchesTags && matchesPrice;
    });

    setFilteredProperties(filtered);
    setShowFilterModal(false);
  };
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

  const [showFilterModal, setShowFilterModal] = useState(false);

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

  // Build query string for filters (for API)
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.city) params.append("city", filters.city);
    if (filters.type) params.append("type", filters.type);
    if (filters.country) params.append("country", filters.country);
    if (filters.minPrice) params.append("min_price", filters.minPrice);
    if (filters.maxPrice) params.append("max_price", filters.maxPrice);
    if (filters.tags) params.append("tags", filters.tags);
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
        setFilteredProperties([]);
        return;
      }

      if (propertiesData.length === 0 && !filters.city) {
        setShowCityModal(true);
        setLoading(false);
        setFilteredProperties([]);
        return;
      }

      // Process properties to ensure all required fields
      const processedProperties = propertiesData.map((property) => {
        console.log("Property", property.id, "images field:", property.images);
        
        let images = defaultImages;

        // First check for the new images array structure (highest priority)
        if (property.images && Array.isArray(property.images) && property.images.length > 0) {
          // Use the new images array structure - only show uploaded images
          console.log("Using images array:", property.images);
          images = property.images.map(img => {
            // If the image path doesn't start with http, it's a relative path that needs to be processed
            if (img && !img.startsWith('http')) {
              const fullUrl = `https://storage.yandexcloud.net/houser/${img}`;
              console.log("Converting relative path to full URL:", img, "->", fullUrl);
              return fullUrl;
            }
            console.log("Using absolute URL:", img);
            return img;
          });
          // Don't add default images - only show the uploaded ones
        } else if (property.image_url) {
          // Fallback to image_url attribute
          console.log("Using image_url:", property.image_url);
          images = [property.image_url, ...defaultImages.slice(1)];
        } else if (property.image && property.image !== "default.jpg") {
          // Fallback for backward compatibility with old image field
          console.log("Using fallback image field:", property.image);
          if (typeof property.image === "string") {
            const imageUrl = property.image.startsWith('http') ? property.image : `https://storage.yandexcloud.net/houser/${property.image}`;
            images = [imageUrl, ...defaultImages.slice(1)];
          } else if (Array.isArray(property.image)) {
            images = property.image.length > 0 ? property.image : defaultImages;
          }
        } else {
          console.log("No custom images found, using defaults");
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
      setFilteredProperties(processedProperties);

      if (processedProperties.length > 0) {
        setCurrentPropertyIndex(0);
        setCurrentImageIndex(0);
      }
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError("Failed to load properties. Please check your connection.");
      setFilteredProperties([]);
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

  // Navigate between properties (only via explicit button click, not via arrow keys)
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
    // Remove any global keydown listeners that would allow property navigation via arrow keys
    // (If previously implemented, ensure not present)
    // Example: document.addEventListener("keydown", ...) for ArrowLeft/ArrowRight -- not present
  }, [filters.city]);

  // Use filteredProperties for rendering
  const currentProperty =
    filteredProperties[currentPropertyIndex] ||
    filteredProperties[0] ||
    properties[0];
  const currentImages = currentProperty?.images || [];

  return (
    <Layout 
      user={user}
      onRefresh={fetchProperties}
      onLogout={handleLogout}
      onCityChange={() => setShowCityModal(true)}
      onFilterToggle={toggleFilterModal}
    >
      <div className="p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* City Selection Modal */}
          {showCityModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">
                Loading properties in {filters.city}...
              </p>
            </div>
          )}

          {/* No properties state */}
          {!loading && filteredProperties.length === 0 && (
            <div className="text-center py-12">
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
          )}

          {/* Properties Display */}
          {!loading && filteredProperties.length > 0 && (
            <>
              {/* Property Image Section */}
              <div className="mb-8">
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
                      {currentProperty.type?.toUpperCase()}
                    </span>
                    {Array.isArray(currentProperty.tags) &&
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
              </div>

              {/* Property Details */}
              <div className="space-y-4">
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
                          {currentProperty.state &&
                            `, ${currentProperty.state}`}
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
                {Array.isArray(currentProperty.tags) && currentProperty.tags.length > 0 && (
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
                      <Heart
                        className="w-6 h-6 text-green-400"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
