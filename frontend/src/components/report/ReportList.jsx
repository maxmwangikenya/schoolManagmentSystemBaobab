import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Download, Trash2, Eye, Filter,
  Calendar, TrendingUp, Users, DollarSign, BarChart3,
  Clock, CheckCircle, AlertCircle, Search, RefreshCw, X
} from 'lucide-react';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    reportTitle: '',
    reportType: 'employee_performance',
    description: '',
    filters: {
      startDate: '',
      endDate: '',
      department: '',
      status: ''
    },
    tags: []
  });

  const API_BASE_URL = 'http://localhost:3000'; 
  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [filterType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/api/reports`;
      
      if (filterType !== 'all') {
        url += `?reportType=${filterType}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleCreateReport = async () => {
    if (!formData.reportTitle || !formData.reportType) {
      alert('Please fill in required fields');
      return;
    }

    setGenerating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Report generated successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchReports();
        fetchStatistics();
      } else {
        alert(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        alert('Report deleted successfully');
        fetchReports();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const handleViewReport = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setViewReport(data.report);
      }
    } catch (error) {
      console.error('Error viewing report:', error);
      alert('Failed to load report details');
    }
  };

  const resetForm = () => {
    setFormData({
      reportTitle: '',
      reportType: 'employee_performance',
      description: '',
      filters: {
        startDate: '',
        endDate: '',
        department: '',
        status: ''
      },
      tags: []
    });
  };

  const getReportTypeIcon = (type) => {
    const icons = {
      employee_performance: <Users className="w-5 h-5" />,
      attendance: <Clock className="w-5 h-5" />,
      leave_summary: <Calendar className="w-5 h-5" />,
      department: <BarChart3 className="w-5 h-5" />,
      salary: <DollarSign className="w-5 h-5" />,
      custom: <FileText className="w-5 h-5" />
    };
    return icons[type] || <FileText className="w-5 h-5" />;
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      employee_performance: 'Employee Performance',
      attendance: 'Attendance',
      leave_summary: 'Leave Summary',
      department: 'Department',
      salary: 'Salary/Payroll',
      custom: 'Custom Report'
    };
    return labels[type] || type;
  };

  const getReportTypeColor = (type) => {
    const colors = {
      employee_performance: 'bg-blue-100 text-blue-800 border-blue-300',
      attendance: 'bg-green-100 text-green-800 border-green-300',
      leave_summary: 'bg-purple-100 text-purple-800 border-purple-300',
      department: 'bg-orange-100 text-orange-800 border-orange-300',
      salary: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      custom: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[type] || colors.custom;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReports = reports.filter(report =>
    report.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                Report Management
              </h1>
              <p className="text-gray-600 mt-1">Generate and manage system reports</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Generate Report
            </button>
          </div>
        </div>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {statistics.totalReports || 0}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {statistics.recentReports || 0}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Report Types</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {statistics.reportsByType?.length || 0}
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {statistics.reportsByStatus?.find(s => s._id === 'completed')?.count || 0}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-orange-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filter:</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {['all', 'employee_performance', 'attendance', 'leave_summary', 'department', 'salary'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterType === type
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All Reports' : getReportTypeLabel(type)}
                </button>
              ))}
            </div>

            <div className="ml-auto flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => {
                  fetchReports();
                  fetchStatistics();
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reports Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No reports match your search criteria.' : 'Start by generating your first report.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
            >
              Generate Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border-t-4 border-indigo-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                      {getReportTypeIcon(report.reportType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate">{report.reportTitle}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getReportTypeColor(report.reportType)}`}>
                        {getReportTypeLabel(report.reportType)}
                      </span>
                    </div>
                  </div>
                </div>

                {report.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                )}

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Generated: {formatDate(report.generatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">By: {report.generatedBy?.name || 'Unknown'}</span>
                  </div>
                  {report.summary?.totalRecords > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span>Records: {report.summary.totalRecords}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewReport(report._id)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Generate New Report</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Report Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reportTitle}
                  onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
                  placeholder="e.g., Q4 Employee Performance Report"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="employee_performance">Employee Performance</option>
                  <option value="attendance">Attendance</option>
                  <option value="leave_summary">Leave Summary</option>
                  <option value="department">Department</option>
                  <option value="salary">Salary/Payroll</option>
                  <option value="custom">Custom Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Brief description of the report..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  maxLength={500}
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Filters (Optional)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.filters.startDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, startDate: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.filters.endDate}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, endDate: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={formData.filters.department}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, department: e.target.value }
                      })}
                      placeholder="e.g., Engineering"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.filters.status}
                      onChange={(e) => setFormData({
                        ...formData,
                        filters: { ...formData.filters, status: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                disabled={generating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReport}
                disabled={generating}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition font-medium shadow-lg disabled:opacity-50"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </span>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{viewReport.reportTitle}</h2>
              <button
                onClick={() => setViewReport(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold">{getReportTypeLabel(viewReport.reportType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Generated</p>
                  <p className="font-semibold">{formatDate(viewReport.generatedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Generated By</p>
                  <p className="font-semibold">{viewReport.generatedBy?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="font-semibold">{viewReport.summary?.totalRecords || 0}</p>
                </div>
              </div>

              {viewReport.summary?.metrics && Object.keys(viewReport.summary.metrics).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(viewReport.summary.metrics).map(([key, value]) => (
                      <div key={key} className="p-4 bg-indigo-50 rounded-lg">
                        <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Report Data</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(viewReport.reportData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setViewReport(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
              <button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;