import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Plus,
  Home,
  Trash2,
  DollarSign,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { apiCall, getImageUrl, getImageUrls } from "../services/api";
import Layout from "../components/Layout";
import PropertyModal from "../components/PropertyModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    description: "",
    price: "",
    type: "rent",
    city: "",
    state: "",
    tags: [],
    images: [],
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });
  const [currentTag, setCurrentTag] = useState("");
  const [propertyImageUploading, setPropertyImageUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProperties();
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        state: user.state || "",
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userData = await apiCall("/user");
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProperties = async () => {
    try {
      const userProperties = await apiCall("/user/properties");
      setProperties(userProperties);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      setError("Failed to load properties");
    }
  };

  const updateProfile = async () => {
    try {
      const response = await apiCall("/user/profile", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });
      setUser(response);
      localStorage.setItem("user", JSON.stringify(response));
      setEditingProfile(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile");
    }
  };

  const apiCall = async (endpoint, options = {}) => {
    const url = `/api${endpoint}`;
    const token = localStorage.getItem("auth_token");

    if (!token) {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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

  const addTag = () => {
    if (currentTag.trim() && !propertyForm.tags.includes(currentTag.trim())) {
      setPropertyForm(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setPropertyForm({
      ...propertyForm,
      tags: propertyForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      const newTag = currentTag.trim();
      if (!propertyForm.tags.includes(newTag)) {
        setPropertyForm({
          ...propertyForm,
          tags: [...propertyForm.tags, newTag],
        });
      }
      setCurrentTag("");
    }
  };

  // Create or update property
  const saveProperty = async (formData) => {
    try {
      setError("");
      setPropertyImageUploading(true);

      let imagePaths = propertyForm.images || [];
      
      if (formData && formData.has('image')) {
        const imageFormData = new FormData();
        formData.getAll('image').forEach((image) => {
          imageFormData.append('image', image);
        });
        
        const token = localStorage.getItem("auth_token");
        const res = await fetch("/api/upload-images", {
          method: "POST",
          body: imageFormData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to upload images");
        }
        const data = await res.json();
        imagePaths = data.image_paths;
      }

      setPropertyImageUploading(false);

      const propertyData = {
        title: formData.get('title') || propertyForm.title,
        description: formData.get('description') || propertyForm.description,
        price: parseFloat(formData.get('price')) || parseFloat(propertyForm.price) || 0,
        type: formData.get('type') || propertyForm.type,
        city: formData.get('city') || propertyForm.city,
        state: formData.get('state') || propertyForm.state,
        tags: propertyForm.tags,
        images: imagePaths,
      };

      const tags = [];
      for (let i = 0; formData.has(`tags[${i}]`); i++) {
        tags.push(formData.get(`tags[${i}]`));
      }
      propertyData.tags = tags;

      if (editingProperty) {
        const response = await apiCall(`/properties/${editingProperty.id}`, {
          method: "PUT",
          body: JSON.stringify(propertyData),
        });
        if (!response || !response.property) {
          throw new Error("Invalid update response");
        }
        setProperties((prev) =>
          prev.map((p) => (p.id === editingProperty.id ? response.property : p))
        );
        setSuccess("Property updated successfully!");
      } else {
        // Create new property
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
      setPropertyImageUploading(false);
      console.error("Failed to save property:", error);
      setError("Failed to save property. Please try again.");
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
      images: [],
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
      images: property.images || [],
    });
    setShowPropertyModal(true);
  };

  // Delete property
  const deleteProperty = async (propertyId) => {
    if (!confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await apiCall(`/properties/${propertyId}`, {
        method: "DELETE",
      });
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      setSuccess("Property deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to delete property:", error);
      setError("Failed to delete property. Please try again.");
    }
  };

  if (!user) {
    return (
      <Layout 
        user={user}
        onRefresh={() => window.location.reload()}
        onLogout={() => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          window.location.href = "/signin";
        }}
        onCityChange={() => setShowPropertyModal(true)}
        onFilterToggle={() => setShowPropertyModal(true)}
      >
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      user={user}
      onRefresh={() => window.location.reload()}
      onLogout={() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/signin";
      }}
      onCityChange={() => setShowPropertyModal(true)}
      onFilterToggle={() => setShowPropertyModal(true)}
    >
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
                          {/* Image Gallery */}
                          <div className="flex gap-2 overflow-x-auto max-w-xs">
                            {getImageUrls(property.images).map((imgUrl, idx) => (
                              <img
                                key={idx}
                                src={imgUrl}
                                alt={property.title}
                                className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop";
                                }}
                              />
                            ))}
                          </div>
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
          <PropertyModal
            showPropertyModal={showPropertyModal}
            setShowPropertyModal={setShowPropertyModal}
            editingProperty={editingProperty}
            propertyForm={propertyForm}
            setPropertyForm={setPropertyForm}
            resetPropertyForm={resetPropertyForm}
            onSave={saveProperty}
            error={error}
          />
        )}
      </div>
    </Layout>
  );
}

