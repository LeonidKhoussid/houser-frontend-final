import React, { useState } from "react";
import { Plus, X } from "lucide-react";

export default function HouserSignup() {
  const [userType, setUserType] = useState("");
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [homes, setHomes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [homeData, setHomeData] = useState({
    images: [],
    description: "",
    tags: [],
    type: "RENT",
    price: "",
  });
  const [currentTag, setCurrentTag] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phoneNumber.trim()) return "Phone number is required";
    if (!formData.password) return "Password is required";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    if (!userType) return "Please select if you are a buyer or seller";
    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          user_type: userType.toLowerCase(),
        }),
      });

      console.log("Response status:", response.status);

      // Read the response only once
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setSuccess("Registration successful! Welcome to Houser!");
        console.log("Registration successful:", data);
        // You might want to redirect here or show a success message
      } else {
        // Handle Laravel validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setError(errorMessages.join(", "));
        } else {
          setError(data.message || "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeDataChange = (e) => {
    setHomeData({
      ...homeData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      setHomeData({
        ...homeData,
        tags: [...homeData.tags, currentTag.trim()],
      });
      setCurrentTag("");
    }
  };

  const removeTag = (indexToRemove) => {
    setHomeData({
      ...homeData,
      tags: homeData.tags.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setHomeData({
      ...homeData,
      images: [...homeData.images, ...imageUrls],
    });
  };

  const removeImage = (indexToRemove) => {
    setHomeData({
      ...homeData,
      images: homeData.images.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleSaveHome = () => {
    if (homeData.description && homeData.price) {
      setHomes([...homes, { ...homeData, id: Date.now() }]);
      setHomeData({
        images: [],
        description: "",
        tags: [],
        type: "RENT",
        price: "",
      });
      setShowHomeModal(false);
    }
  };

  const openHomeModal = () => {
    setShowHomeModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">SIGN UP</h1>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-light text-gray-700">HOUSER</h2>
            <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center">
              <div className="w-10 h-8 border-2 border-gray-400 border-b-4 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-400"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-gray-400"></div>
                <div className="absolute top-1 left-1 w-1 h-1 bg-gray-400"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 mb-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="flex items-center">
            <label className="w-48 text-xl text-black">First name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="flex-1 h-12 border-2 border-gray-300 rounded-md px-4 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <label className="w-48 text-xl text-black">Last name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="flex-1 h-12 border-2 border-gray-300 rounded-md px-4 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <label className="w-48 text-xl text-black">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="flex-1 h-12 border-2 border-gray-300 rounded-md px-4 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <label className="w-48 text-xl text-black">Phone Number:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="flex-1 h-12 border-2 border-gray-300 rounded-md px-4 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <label className="w-48 text-xl text-black">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="flex-1 h-12 border-2 border-gray-300 rounded-md px-4 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <label className="w-48 text-xl text-black">Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="flex-1 h-12 border-2 border-gray-300 rounded-md px-4 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* User Type Selection */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-black mb-6">ARE YOU A</h3>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleUserTypeSelect("buyer")}
              disabled={isLoading}
              className={`px-8 py-4 text-xl font-semibold rounded-full transition-all ${
                userType === "buyer"
                  ? "bg-teal-600 text-white"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              BUYER
            </button>
            <button
              onClick={() => handleUserTypeSelect("seller")}
              disabled={isLoading}
              className={`px-8 py-4 text-xl font-semibold rounded-full transition-all ${
                userType === "seller"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              SELLER
            </button>
          </div>
        </div>

        {/* Add Home Section - Only shown for sellers */}
        {userType === "seller" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">
                Add your first home
              </h3>
              <button
                onClick={openHomeModal}
                className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Plus size={24} />
              </button>
            </div>

            {/* Display saved homes */}
            <div className="grid gap-6">
              {homes.map((home) => (
                <div
                  key={home.id}
                  className="flex gap-6 p-4 bg-white rounded-lg shadow-sm border">
                  <div className="w-80 h-48 bg-gray-200 rounded-lg overflow-hidden">
                    {home.images.length > 0 ? (
                      <img
                        src={home.images[0]}
                        alt="Home"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {home.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {home.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-semibold ${
                          home.type === "RENT"
                            ? "bg-orange-500 text-white"
                            : "bg-orange-500 text-white"
                        }`}>
                        {home.type}
                      </span>
                      <span className="text-lg font-bold">${home.price}</span>
                    </div>
                  </div>
                </div>
              ))}

              {homes.length === 0 && (
                <div className="flex gap-6">
                  <div className="w-80 h-48 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80"
                      alt="Modern house exterior"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">
                      House is located in a relatively good spot, close to a
                      lake for fishing, good weather in the city year round.
                      Lots of shopping malls nearby.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      Inside, the house is cozy and bright, with large windows
                      that let in plenty of natural sunlight. The kitchen has a
                      spacious dining table, perfect for family meals, while the
                      living room features a soft, comfy couch—ideal for
                      relaxing in the evenings.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      Outside, there's a lovely garden with fruit trees and a
                      barbecue area, just right for summer gatherings. The
                      neighborhood is quiet and peaceful, so you can enjoy your
                      time without any disturbances.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className={`bg-teal-600 text-white text-xl font-semibold px-12 py-4 rounded-lg transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-700"
            }`}>
            {isLoading ? "Creating Account..." : "Continue"}
          </button>
        </div>

        {/* Home Modal */}
        {showHomeModal && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Add New Home</h2>
                  <button
                    onClick={() => setShowHomeModal(false)}
                    className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

                {/* Image Upload Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Photos</h3>
                  <div className="flex gap-4 mb-4 overflow-x-auto">
                    {homeData.images.map((image, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <img
                          src={image}
                          alt={`Home ${index + 1}`}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          ×
                        </button>
                      </div>
                    ))}
                    {homeData.images.length < 6 && (
                      <label className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 flex-shrink-0">
                        <Plus size={24} className="text-gray-400" />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    About the place:
                  </h3>
                  <textarea
                    name="description"
                    value={homeData.description}
                    onChange={handleHomeDataChange}
                    className="w-full h-32 border-2 border-gray-300 rounded-lg p-4 resize-none focus:border-orange-500 focus:outline-none"
                    placeholder="Describe your property..."
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {homeData.description.length}/500
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {homeData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {tag}
                        <button
                          onClick={() => removeTag(index)}
                          className="text-white hover:text-red-200">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none"
                    placeholder="Add tag and press Enter"
                  />
                </div>

                {/* Type Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Type:</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setHomeData({ ...homeData, type: "RENT" })}
                      className={`px-6 py-2 rounded-full font-semibold ${
                        homeData.type === "RENT"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}>
                      RENT
                    </button>
                    <button
                      onClick={() => setHomeData({ ...homeData, type: "SELL" })}
                      className={`px-6 py-2 rounded-full font-semibold ${
                        homeData.type === "SELL"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}>
                      SELL
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Price:</h3>
                  <input
                    type="number"
                    name="price"
                    value={homeData.price}
                    onChange={handleHomeDataChange}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2 w-40 focus:border-orange-500 focus:outline-none"
                    placeholder="1500"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveHome}
                    className="bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors">
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
