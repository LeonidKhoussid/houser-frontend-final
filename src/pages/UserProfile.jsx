import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { apiCall, getImageUrl } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  // Helper function to safely handle tags
  const getSafeTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        const userProperties = await apiCall(`/users/${userId}/properties`);

        if (userProperties && userProperties.length > 0) {
          setUser(userProperties[0].user);
          setProperties(userProperties);
        } else {
          // If no properties, still try to fetch the user directly
          try {
            const userData = await apiCall(`/profile/${userId}`);
            setUser(userData);
            setProperties([]); // No properties to show
          } catch (userError) {
             setError("User not found or has no properties.");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  // Fetch current user's swipes and filter properties
  useEffect(() => {
    const fetchSwipesAndFilter = async () => {
      if (!currentUser || properties.length === 0) {
        setFilteredProperties(properties);
        return;
      }

      try {
        const swipes = await apiCall(`/swipes`);
        if (Array.isArray(swipes)) {
          const likedPropertyIds = new Set(swipes.filter(s => s.is_like).map(s => s.property_id));
          const availableProperties = properties.filter(
            (property) => !likedPropertyIds.has(property.id)
          );
          setFilteredProperties(availableProperties);
        } else {
          setFilteredProperties(properties);
        }
      } catch (err) {
        console.error("Failed to fetch swipes for filtering:", err);
        setFilteredProperties(properties);
      }
    };

    fetchSwipesAndFilter();
  }, [currentUser, properties]);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePropertyClick = (property) => {
    navigate(`/property/${property.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            This user profile could not be loaded.
          </p>
          <button
            onClick={handleBack}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
              <p className="text-sm text-gray-600">
                Viewing {user.name}'s properties
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {user.name}
              </h2>
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                {user.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {user.city}
                      {user.state && `, ${user.state}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="w-4 h-4" />
                  <span>
                    {filteredProperties.length}{" "}
                    {filteredProperties.length === 1
                      ? "property"
                      : "properties"}{" "}
                    available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Properties by {user.name}
          </h3>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => handlePropertyClick(property)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                  {/* Property Image */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={
                        property.images && property.images.length > 0
                          ? getImageUrl(property.images[0])
                          : getImageUrl(property.image_url || property.image)
                      }
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          property.type === "rent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                        {property.type === "rent" ? "For Rent" : "For Sale"}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                      {property.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-orange-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-lg">
                          {property.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {property.type === "rent" ? "/mo" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {property.city}
                        {property.state && `, ${property.state}`}
                      </span>
                    </div>

                    {(() => {
                      const safeTags = getSafeTags(property.tags);
                      return (
                        safeTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {safeTags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                            {safeTags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{safeTags.length - 3} more
                              </span>
                            )}
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                No Available Properties
              </h4>
              <p className="text-gray-600">
                {properties.length === 0
                  ? "This user hasn't listed any properties yet."
                  : "You've already seen and liked all available properties from this user."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
