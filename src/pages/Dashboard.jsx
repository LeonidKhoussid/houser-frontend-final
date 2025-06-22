import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
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
  DollarSign,
  Home,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Layout from "../components/Layout";
import { apiCall, getImageUrls } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function PropertyDashboard() {
  const location = useLocation();
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
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
        (Array.isArray(property.tags) &&
          property.tags.some((tag) =>
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

  // Check authentication and setup based on user data
  useEffect(() => {
    if (location.pathname !== '/dashboard') return;

    // Prioritize city from localStorage, as it reflects the user's most recent explicit choice.
    const savedCity = localStorage.getItem("user_city");
    if (savedCity) {
      if (filters.city !== savedCity) {
          setFilters(prev => ({...prev, city: savedCity}));
      }
      return; 
    }

    // If no city in localStorage, wait for the user object to load from context.
    if (user) {
        if (user.city) {
            // If the user has a city on their profile, use it and save it for next time.
            setFilters(prev => ({...prev, city: user.city}));
            localStorage.setItem("user_city", user.city);
        } else {
            // If no saved city and no profile city, prompt the user.
            setShowCityModal(true);
        }
    }
  }, [user, location.pathname, filters.city]);

  // Don't fetch user on mount - we already have it in localStorage
  const fetchUser = async () => {
    // This function can be removed if `useAuth` provides the user object reliably.
    // For now, we'll assume it might be needed if the user object is not immediately available.
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

  // Fetch properties with swipe filtering
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString();
      const url = `/properties${queryString}`;
      const propertiesData = await apiCall(url);

      if (propertiesData && propertiesData.data) {
        setProperties(propertiesData.data);
        setFilteredProperties(propertiesData.data);
      } else {
        setProperties([]);
        setFilteredProperties([]);
      }
    } catch (err) {
      setError("Failed to fetch properties. Please try again.");
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply swipe filtering to properties
  useEffect(() => {
    if (location.pathname !== '/dashboard') return;
    const applySwipeFiltering = async () => {
      if (properties.length > 0) {
        const filteredProperties = await filterSwipedProperties(properties);
        setFilteredProperties(filteredProperties);

        // Adjust current property index if needed
        if (
          currentPropertyIndex >= filteredProperties.length &&
          filteredProperties.length > 0
        ) {
          setCurrentPropertyIndex(0);
          setCurrentImageIndex(0);
        }
      }
    };

    applySwipeFiltering();
  }, [properties, location.pathname]);

  // Filter out swiped properties
  const filterSwipedProperties = async (propertiesList) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return propertiesList;

      // Fetch current user's swipes
      const swipes = await apiCall(`/swipes`);

      if (Array.isArray(swipes)) {
        const swipedPropertyIds = new Set(swipes.map((s) => s.property_id));
        return propertiesList.filter(
          (p) => !swipedPropertyIds.has(p.id)
        );
      }
      return propertiesList;
    } catch (err) {
      console.error("Failed to filter swiped properties:", err);
      return propertiesList; // Return original list on error
    }
  };

  // Handle selectedProperty from navigation state
  useEffect(() => {
    if (location.state?.selectedProperty && properties.length > 0) {
      const selectedProperty = location.state.selectedProperty;

      let propertyIndex = properties.findIndex(
        (p) => p.id === selectedProperty.id
      );

      if (propertyIndex !== -1) {
        setCurrentPropertyIndex(propertyIndex);
        setCurrentImageIndex(0);
      } else {
        const updatedProperties = [selectedProperty, ...properties];
        setProperties(updatedProperties);
        setFilteredProperties(updatedProperties);
        setCurrentPropertyIndex(0);
        setCurrentImageIndex(0);
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state?.selectedProperty, properties]);

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
  const handleSwipe = async (isLike, event) => {
    // Prevent the link navigation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (swipeLoading || !filteredProperties[currentPropertyIndex]) return;

    setSwipeLoading(true);
    try {
      await apiCall(`/swipe/${filteredProperties[currentPropertyIndex].id}`, {
        method: 'POST',
        body: JSON.stringify({ is_like: isLike }),
      });
      // Move to next property after a swipe
      setCurrentPropertyIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    } catch (err) {
      setError("Failed to record swipe. Please try again.");
    } finally {
      setSwipeLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    logout();
    // The AuthProvider should handle redirecting, but if not:
    // navigate('/signin');
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

  // Fetch matches count
  const fetchMatchesCount = async () => {
    try {
      const response = await apiCall("/matches");
      setMatches(Array.isArray(response) ? response.length : 0);
    } catch (err) {
      setMatches(0);
    }
  };

  // Fetch all data needed for dashboard
  useEffect(() => {
    if (location.pathname !== '/dashboard') return;

    if (filters.city) {
      fetchProperties();
      fetchUser(); // This might be redundant now
      fetchMatchesCount();
    }
  }, [filters.city, location.pathname]);

  // Use filteredProperties for rendering
  const currentProperty =
    filteredProperties[currentPropertyIndex] ||
    filteredProperties[0] ||
    properties[0];

  // Handle images with proper fallback logic
  const getCurrentImages = () => {
    if (!currentProperty) return defaultImages;

    // Check if property has images array
    if (
      currentProperty.images &&
      Array.isArray(currentProperty.images) &&
      currentProperty.images.length > 0
    ) {
      return getImageUrls(currentProperty.images);
    }

    // Check for single image fields
    if (currentProperty.image_url) {
      return [currentProperty.image_url];
    }

    if (currentProperty.image) {
      return [currentProperty.image];
    }

    // Fallback to default images
    return defaultImages;
  };

  const currentImages = getCurrentImages();

  return (
    <Layout
      user={user}
      onRefresh={fetchProperties}
      onLogout={handleLogout}
      onCityChange={() => setShowCityModal(true)}
      onFilterToggle={toggleFilterModal}>
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
                There are no properties available in {filters.city} at the
                moment.
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
              <Link to={`/property/${currentProperty.id}`} className="block">
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
                            {currentProperty.seller_name ||
                              currentProperty.user?.name ||
                              "Unknown Seller"}
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
                  {Array.isArray(currentProperty.tags) &&
                    currentProperty.tags.length > 0 && (
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
                      onClick={(e) => handleSwipe(false, e)}
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
                      onClick={(e) => handleSwipe(true, e)}
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
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
