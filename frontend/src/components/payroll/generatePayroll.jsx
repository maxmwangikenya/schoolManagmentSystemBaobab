// src/pages/admin-dashboard/PayrollGenerate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Zap, FileText, ArrowLeft } from 'lucide-react';
import axios from 'axios';

  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

const PayrollGenerate = () => {
  const navigate = useNavigate();
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess(false);

  if (!periodStart || !periodEnd) {
    setError('Both period start and end are required.');
    return;
  }

  if (new Date(periodStart) > new Date(periodEnd)) {
    setError('Period start cannot be after period end.');
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Correct axios.post usage:
    //   1st arg: URL
    //   2nd arg: DATA (the payload)
    //   3rd arg: CONFIG (headers, etc.)
    const response = await axios.post(
      `${API_BASE_URL}/api/payroll/generate`,
      {
        periodStart,
        periodEnd
      },
      {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      }
    );

    setSuccess(true);
    navigate('/admin-dashboard/view-payroll')
    setTimeout(() => {
      navigate('/admin-dashboard/payroll');
    }, 2000);
  } catch (err) {
    setError(
      err.response?.data?.message || 
      err.message || 
      'Failed to generate payroll. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="p-6 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Generate Payroll</h1>
          <p className="text-gray-600">Automatically create payroll for all employees</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Payroll Generation</h2>
          </div>
          <p className="text-green-100 text-sm mt-1">Enter the pay period to auto-generate payroll</p>
        </div>

        <div className="p-6 md:p-8">
          {success && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-green-700 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Payroll generated successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period Start
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period End
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Zap className="w-5 h-5 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate Payroll
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin-dashboard/view-payroll')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition"
              >
                View Payroll Records
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayrollGenerate;