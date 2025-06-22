import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const slides = [
    {
      id: 1,
      content: <img src="https://storage.yandexcloud.net/houser/slide1.jpg" />,
    },
    {
      id: 2,
      content: <img src="https://storage.yandexcloud.net/houser/slide2.avif" />,
    },
    {
      id: 3,
      content: <img src="https://storage.yandexcloud.net/houser/slide3.webp" />,
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24">
        {/* Logo */}
        <div className="mb-16">
          <div className="flex items-center space-x-4">
            {/* House Logo */}
            <div className="w-24 h-24 flex items-center justify-center">
              <img src="https://storage.yandexcloud.net/houser/Group%2066%20(2).png" />
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
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="w-full h-full flex-shrink-0 rounded-3xl overflow-hidden shadow-lg">
                <div className="w-full h-full">
                  <img
                    src={slide.content.props.src}
                    alt={`Slide ${slide.id}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
