import React from 'react'

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50%">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-lg">
<h2 
  className="text-3xl text-teal-600 text-center mb-8"
  style={{ fontFamily: '"Pacifico", cursive' }}
>
  Employee Management System
</h2>
        
        <form className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Login</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  transition duration-200"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                  transition duration-200"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <a 
              href="#"
              className="text-sm text-teal-600 hover:text-teal-500 hover:underline
                transition duration-200"
            >
              Forgot password?
            </a>
          </div>
          
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 
              text-white font-medium rounded-md transition duration-300
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Sign In
          </button>

          <div className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <a 
              href="#" 
              className="font-medium text-teal-600 hover:text-teal-500 hover:underline"
            >
              Register here
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login