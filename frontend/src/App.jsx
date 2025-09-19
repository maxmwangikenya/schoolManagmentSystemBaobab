import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import PrivateRoutes from './utils/PrivateRoutes';
import RoleBaseRoutes from './utils/RoleBaseRoutes';
import List from '../src/components/employees/List'
import Add from '../src/components/employees/Add';


import DepartmentList from "../src/components/department/DepartmentList";
import AddDepartmentList from "../src/components/department/AddDepartment";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AdminDashboard />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      <Route index element={<Navigate to="/admin-dashboard" />} />

      <Route path="/admin-dashboard/departments" element={<DepartmentList />} />
      <Route path="/admin-dashboard/add-department" element={<AddDepartmentList />} />
      <Route path="/admin-dashboard/department/:id" element={<AddDepartmentList />} />
      <Route path="/admin-dashboard/employees" element={<List/>}/>
      <Route path="/admin-dashboard/add-employee" element={<Add/>}/>
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<div>Unauthorized - You don't have permission to access this page</div>} />
    </Routes>
  );
}

export default App;