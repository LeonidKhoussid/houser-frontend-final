import React, { useState } from "react";
import { apiCall } from "../services/api";

export default function AddHome() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "rent",
    city: "",
    state: "",
    tags: [],
    images: [],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentTag, setCurrentTag] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const addImages = (files) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      setError(
        "Some files were skipped. Only JPEG, JPG, PNG, and GIF files are allowed."
      );
      setTimeout(() => setError(""), 3000);
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImageFiles((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setError("");
    }
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setImageUploading(true);
    let imagePaths =
      formData.images && formData.images.length > 0 ? formData.images : [];

    if (imageFiles.length > 0) {
      const token = localStorage.getItem("auth_token");
      const uploadFormData = new FormData();
      imageFiles.forEach((file, index) => {
        uploadFormData.append("image", file);
      });
      const res = await fetch("/api/upload-images", {
        method: "POST",
        body: uploadFormData,
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
    setImageUploading(false);

    if (
      !formData.title.trim() ||
      !formData.city.trim() ||
      !formData.price ||
      !formData.type.trim()
    ) {
      setError(
        "Please fill in all required fields: Title, City, Price, and Type."
      );
      return;
    }

    try {
      const propertyData = {
        title: formData.title || "",
        description: formData.description || "",
        price: parseFloat(formData.price) || 0,
        type: formData.type || "rent",
        city: formData.city || "",
        state: typeof formData.state === "string" ? formData.state : "",
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        images: imagePaths,
      };

      const newProperty = await apiCall("/properties", {
        method: "POST",
        body: JSON.stringify(propertyData),
      });
      setSuccess("Property created successfully!");
      setFormData({
        title: "",
        description: "",
        price: "",
        type: "rent",
        city: "",
        state: "",
        tags: [],
        images: [],
      });
      setCurrentTag("");
      setImageFiles([]);
      setImagePreviews([]);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setImageUploading(false);
      console.error("Failed to create property:", error);
      setError("Failed to create property. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Add New Property
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="w-full border p-2"
            value={formData.title}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full border p-2"
            rows="4"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            className="w-full border p-2"
            value={formData.price}
            onChange={handleChange}
          />
          <select
            name="type"
            className="w-full border p-2"
            value={formData.type}
            onChange={handleChange}>
            <option value="rent">Rent</option>
            <option value="sell">Sell</option>
          </select>
          <input
            type="text"
            name="city"
            placeholder="City"
            className="w-full border p-2"
            value={formData.city}
            onChange={handleChange}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            className="w-full border p-2"
            value={formData.state}
            onChange={handleChange}
          />

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Property Images
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("image-upload").click()}>
              {imagePreviews.length > 0 ? (
                <div className="space-y-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="max-h-48 mx-auto object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeImage(index);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        ×
                      </button>
                    </div>
                  ))}
                  <p className="text-sm text-gray-500">
                    Click to remove an image or drag and drop new ones
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500">
                    Drag and drop images here, or click to select
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Allowed: JPEG, JPG, PNG, GIF
                  </p>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageChange}
                className="hidden"
                multiple
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                placeholder="Add a tag"
                className="flex-1 border p-2 rounded"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={imageUploading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50">
            {imageUploading ? "Uploading..." : "Create Property"}
          </button>
        </form>
      </div>
    </div>
  );
}
