import React, { useState, useRef } from "react";
import { X, Upload, Trash2 } from "lucide-react";

const PropertyModal = ({
  showPropertyModal,
  setShowPropertyModal,
  editingProperty,
  propertyForm,
  setPropertyForm,
  resetPropertyForm,
  onSave,
  error,
}) => {
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValidType) {
        alert(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > 10) {
      alert("You can only upload up to 10 images per property");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
  };

  // Remove image from preview
  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Add tag
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

  // Remove tag
  const removeTag = (tagToRemove) => {
    setPropertyForm({
      ...propertyForm,
      tags: propertyForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle save with images
  const handleSave = async () => {
    // Validate required fields
    if (!propertyForm.title.trim()) {
      alert("Please enter a property title");
      return;
    }
    if (!propertyForm.city.trim()) {
      alert("Please enter a city");
      return;
    }
    if (!propertyForm.price) {
      alert("Please enter a price");
      return;
    }
    if (images.length === 0 && !editingProperty) {
      alert("Please add at least one image");
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add all form fields
      formData.append("title", propertyForm.title);
      formData.append("description", propertyForm.description);
      formData.append("price", propertyForm.price);
      formData.append("type", propertyForm.type);
      formData.append("city", propertyForm.city);
      if (propertyForm.state) {
        formData.append("state", propertyForm.state);
      }

      // Add tags
      propertyForm.tags.forEach((tag) => {
        formData.append("tags", tag);
      });

      // Add images
      images.forEach((image, index) => {
        formData.append('image', image);
      });

      // Call the save function
      await onSave(formData);

      // Reset on success
      setImages([]);
      setCurrentTag("");
    } catch (error) {
      console.error("Error saving property:", error);
    } finally {
      setUploading(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setShowPropertyModal(false);
    resetPropertyForm();
    setImages([]);
    setCurrentTag("");
  };

  if (!showPropertyModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {editingProperty ? "Edit Property" : "Add New Property"}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Property Details */}
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Title */}
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

              {/* Description */}
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

              {/* City and State */}
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

              {/* Type and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
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
                      type="button"
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

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {propertyForm.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-orange-800 hover:text-red-600">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  placeholder="Add tags (press Enter)"
                />
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Property Images * (Max 10 images)
                </label>

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${
                    dragOver
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />

                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop images here or click to upload
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {images.length}/10 images selected
                  </p>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>

                        <div className="mt-1">
                          <p className="text-xs text-gray-600 truncate">
                            {image.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(image.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading || (!editingProperty && images.length === 0)}
              className="px-6 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>{editingProperty ? "Update" : "Create"} Property</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
