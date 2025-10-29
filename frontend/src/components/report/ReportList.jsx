// src/components/report/ReportList.jsx
import React, { useState } from 'react';
import {
  FileText,
  Building,
  BarChart3,
  DollarSign,
  Users
} from 'lucide-react';

// Make sure these filenames match your folder exactly:
import LeaveReportList from './Leavereportlist.jsx';
import DepartmentLeaveSummary from './Departmentleavesummary.jsx';
import LeaveStatisticsDashboard from './Leavestaticsdashboard.jsx';
import SalarySummaryDashboard from './SalarySummaryDashboard.jsx';
import DepartmentHeadcountChart from './DepartmentHeadcountChart.jsx'; // new chart we discussed

const ReportList = () => {
  const [activeTab, setActiveTab] = useState('list');

  const tabs = [
    {
      id: 'list',
      name: 'Leave Reports',
      icon: FileText,
      description: 'View detailed leave records',
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-600'
    },
    {
      id: 'department',
      name: 'Department Summary',
      icon: Building,
      description: 'Department-wise leave overview',
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-600'
    },
    {
      id: 'statistics',
      name: 'Leave Statistics',
      icon: BarChart3,
      description: 'Analyze leave trends',
      color: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-600'
    },
    {
      id: 'headcount',
      name: 'Headcount by Dept',
      icon: Users,
      description: 'Employees per department',
      color: 'from-sky-600 to-indigo-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-600'
    },
    {
      id: 'salary',
      name: 'Salary Summary',
      icon: DollarSign,
      description: 'Payroll KPIs & charts',
      color: 'from-indigo-600 to-purple-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-600'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return <LeaveReportList />;
      case 'department':
        return <DepartmentLeaveSummary />;
      case 'statistics':
        return <LeaveStatisticsDashboard />;
      case 'headcount':
        return <DepartmentHeadcountChart />;
      case 'salary':
        return <SalarySummaryDashboard />;
      default:
        return <LeaveReportList />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Reports Center</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive leave, headcount, and payroll analytics
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`relative group p-6 rounded-xl transition-all transform hover:scale-[1.02] text-left ${
                    isActive
                      ? `${tab.bgColor} border-2 ${tab.borderColor} shadow-lg`
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl shadow-md transition-transform group-hover:scale-110 ${
                        isActive ? `bg-gradient-to-r ${tab.color}` : 'bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-1 ${isActive ? 'text-gray-800' : 'text-gray-700'}`}>
                        {tab.name}
                      </h3>
                      <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-lg" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">{renderContent()}</div>
    </div>
  );
};

export default ReportList;
