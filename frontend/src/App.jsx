import React from 'react'
import { Routes, Route, Navigate } from "react-router-dom"; // Remove BrowserRouter from here
import Login from "./pages/Login";
import AdmnDashboard from "./pages/AdmnDashboard";
import Register from "./pages/Register";

function App() {
  return (
    // Remove <BrowserRouter> from here - it's already in main.jsx
    <Routes>
      <Route path="/" element={<Navigate to="/admn-dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admn-dashboard" element={<AdmnDashboard />} />
      <Route path="/register" element={<Register />} />
      {/* Remove duplicate login route */}
    </Routes>
    // Remove </BrowserRouter> from here
  );
}

export default App;