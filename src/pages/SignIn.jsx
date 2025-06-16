import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUpClick = () => {
    window.location.href = "/signup";
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token and user data
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const slides = [
    {
      id: 1,
      content: (
        <div className="w-full h-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="w-40 h-32 bg-orange-600 relative">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-24 border-r-24 border-b-16 border-transparent border-b-red-800"></div>
              <div className="absolute top-4 left-4 w-6 h-6 bg-yellow-200 rounded"></div>
              <div className="absolute top-4 right-4 w-6 h-6 bg-yellow-200 rounded"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-16 bg-red-900 rounded-t"></div>
            </div>
          </div>
          <div className="absolute top-4 right-8 w-12 h-12 bg-yellow-300 rounded-full opacity-80"></div>
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div className="w-full h-full bg-gradient-to-br from-red-300 via-red-400 to-red-500 relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="w-44 h-36 bg-red-600 relative">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-28 border-r-28 border-b-20 border-transparent border-b-red-900"></div>
              <div className="absolute top-2 left-6 w-5 h-5 bg-yellow-200 rounded"></div>
              <div className="absolute top-2 left-16 w-5 h-5 bg-yellow-200 rounded"></div>
              <div className="absolute top-2 right-6 w-5 h-5 bg-yellow-200 rounded"></div>
              <div className="absolute top-12 left-6 w-6 h-8 bg-yellow-200 rounded"></div>
              <div className="absolute top-12 right-6 w-6 h-8 bg-yellow-200 rounded"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-20 bg-red-900 rounded-t"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-red-700"></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-4 w-8 h-16 bg-green-600 rounded-full"></div>
          <div className="absolute bottom-0 right-4 w-8 h-16 bg-green-600 rounded-full"></div>
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 relative">
          <div className="absolute inset-4 bg-white rounded-lg">
            <div className="absolute top-0 left-8 w-16 h-20 bg-gray-200 border-2 border-gray-400">
              <div className="absolute inset-2 border border-gray-400"></div>
            </div>
            <div className="absolute top-0 right-8 w-16 h-20 bg-gray-200 border-2 border-gray-400">
              <div className="absolute inset-2 border border-gray-400"></div>
            </div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-gray-500 rounded">
              <div className="absolute -top-2 left-2 w-6 h-6 bg-gray-400 rounded"></div>
              <div className="absolute -top-2 right-2 w-6 h-6 bg-gray-400 rounded"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-gray-600 rounded"></div>
            <div className="absolute bottom-8 left-4 w-3 h-8 bg-green-500 rounded-t-full"></div>
            <div className="absolute top-8 left-4 w-8 h-6 bg-gray-300 border border-gray-400"></div>
            <div className="absolute top-8 right-4 w-8 h-6 bg-gray-300 border border-gray-400"></div>
          </div>
        </div>
      ),
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24">
        {/* Logo */}
        <div className="mb-16">
          <div className="flex items-center space-x-4">
            {/* House Logo */}
            <div className="w-24 h-24 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Outer house outline */}
                <path
                  d="M15 85 L15 45 L50 15 L85 45 L85 85 Z"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="2"
                />
                {/* Inner house outline 1 */}
                <path
                  d="M20 80 L20 50 L50 25 L80 50 L80 80 Z"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="1.5"
                />
                {/* Inner house outline 2 */}
                <path
                  d="M25 75 L25 55 L50 35 L75 55 L75 75 Z"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="1"
                />
                {/* Door */}
                <rect
                  x="45"
                  y="65"
                  width="10"
                  height="15"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="1"
                />
                {/* Windows */}
                <rect x="35" y="55" width="8" height="8" fill="#374151" />
                <rect x="57" y="55" width="8" height="8" fill="#374151" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-800">HOUSER</h1>
          </div>
        </div>

        {/* Sign In Title */}
        <h2 className="text-4xl font-bold text-gray-800 mb-12">SIGN IN</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-8 max-w-md">
          {/* Email Field */}
          <div>
            <label className="block text-2xl font-medium text-gray-800 mb-3">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-2xl font-medium text-gray-800 mb-3">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-8">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoading}
              className="bg-teal-600 text-white px-12 py-4 rounded-lg text-xl font-bold hover:bg-teal-700 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SIGNING IN...
                </>
              ) : (
                "SIGN IN"
              )}
            </button>
            <button
              type="button"
              onClick={handleSignUpClick}
              disabled={isLoading}
              className="bg-orange-400 text-white px-12 py-4 rounded-lg text-xl font-bold hover:bg-orange-500 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed">
              SIGN UP
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Property Carousel */}
      <div className="flex-1 flex flex-col justify-center px-8">
        <div className="relative w-full h-96 rounded-3xl overflow-hidden">
          {/* Carousel Container */}
          <div
            className="flex flex-col transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateY(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
              <div key={slide.id} className="w-full h-full flex-shrink-0">
                {slide.content}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 rotate-90">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 rotate-90">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? "bg-white"
                    : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
