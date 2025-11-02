import React from 'react'; 
import { Routes, Route, Navigate } from "react-router-dom"; 
import Login from "./pages/Login"; 
import AdminDashboard from "./pages/AdminDashboard"; 
import EmployeeDashboard from './pages/EmployeeDashboard';
import Register from "./pages/Register"; 
import PrivateRoutes from './utils/PrivateRoutes'; 
import RoleBaseRoutes from './utils/RoleBaseRoutes'; 

// Admin & Employee Components
import EmployeeList from '../src/components/employees/List'; 
import Add from '../src/components/employees/Add'; 
import AddSalary from '../src/components/salary/Add'; 
import SalaryList from '../src/components/salary/List';   
import DepartmentList from "../src/components/department/DepartmentList"; 
import AddDepartmentList from "../src/components/department/AddDepartment";
import SettingsPasswordManagement from "../src/components/setting/SettingsPasswordManagement"; 
import EmployeeProfile from './components/EmployeeDashboard/Profile';
import EmployeeSalary from '../src/components/salary/EmployeeSalary';
import ReportList from './components/report/ReportList';

// Payroll
import PayrollGenerate from './components/payroll/generatePayroll';
import PayrollList from './components/payroll/viewPayroll';
import EmployeePayslipsList from './components/payroll/employeePayrollList';
import PayslipViewer from './components/payroll/payslipViewer';

// Leave modules
import EmployeeLeaves from './components/employees/EmployeeLeaves'; // ✅ NEW EMPLOYEE LEAVE PORTAL
import LeaveApply from "./components/leave/Apply"; // used for admin leave management

function App() {   
  return (            
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/admin-dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* --------------------- ADMIN ROUTES --------------------- */}

      {/* Admin Dashboard */}
      <Route path="/admin-dashboard" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AdminDashboard />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Employee Management */}
      <Route path="/admin-dashboard/employees" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <EmployeeList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      <Route path="/admin-dashboard/add-employee" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <Add />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Salary Management */}
      <Route path="/admin-dashboard/salaries" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <SalaryList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      <Route path="/admin-dashboard/salaries/add" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AddSalary />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Department Management */}
      <Route path="/admin-dashboard/departments" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <DepartmentList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      <Route path="/admin-dashboard/add-department" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <AddDepartmentList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Admin Settings */}
      <Route path="/admin-dashboard/settings" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <SettingsPasswordManagement />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />

      {/* Admin Leave Management */}
      <Route path="/admin-dashboard/leaves" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <LeaveApply />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />

      {/* Payroll */}
      <Route path="/admin-dashboard/payroll" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <PayrollGenerate />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />    
      <Route path="/admin-dashboard/view-payroll" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <PayrollList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />    

      {/* Reports */}
      <Route path="/admin-dashboard/Report/ReportList" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["admin"]}>
            <ReportList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* --------------------- EMPLOYEE ROUTES --------------------- */}

      {/* Employee Dashboard */}
      <Route path='/employee-dashboard' element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <EmployeeDashboard />  
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />

      {/* Employee Profile */}
      <Route path="/employee-dashboard/profile/:id" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <EmployeeProfile />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />

      {/*Employee Leave Portal */}
      <Route path="/employee-dashboard/leaves/:id" element={
        <PrivateRoutes>  
          <RoleBaseRoutes requiredRole={["employee"]}>
            <EmployeeLeaves />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Employee Salary */}
      <Route path="/employee-dashboard/salary/:id" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <EmployeeSalary />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />
      
      {/* Employee Settings */}
      <Route path="/employee-dashboard/settings" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <SettingsPasswordManagement />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />

      {/* Payslip & Payroll */}
      <Route path="/employee-dashboard/view-payslips" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <EmployeePayslipsList />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />    

      <Route path="/employee-dashboard/payslip-view/:payrollId" element={
        <PrivateRoutes>
          <RoleBaseRoutes requiredRole={["employee"]}>
            <PayslipViewer />
          </RoleBaseRoutes>
        </PrivateRoutes>
      } />   

      {/* Fallback Route */}
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
