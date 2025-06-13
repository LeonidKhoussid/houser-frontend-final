// pages/AddHome.jsx
import React, { useState } from "react";
import { createProperty } from "../services/property";

export default function AddHome() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    type: "rent",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProperty(form);
    alert("Property created!");
    setForm({ title: "", description: "", price: "", type: "rent", image: "" });
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Property</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full border p-2"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full border p-2"
          rows="4"
          value={form.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          className="w-full border p-2"
          value={form.price}
          onChange={handleChange}
        />
        <select
          name="type"
          className="w-full border p-2"
          value={form.type}
          onChange={handleChange}>
          <option value="rent">Rent</option>
          <option value="buy">Buy</option>
        </select>
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          className="w-full border p-2"
          value={form.image}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-teal-700 text-white py-2 rounded text-lg">
          Submit
        </button>
      </form>
    </div>
  );
}
