import React, { useState } from "react";
import { Search, Check, X, Home } from "lucide-react";

export default function HouserLandingPage() {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSignInClick = () => {
    window.location.href = "/signin";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-4 border-b">
        <div className="flex space-x-8">
          <button className="text-gray-700 font-medium">BUY</button>
          <button className="text-gray-700 font-medium">RENT</button>
          <button className="text-gray-700 font-medium">SELL</button>
        </div>

        <div className="flex items-center space-x-2">
          <Home className="w-6 h-6 text-gray-700" />
          <span className="text-xl font-bold text-gray-800">HOUSER</span>
        </div>

        <button
          onClick={handleSignInClick}
          className="bg-teal-600 text-white px-6 py-2 rounded font-medium">
          SIGN IN
        </button>
      </header>

      {/* Hero Section with Search */}
      <section className="px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Address, Postal Code, City"
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:border-gray-400"
            />
            <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Property Images Grid */}
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="w-16 h-12 bg-white rounded opacity-60"></div>
            </div>
          </div>
          <div className="flex-shrink-0 w-32 h-32 bg-gray-800 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <div className="w-16 h-12 bg-gray-600 rounded opacity-60"></div>
            </div>
          </div>
          <div className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
              <div className="w-20 h-16 bg-white rounded opacity-80"></div>
            </div>
          </div>
          <div className="flex-shrink-0 w-32 h-32 bg-orange-200 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center">
              <div className="w-16 h-12 bg-white rounded opacity-60"></div>
            </div>
          </div>
          <div className="flex-shrink-0 w-32 h-32 bg-blue-200 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-green-400 flex items-center justify-center">
              <div className="w-16 h-12 bg-white rounded opacity-60"></div>
            </div>
          </div>
          <div className="flex-shrink-0 w-32 h-32 bg-purple-200 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-purple-300 to-blue-400 flex items-center justify-center">
              <div className="w-16 h-12 bg-white rounded opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Text Banner */}
      <div className="bg-white border-y overflow-hidden">
        <div className="flex animate-pulse">
          <div className="flex space-x-4 py-4">
            <span className="text-orange-500 font-bold whitespace-nowrap">
              FINDING HOUSING HAS NEVER BEEN EASIER.
            </span>
            <span className="text-teal-600 font-bold whitespace-nowrap">
              FINDING HOUSING HAS NEVER BEEN EASIER.
            </span>
            <span className="text-orange-500 font-bold whitespace-nowrap">
              FINDING HOUSING HAS NEVER BEEN EASIER.
            </span>
            <span className="text-teal-600 font-bold whitespace-nowrap">
              FINDING HOUSING HAS NEVER BEEN EASIER.
            </span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center space-y-8 lg:space-y-0 lg:space-x-12">
          {/* Left side - Cards and Icons */}
          <div className="flex-1 flex flex-col items-center space-y-8">
            {/* Stacked Cards */}
            <div className="relative">
              <div className="w-48 h-32 bg-orange-400 rounded-lg transform rotate-3"></div>
              <div className="w-48 h-32 bg-orange-500 rounded-lg transform -rotate-2 -mt-28 ml-4"></div>
              <div className="w-48 h-32 bg-teal-600 rounded-lg transform rotate-1 -mt-28 ml-8"></div>
            </div>

            {/* Check and X Icons */}
            <div className="flex space-x-12">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Right side - Text Content */}
          <div className="flex-1 max-w-lg">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              HOW IT WORKS
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {/* Insert "How It Works" description text here */}
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Scrolling Banner */}
      <div className="bg-white border-y overflow-hidden">
        <div className="flex animate-pulse">
          <div className="flex space-x-4 py-4">
            <span className="text-orange-500 font-bold whitespace-nowrap">
              FINDING HOUSING HAS NEVER BEEN EASIER.
            </span>
            <span className="text-teal-600 font-bold whitespace-nowrap">
              FINDING HOUSING HAS NEVER BEEN EASIER.
            </span>
            <span className="text-orange-500 font-bold whitespace-nowrap">
              FINDING HOUSING HAS NEVER BEEN EASIER.
            </span>
            <span className="text-teal-600 font-bold whitespace-nowrap">
              FINDING HOUSING HAS NEVER BEEN EASIER.
            </span>
          </div>
        </div>
      </div>

      {/* History Section */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">HISTORY</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Swipe-style property browsing emerged in 2014-2015 with apps like
            Housing, offering visual, mobile-first home searching. The format
            proved popular for its speed and simplicity. By 2018, major
            platforms adopted similar interfaces, adding AI recommendations.
            Today's apps like Houser have evolved into full transaction
            platforms with instant matching and in-app deals, transforming how
            people buy and sell homes.
          </p>

          {/* House Images */}
          <div className="flex space-x-4 overflow-x-auto">
            <div className="flex-shrink-0 w-64 h-64 rounded-xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 flex items-end justify-center">
                <div
                  className="w-32 h-40 bg-gradient-to-t from-yellow-600 to-yellow-400 mb-8"
                  style={{
                    clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
                  }}></div>
              </div>
            </div>
            <div className="flex-shrink-0 w-64 h-64 rounded-xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-100 flex items-end justify-center">
                <div className="w-40 h-48 bg-white border-2 border-gray-400 mb-8 relative">
                  <div className="absolute top-4 left-4 w-6 h-6 bg-gray-300"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 bg-gray-300"></div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 w-64 h-64 rounded-xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-end justify-center">
                <div className="w-36 h-44 bg-gray-700 mb-8 relative">
                  <div className="absolute top-3 left-3 w-5 h-5 bg-gray-500"></div>
                  <div className="absolute top-3 right-3 w-5 h-5 bg-gray-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Button */}
      <div className="px-4 py-8 text-center">
        <button className="bg-teal-600 text-white px-12 py-4 rounded-lg text-xl font-bold hover:bg-teal-700 transition-colors">
          GET STARTED!
        </button>
      </div>

      {/* Contact Form */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            LEARN MORE BY LEAVING YOUR PHONE NUMBER!
          </h3>
          <p className="text-gray-600 mb-6">we'll get in contact ASAP</p>

          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-left text-gray-700 font-medium mb-2">
                Phone Number:
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-teal-500"
                placeholder="Enter your phone number"
              />
            </div>
            <button className="bg-teal-600 text-white px-8 py-3 rounded font-bold mt-8 hover:bg-teal-700 transition-colors">
              SEND
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
