import React from 'react'; 
import { Routes, Route, Navigate } from "react-router-dom"; 
import Login from "./pages/Login"; 
import AdminDashboard from "./pages/AdminDashboard"; 
import EmployeeDashboard from './pages/EmployeeDashboard';
import Register from "./pages/Register"; 
import PrivateRoutes from './utils/PrivateRoutes'; 
import RoleBaseRoutes from './utils/RoleBaseRoutes'; 
import EmployeeList from '../src/components/employees/List' 
import Add from '../src/components/employees/Add'; 
import AddSalary from '../src/components/salary/Add'; 
import SalaryList from '../src/components/salary/List';   
import DepartmentList from "../src/components/department/departmentList"; 
import AddDepartmentList from "../src/components/department/AddDepartment";
import ChangePassword from "../src/components/setting/ChangePassword";
import EmployeeProfile from './components/EmployeeDashboard/Profile';
import LeaveApply from "./components/leave/Apply"; 
import EmployeeSalary from './components/salary/EmployeeSalary';

function App() {   
  return (            
    <Routes>
      <Route path="/" element={<Navigate to="/admin-dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Admin Dashboard */}
      <Route path="/admin-dashboard" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AdminDashboard />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      

      {/* Employee Routes */}
      <Route path="/admin-dashboard/employees" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <EmployeeList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      <Route path="/admin-dashboard/employees/add" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <Add />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Salary Routes */}
      <Route path="/admin-dashboard/salary" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <SalaryList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      <Route path="/admin-dashboard/salary/add" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AddSalary />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Department Routes */}
      <Route path="/admin-dashboard/departments" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <DepartmentList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      <Route path="/admin-dashboard/departments/add" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AddDepartmentList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Password Management Routes */}
      <Route path="/admin-dashboard/change-password" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin", "employee"]}>
            <ChangePassword />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Employee Change Password */}
      <Route path="/employee-dashboard/change-password" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin", "employee"]}>
            <ChangePassword />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Settings Routes */}
      <Route path="/admin-dashboard/settings" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <ChangePassword />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      <Route path="/admin-dashboard/settings/password" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin", "employee"]}>
            <ChangePassword />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Employee Dashboard */}
      <Route path='/employee-dashboard' element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <EmployeeDashboard />  
          </RoleBaseRoutes>
        </PrivateRoutes>
      }/>
       
      {/* Employee Profile */}
      <Route path="/employee-dashboard/profile/:id" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <EmployeeProfile />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />

      {/* Employee Leave */}
      <Route 
        path="/employee-dashboard/leave/:id" 
        element={
          <PrivateRoutes>  
            <RoleBaseRoutes requiredRole={["employee"]}>
              <LeaveApply />
            </RoleBaseRoutes>
          </PrivateRoutes>
        } 
      />
      {/* {employee salary} */}
      <Route
      path="/employee-dashboard/salary/:id"
      element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <Salary/>
          </RoleBaseRoutes>
        </PrivateRoutes>
      }
      />

      <Route path="*" element={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page</p>
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      } />
    </Routes>
  ); 
}  

export default App;