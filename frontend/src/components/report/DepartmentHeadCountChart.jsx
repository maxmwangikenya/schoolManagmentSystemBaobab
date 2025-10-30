import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Users, BarChart3, PieChart as PieIcon, RefreshCcw } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#A855F7', '#84CC16', '#0EA5E9', '#F43F5E'];

const DepartmentHeadcountChart = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState(''); // optional search by department name

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
    []
  );

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = q?.trim()
        ? `${API_BASE_URL}/api/employees/stats/by-department?q=${encodeURIComponent(q.trim())}`
        : `${API_BASE_URL}/api/employees/stats/by-department`;

      const res = await axios.get(url, { headers });
      if (!res.data?.success || !Array.isArray(res.data?.data)) {
        throw new Error('Invalid response format');
      }
      setRows(res.data.data);
    } catch (err) {
      setError(err.res?.data?.error || err.message || 'Failed to load department stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  const pieData = useMemo(() => {
    const total = rows.reduce((acc, r) => acc + (r.count || 0), 0);
    return rows.map(r => ({
      name: r.department || 'Unassigned',
      value: r.count || 0,
      percent: total ? (r.count / total) * 100 : 0
    }));
  }, [rows]);

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Headcount by Department</h2>
            <p className="text-gray-600 text-sm">Distribution of employees across departments</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search department..."
            className="px-3 py-2 border-2 border-gray-200 rounded-xl"
          />
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-700"
          >
            Filter
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-700"
            disabled={refreshing}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
          <span className="font-semibold">Loading…</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-rose-800 font-semibold">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 text-center text-gray-600">
          No departments found.
        </div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800">Headcount (Bar)</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="department" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count">
                    {rows.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                <PieIcon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800">Distribution (Pie)</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} label>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v, n, p) => [`${v} employees`, p?.payload?.name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DepartmentHeadcountChart;
