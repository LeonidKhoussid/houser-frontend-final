// pages/CompanyDashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchProperties } from "../services/property";

export default function CompanyDashboard() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetchProperties();
      setProperties(res.data);
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Listings</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <div
            key={prop.id}
            className="border shadow rounded-lg overflow-hidden bg-white">
            <img
              src={prop.image || "/placeholder.jpg"}
              alt={prop.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1">{prop.title}</h2>
              <p className="text-gray-600 text-sm mb-2">{prop.description}</p>
              <div className="text-teal-700 font-bold text-lg">
                ${prop.price}
              </div>
              <div className="text-sm text-gray-500 mt-1 capitalize">
                Type: {prop.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
