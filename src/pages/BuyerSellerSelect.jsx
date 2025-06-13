// pages/BuyerSellerSelect.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BuyerSellerSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-8">Who Are You?</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <button
          onClick={() => navigate("/")}
          className="bg-teal-700 hover:bg-teal-800 text-white px-10 py-4 rounded-lg text-xl shadow-lg">
          I'm Looking for a Home 🏡
        </button>
        <button
          onClick={() => navigate("/company")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-lg text-xl shadow-lg">
          I'm a Seller or Company 🏢
        </button>
      </div>
    </div>
  );
}
