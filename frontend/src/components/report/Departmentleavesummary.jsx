import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Download
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
  Cell
} from 'recharts';

const DepartmentLeaveSummary = () => {
  
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  useEffect(() => {
    fetchDepartmentSummary();
  }, []);

  const fetchDepartmentSummary = async () => {
    try {
      setLoading(true);
      setError(null);
          const res = await axios.get(`${API_BASE_URL}/api/reports/leaves/department-summary`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSummary(res.data.data || []);
    } catch (error) {
      console.error('Error fetching department summary:', error);
      setError('Failed to fetch department summary');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#ef4444', '#6366f1'
  ];

  // Calculate totals
  const totals = summary.reduce(
    (acc, dept) => ({
      employees: acc.employees + dept.totalEmployees,
      leaves: acc.leaves + dept.totalLeaves,
      pending: acc.pending + dept.pendingLeaves,
      approved: acc.approved + dept.approvedLeaves,
      rejected: acc.rejected + dept.rejectedLeaves
    }),
    { employees: 0, leaves: 0, pending: 0, approved: 0, rejected: 0 }
  );

  // Prepare chart data
  const barChartData = summary.map(dept => ({
    name: dept.departmentName.length > 15
      ? dept.departmentName.substring(0, 15) + '...'
      : dept.departmentName,
    fullName: dept.departmentName,
    Total: dept.totalLeaves,
    Pending: dept.pendingLeaves,
    Approved: dept.approvedLeaves,
    Rejected: dept.rejectedLeaves
  }));

  const pieChartData = summary.map((dept, index) => ({
    name: dept.departmentName,
    value: dept.totalLeaves,
    color: COLORS[index % COLORS.length]
  }));

  const exportToCSV = () => {
    const headers = [
      'Department',
      'Total Employees',
      'Total Leaves',
      'Pending Leaves',
      'Approved Leaves',
      'Rejected Leaves',
      'Leave Rate (%)'
    ];

    const rows = summary.map(dept => [
      dept.departmentName,
      dept.totalEmployees,
      dept.totalLeaves,
      dept.pendingLeaves,
      dept.approvedLeaves,
      dept.rejectedLeaves,
      dept.totalEmployees > 0
        ? ((dept.totalLeaves / dept.totalEmployees) * 100).toFixed(2)
        : '0.00'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `department-leave-summary-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading department summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 text-lg font-semibold">{error}</p>
          <button
            onClick={fetchDepartmentSummary}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
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
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Department Leave Summary</h1>
              <p className="text-gray-600">Overview of leave statistics by department</p>
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Employees</p>
                <p className="text-3xl font-bold text-gray-800">{totals.employees}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Leaves</p>
                <p className="text-3xl font-bold text-gray-800">{totals.leaves}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <p className="text-3xl font-bold text-gray-800">{totals.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Approved</p>
                <p className="text-3xl font-bold text-gray-800">{totals.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Rejected</p>
                <p className="text-3xl font-bold text-gray-800">{totals.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Leave Status by Department
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.fullName}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="Pending" fill="#eab308" />
              <Bar dataKey="Approved" fill="#10b981" />
              <Bar dataKey="Rejected" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Leave Distribution by Department
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Detailed Department Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Employees</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Total Leaves</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Pending</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Approved</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Rejected</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Leave Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.map((dept, index) => {
                const leaveRate = dept.totalEmployees > 0
                  ? ((dept.totalLeaves / dept.totalEmployees) * 100).toFixed(1)
                  : 0;

                return (
                  <tr key={dept.departmentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div>
                          <p className="font-semibold text-gray-800">{dept.departmentName}</p>
                          {dept.departmentDescription && (
                            <p className="text-xs text-gray-500">{dept.departmentDescription}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-800">{dept.totalEmployees}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {dept.totalLeaves}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        {dept.pendingLeaves}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        {dept.approvedLeaves}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                        {dept.rejectedLeaves}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(leaveRate, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{leaveRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentLeaveSummary;