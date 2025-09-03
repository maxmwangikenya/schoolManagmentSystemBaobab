import React, { useEffect } from 'react'
import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom'

const AdmnDashboard = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    // Only check authentication after loading is complete
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login', { replace: true })
      } else if (user.role !== 'admin') {
        console.log('User is not admin, redirecting to unauthorized');
        navigate('/unauthorized', { replace: true })
      } else {
        console.log('Admin user authenticated:', user.name);
      }
    }
  }, [user, loading, navigate])

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        <div>Checking authentication status...</div>
      </div>
    )
  }

  // Don't render anything if redirecting (user doesn't exist or not admin)
  if (!user || user.role !== 'admin') {
    return null
  }

  // Render dashboard only for authenticated admin users
  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Admin Tools</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={() => navigate('/manage-users')}
            style={{ padding: '10px 15px', cursor: 'pointer' }}
          >
            Manage Users
          </button>
          <button 
            onClick={() => navigate('/reports')}
            style={{ padding: '10px 15px', cursor: 'pointer' }}
          >
            View Reports
          </button>
          <button 
            onClick={() => navigate('/settings')}
            style={{ padding: '10px 15px', cursor: 'pointer' }}
          >
            System Settings
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => navigate('/login')}
          style={{ 
            padding: '8px 12px', 
            cursor: 'pointer',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default AdmnDashboard