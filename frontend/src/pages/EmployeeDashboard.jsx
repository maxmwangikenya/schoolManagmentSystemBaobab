import React from 'react' // Make sure to import AdminSidebar
import Navbar from '../components/dashboard/Navbar'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/EmployeeDashboard/Sidebar'// Make sure to import Navbar

const EmployeeDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1">
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
          <Navbar />
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default EmployeeDashboard