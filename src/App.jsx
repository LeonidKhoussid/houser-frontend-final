import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import AddHome from "./pages/AddHome";
import CompanyDashboard from "./pages/CompanyDashboard";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/messages/:propertyId" element={<Messages />} />
        <Route path="/add-home" element={<AddHome />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
