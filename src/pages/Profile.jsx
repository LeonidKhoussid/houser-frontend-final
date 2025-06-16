import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  ArrowLeft,
  DollarSign,
  Tag,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    description: "",
    price: "",
    type: "rent",
    city: "",
    state: "",
    tags: [],
    image: "",
  });
  const [currentTag, setCurrentTag] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // API helper
  const apiCall = async (endpoint, options = {}) => {
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
      console.error("No auth token found!");
      window.location.href = "/signin";
      return;
    }

    console.log("Making API call to:", endpoint);

    const response = await fetch(`/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      ...options,
    });

    if (response.status === 401) {
      // Token invalid, redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
      return;
    }

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", responseText);
      throw new Error("Invalid server response");
    }

    if (!response.ok) {
      console.error("API Error:", responseData);
      throw new Error(
        responseData.message || `HTTP error! status: ${response.status}`
      );
    }

    return responseData;
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const userData = await apiCall("/user");
      setUser(userData);
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        city: userData.city || "",
        state: userData.state || "",
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  // Fetch user properties
  const fetchUserProperties = async () => {
    try {
      setLoading(true);
      const userProperties = await apiCall("/user/properties");
      setProperties(userProperties);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async () => {
    try {
      setError("");

      // Prepare the data to include all fields accepted by backend
      const updateData = {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        city: profileForm.city,
        state: profileForm.state,
      };

      console.log("Sending profile update:", updateData);

      // Call the API to update profile
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const responseText = await response.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        setError(json.message || "Failed to update profile. Please try again.");
        return;
      }

      // Update local state and localStorage
      const updatedUser = json.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditingProfile(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(error.message || "Failed to update profile. Please try again.");
    }
  };

  // Create or update property
  const saveProperty = async () => {
    try {
      setError("");

      if (
        !propertyForm.title.trim() ||
        !propertyForm.city.trim() ||
        !propertyForm.price ||
        !propertyForm.type.trim()
      ) {
        setError(
          "Please fill in all required fields: Title, City, Price, and Type."
        );
        return;
      }

      const propertyData = {
        title: propertyForm.title || "",
        description: propertyForm.description || "",
        price: parseFloat(propertyForm.price) || 0,
        type: propertyForm.type || "rent",
        city: propertyForm.city || "",
        state: typeof propertyForm.state === "string" ? propertyForm.state : "",
        tags: Array.isArray(propertyForm.tags) ? propertyForm.tags : [],
        image:
          propertyForm.image ||
          `https://images.unsplash.com/photo-${
            [
              "1568605114967-8130f3a36994",
              "1570129477492-45c003edd2be",
              "1554995207-c18c203602cb",
            ][Math.floor(Math.random() * 3)]
          }?w=800&h=600&fit=crop`,
      };

      if (editingProperty) {
        console.log("Updating existing property with data:", propertyData);

        const response = await apiCall(`/properties/${editingProperty.id}`, {
          method: "PUT",
          body: JSON.stringify(propertyData),
        });

        if (!response || !response.property) {
          throw new Error("Invalid update response");
        }

        console.log("Update response:", response);

        setProperties((prev) =>
          prev.map((p) => (p.id === editingProperty.id ? response.property : p))
        );
        setSuccess("Property updated successfully!");
      } else {
        // Create new property
        console.log("Property data", propertyData);
        const newProperty = await apiCall("/properties", {
          method: "POST",
          body: JSON.stringify(propertyData),
        });
        setProperties([...properties, newProperty]);
        setSuccess("Property created successfully!");
      }

      setShowPropertyModal(false);
      resetPropertyForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to save property:", error);
      setError("Failed to save property. Please try again.");
    }
  };

  // Delete property
  const deleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await apiCall(`/properties/${propertyId}`, {
        method: "DELETE",
      });

      setProperties(properties.filter((p) => p.id !== propertyId));
      setSuccess("Property deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to delete property:", error);
      setError("Failed to delete property. Please try again.");
    }
  };

  // Reset property form
  const resetPropertyForm = () => {
    setPropertyForm({
      title: "",
      description: "",
      price: "",
      type: "rent",
      city: user?.city || "",
      state: user?.state || "",
      tags: [],
      image: "",
    });
    setCurrentTag("");
    setEditingProperty(null);
  };

  // Edit property
  const startEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      type: property.type,
      city: property.city,
      state: property.state || "",
      tags: property.tags || [],
      image: property.image || "",
    });
    setShowPropertyModal(true);
  };

  // Handle tag input
  const handleAddTag = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!propertyForm.tags.includes(currentTag.trim())) {
        setPropertyForm({
          ...propertyForm,
          tags: [...propertyForm.tags, currentTag.trim()],
        });
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setPropertyForm({
      ...propertyForm,
      tags: propertyForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  useEffect(() => {
    // Use localStorage data first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setProfileForm({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          city: userData.city || "",
          state: userData.state || "",
        });

        // Only then fetch fresh data
        fetchUserProfile();
      } catch (e) {
        console.error("Failed to parse user data:", e);
        window.location.href = "/signin";
      }
    } else {
      fetchUserProfile();
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProperties();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              {user.type?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="p-2 hover:bg-gray-100 rounded-full">
                  {editingProfile ? (
                    <X className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Edit className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, city: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          state: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <button
                    onClick={updateProfile}
                    className="w-full bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">
                      {user.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {user.city || "Not provided"}
                      {user.state && `, ${user.state}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  My Properties
                </h2>
                <button
                  onClick={() => {
                    resetPropertyForm();
                    setShowPropertyModal(true);
                  }}
                  className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Property
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto" />
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No properties yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Add Property" to list your first property
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-32 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop";
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {property.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {property.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {property.city}
                                </span>
                                <span className="flex items-center gap-1 text-gray-500">
                                  <DollarSign className="w-3 h-3" />$
                                  {property.price}/
                                  {property.type === "rent" ? "mo" : "sale"}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    property.type === "rent"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-green-100 text-green-600"
                                  }`}>
                                  {property.type.toUpperCase()}
                                </span>
                              </div>
                              {Array.isArray(property.tags) &&
                                property.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Array.isArray(property.tags)
                                      ? property.tags.map((tag, index) => (
                                          <span
                                            key={index}
                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {tag}
                                          </span>
                                        ))
                                      : null}
                                  </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditProperty(property)}
                                className="p-2 hover:bg-gray-100 rounded-full">
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => deleteProperty(property.id)}
                                className="p-2 hover:bg-red-50 rounded-full">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingProperty ? "Edit Property" : "Add New Property"}
                </h2>
                <button
                  onClick={() => {
                    setShowPropertyModal(false);
                    resetPropertyForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={propertyForm.title}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                    placeholder="Modern 2BR Apartment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={propertyForm.description}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 h-24"
                    placeholder="Describe your property..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={propertyForm.city}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={propertyForm.state}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          state: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                      placeholder="CA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setPropertyForm({ ...propertyForm, type: "rent" })
                        }
                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                          propertyForm.type === "rent"
                            ? "bg-orange-400 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}>
                        Rent
                      </button>
                      <button
                        onClick={() =>
                          setPropertyForm({ ...propertyForm, type: "sell" })
                        }
                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                          propertyForm.type === "sell"
                            ? "bg-orange-400 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}>
                        Sell
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      value={propertyForm.price}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(propertyForm.tags)
                      ? propertyForm.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-orange-800 hover:text-red-600">
                              ×
                            </button>
                          </span>
                        ))
                      : null}
                  </div>
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                    placeholder="Add tags (press Enter)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={propertyForm.image}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        image: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPropertyModal(false);
                      resetPropertyForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={saveProperty}
                    className="px-6 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors">
                    {editingProperty ? "Update" : "Create"} Property
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
