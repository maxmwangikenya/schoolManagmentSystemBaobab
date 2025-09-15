import React, { useState } from 'react';

// Custom icon components
const BuildingIcon = () => (
  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-4a1 1 0 011-1h4a1 1 0 011 1v4M7 5h2m4 0h2m-6 4h2m4 0h2m-6 4h2m4 0h2" />
  </svg>
);

const SmallBuildingIcon = () => (
  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-4a1 1 0 011-1h4a1 1 0 011 1v4M7 5h2m4 0h2m-6 4h2m4 0h2m-6 4h2m4 0h2" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const AddDepartment = () => {
  const [department, setDepartment] = useState({
    dep_name: '',
    description: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment({ ...department, [name]: value });
    // Clear any previous messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Simulate API call since we don't have axios imported
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Uncomment and modify this when you have axios available:
      /*
      const response = await axios.post('http://localhost:5000/api/department/add', department, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      */

      // Success simulation
      setMessage({ 
        type: 'success', 
        text: 'Department added successfully!' 
      });
      
      // Reset the department state
      setDepartment({
        dep_name: '',
        description: ''
      });

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add department. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <BuildingIcon />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Department</h1>
          <p className="text-gray-600">Create a new department to organize your company structure</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon />
              ) : (
                <AlertCircleIcon />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}
          
          <div className="space-y-6">
            {/* Department Name Field */}
            <div className="space-y-2">
              <label 
                htmlFor="dep_name" 
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <SmallBuildingIcon />
                Department Name
              </label>
              <input 
                type="text" 
                id="dep_name"
                name="dep_name"
                value={department.dep_name}
                onChange={handleChange}
                placeholder="e.g., Human Resources, Marketing, Engineering"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
                disabled={isLoading}
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label 
                htmlFor="description" 
                className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <FileTextIcon />
                Description
              </label>
              <textarea 
                name="description" 
                id="description"
                value={department.description}
                onChange={handleChange}
                placeholder="Describe the department's purpose, responsibilities, and key functions..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !department.dep_name.trim()}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon />
                    Adding Department...
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Add Department
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">
              Make sure the department name is unique and descriptive for easy identification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepartment;