import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const LeaveStatisticsDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    departmentId: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/departments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);

      const response = await axios.get(
        `http://localhost:3000/api/reports/leaves/statistics?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  // Prepare chart data
  const leaveTypeData = statistics?.byLeaveType
    ? Object.entries(statistics.byLeaveType).map(([type, count]) => ({
        name: type,
        value: count
      }))
    : [];

  const departmentData = statistics?.byDepartment
    ? Object.entries(statistics.byDepartment).map(([dept, count]) => ({
        name: dept,
        value: count
      }))
    : [];

  const statusData = statistics
    ? [
        { name: 'Pending', value: statistics.pending, color: '#eab308' },
        { name: 'Approved', value: statistics.approved, color: '#10b981' },
        { name: 'Rejected', value: statistics.rejected, color: '#ef4444' }
      ]
    : [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = () => {
    if (!statistics) return;

    const report = {
      period: `${getMonthName(filters.month)} ${filters.year}`,
      department: filters.departmentId
        ? departments.find(d => d._id === filters.departmentId)?.dep_name
        : 'All Departments',
      summary: {
        total: statistics.total,
        pending: statistics.pending,
        approved: statistics.approved,
        rejected: statistics.rejected
      },
      byLeaveType: statistics.byLeaveType,
      byDepartment: statistics.byDepartment
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-statistics-${filters.year}-${filters.month}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Leave Statistics</h1>
              <p className="text-gray-600">Analyze leave trends and patterns</p>
            </div>
          </div>
          <button
            onClick={exportReport}
            disabled={!statistics}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Month
              </label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <select
                value={filters.departmentId}
                onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.dep_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-10 h-10" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Total Leaves</p>
                  <p className="text-4xl font-bold">{statistics.total}</p>
                </div>
              </div>
              <div className="text-sm opacity-90">
                {getMonthName(filters.month)} {filters.year}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-10 h-10" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="text-4xl font-bold">{statistics.pending}</p>
                </div>
              </div>
              <div className="text-sm opacity-90">
                {statistics.total > 0
                  ? ((statistics.pending / statistics.total) * 100).toFixed(1)
                  : 0}% of total
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-10 h-10" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Approved</p>
                  <p className="text-4xl font-bold">{statistics.approved}</p>
                </div>
              </div>
              <div className="text-sm opacity-90">
                {statistics.total > 0
                  ? ((statistics.approved / statistics.total) * 100).toFixed(1)
                  : 0}% of total
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-10 h-10" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Rejected</p>
                  <p className="text-4xl font-bold">{statistics.rejected}</p>
                </div>
              </div>
              <div className="text-sm opacity-90">
                {statistics.total > 0
                  ? ((statistics.rejected / statistics.total) * 100).toFixed(1)
                  : 0}% of total
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Leave Status Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-6 h-6 text-blue-600" />
              Leave Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leave Types */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Leaves by Type
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leaveTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          {departmentData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Leaves by Department
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Detailed Breakdown Tables */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leave Types Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Leave Types Breakdown</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Leave Type</th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-700">Count</th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statistics.byLeaveType).map(([type, count], index) => (
                    <tr key={type} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-gray-800">{type}</span>
                        </div>
                      </td>
                      <td className="text-right py-3">
                        <span className="font-semibold text-gray-800">{count}</span>
                      </td>
                      <td className="text-right py-3">
                        <span className="text-gray-600">
                          {statistics.total > 0
                            ? ((count / statistics.total) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Table */}
          {departmentData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Department Breakdown</h2>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-semibold text-gray-700">Department</th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-700">Count</th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistics.byDepartment).map(([dept, count], index) => (
                      <tr key={dept} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-gray-800">{dept}</span>
                          </div>
                        </td>
                        <td className="text-right py-3">
                          <span className="font-semibold text-gray-800">{count}</span>
                        </td>
                        <td className="text-right py-3">
                          <span className="text-gray-600">
                            {statistics.total > 0
                              ? ((count / statistics.total) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveStatisticsDashboard;