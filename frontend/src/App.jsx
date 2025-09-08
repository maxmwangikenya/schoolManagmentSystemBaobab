// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdmnDashboard from "./pages/AdmnDashboard";
import Register from "./pages/Register";
import PrivateRoutes from './utils/PrivateRoutes';
import RoleBaseRoutes from './utils/RoleBaseRoutes';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admn-dashboard" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AdmnDashboard />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<div>Unauthorized - You don't have permission to access this page</div>} />
    </Routes>
  );
}

export default App;