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
          {[
            "https://storage.yandexcloud.net/houser/DJI_0281_bj.1011f88e.jpg",
            "https://storage.yandexcloud.net/houser/5bf49cbfd8cb46ba9c622d17322e1209.jpeg",
            "https://storage.yandexcloud.net/houser/313364-Alabaster-Caviar-TeakStain-A-copy.jpg",
            "https://storage.yandexcloud.net/houser/archdaily-houses-104.jpg",
            "https://storage.yandexcloud.net/houser/hes3-2.jpg",
            "https://storage.yandexcloud.net/houser/images.jpeg",
            "https://storage.yandexcloud.net/houser/DJI_0281_bj.1011f88e.jpg",
            "https://storage.yandexcloud.net/houser/5bf49cbfd8cb46ba9c622d17322e1209.jpeg",
            "https://storage.yandexcloud.net/houser/313364-Alabaster-Caviar-TeakStain-A-copy.jpg",
            "https://storage.yandexcloud.net/houser/archdaily-houses-104.jpg",
            "https://storage.yandexcloud.net/houser/hes3-2.jpg",
            "https://storage.yandexcloud.net/houser/images.jpeg",
          ].map((src, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-36 h-36 rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transform transition-transform hover:scale-105 bg-white">
              <img
                src={src}
                alt={`House ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
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
              Picture this: you're scrolling effortlessly through stunning
              properties, swiping right on the ones that make your heart race
              and left on the ones that don't quite fit your vision—welcome
              to Houser, the revolutionary app that brings the addictive
              simplicity of dating apps to the world of real estate, but instead
              of finding your soulmate, you're matching with your dream home or
              ideal buyer in seconds! With Houser, the days of tedious property
              searches, endless emails, and missed connections are over—our
              intuitive, swipe-based platform puts the power directly in your
              hands, allowing buyers to discover homes that align perfectly with
              their lifestyle, budget, and must-have features, while sellers get
              instant access to a pool of serious, pre-qualified buyers who are
              genuinely interested in what they're offering. For buyers, it's
              simple: set your filters, swipe through curated listings, and when
              you find the one, swipe right—if the seller reciprocates, you're
              instantly connected in a private chat where you can ask questions,
              share inspiration, schedule viewings, or even make an offer
              without ever leaving the app.
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
          <div className="flex space-x-4 overflow-hidden">
            <div className="flex-shrink-0 w-64 h-64 rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
              <img
                src="https://storage.yandexcloud.net/houser/maxresdefault.jpg"
                alt="House 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-shrink-0 w-64 h-64 rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
              <img
                src="https://storage.yandexcloud.net/houser/types-of-houses.jpeg"
                alt="House 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-shrink-0 w-64 h-64 rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-transform transform hover:scale-105">
              <img
                src="https://storage.yandexcloud.net/houser/white-modern-house-curved-patio-archway-c0a4a3b3-aa51b24d14d0464ea15d36e05aa85ac9.jpg"
                alt="House 3"
                className="w-full h-full object-cover"
              />
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
