import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  DollarSign,
  BarChart3,
  PieChart as PieIcon,
  RefreshCcw
} from 'lucide-react';

// Recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const currency = (n) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })
    : 'KES 0';

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#A855F7', '#84CC16', '#0EA5E9'];

const SalarySummaryDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Raw data
  const [salaries, setSalaries] = useState([]);       // from GET /api/salary
  const [departments, setDepartments] = useState([]); // from GET /api/departments

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
    []
  );


  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [salRes, depRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/salary`, { headers: authHeaders }),
        axios.get(`${API_BASE_URL}/api/departments`, { headers: authHeaders }),
      ]);

      if (!salRes.data?.success || !Array.isArray(salRes.data?.salaries ?? salRes.data)) {
        throw new Error('Invalid salary response format');
      }

      // Your /api/salary controller might return { success, salaries } or a bare array.
      const salaryRows = salRes.data?.salaries ?? salRes.data;

      if (!depRes.data?.success || !Array.isArray(depRes.data?.departments)) {
        throw new Error('Invalid departments response format');
      }

      setSalaries(salaryRows);
      setDepartments(depRes.data.departments);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to load salary summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
  };

  // ==========================
  // Derivations / Aggregations
  // ==========================

  // Normalize rows to a consistent shape:
  // Expecting each row to have at least: amount/net/gross, departmentId/department, paidAt/date
  const normalized = useMemo(() => {
    return salaries.map((s) => {
      const gross = Number(s?.gross ?? s?.salary?.gross ?? s?.amount ?? 0) || 0;
      const net = Number(s?.net ?? s?.salary?.net ?? 0) || gross;
      const deductions = Number(s?.deductions ?? s?.salary?.deductionsTotal ?? 0) || Math.max(gross - net, 0);
      const departmentId = s?.departmentId || s?.department?._id || s?.departmentIdRef || null;
      const departmentName =
        s?.department?.dep_name ||
        departments.find((d) => String(d._id) === String(departmentId))?.dep_name ||
        s?.department ||
        'Unassigned';
      const paidAt =
        s?.paidAt ||
        s?.date ||
        s?.createdAt ||
        new Date().toISOString();

      return {
        ...s,
        _gross: gross,
        _net: net,
        _deductions: deductions,
        _departmentId: departmentId,
        _departmentName: departmentName,
        _paidMonthKey: new Date(paidAt).toISOString().slice(0, 7), // YYYY-MM
      };
    });
  }, [salaries, departments]);

  const kpis = useMemo(() => {
    const totalGross = normalized.reduce((acc, r) => acc + r._gross, 0);
    const totalNet = normalized.reduce((acc, r) => acc + r._net, 0);
    const totalDeductions = normalized.reduce((acc, r) => acc + r._deductions, 0);
    const count = normalized.length;
    const avgNet = count ? totalNet / count : 0;

    return { totalGross, totalNet, totalDeductions, count, avgNet };
  }, [normalized]);

  // Monthly trend: group by YYYY-MM
  const monthlyTrend = useMemo(() => {
    const map = new Map();
    normalized.forEach((r) => {
      const key = r._paidMonthKey;
      if (!map.has(key)) map.set(key, { month: key, gross: 0, net: 0, deductions: 0 });
      const row = map.get(key);
      row.gross += r._gross;
      row.net += r._net;
      row.deductions += r._deductions;
    });
    // sort ascending by month
    return Array.from(map.values()).sort((a, b) => (a.month > b.month ? 1 : -1));
  }, [normalized]);

  // Per-department totals (net)
  const deptBars = useMemo(() => {
    const map = new Map();
    normalized.forEach((r) => {
      const key = r._departmentName || 'Unassigned';
      if (!map.has(key)) map.set(key, { name: key, net: 0, gross: 0 });
      const row = map.get(key);
      row.net += r._net;
      row.gross += r._gross;
    });
    return Array.from(map.values()).sort((a, b) => b.net - a.net);
  }, [normalized]);

  // Deductions pie (by type if available or just a single “Deductions” slice)
  // If your salary rows include a breakdown (e.g., KRA/NHIF/NSSF), you can expand this.
  const deductionsPie = useMemo(() => {
    const total = normalized.reduce((acc, r) => acc + r._deductions, 0);
    return total > 0
      ? [
          { name: 'Deductions', value: total },
          { name: 'Net', value: kpis.totalNet },
        ]
      : [{ name: 'Net', value: kpis.totalNet }];
  }, [normalized, kpis.totalNet]);

  // ===============
  // Render sections
  // ===============

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
          <span className="font-semibold">Loading salary summary…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-rose-800 font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Salary Summary</h2>
            <p className="text-gray-600 text-sm">Organization-wide payroll overview and trends</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-700"
          disabled={refreshing}
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 font-semibold">Total Gross</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{currency(kpis.totalGross)}</p>
        </div>
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 font-semibold">Total Net</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{currency(kpis.totalNet)}</p>
        </div>
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 font-semibold">Total Deductions</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{currency(kpis.totalDeductions)}</p>
        </div>
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 font-semibold">Avg Net / Record</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{currency(kpis.avgNet)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly trend (Area) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-800">Monthly Net vs Gross</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="gross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.4} stopColor="#6366F1" />
                    <stop offset="95%" stopOpacity={0} stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.4} stopColor="#22C55E" />
                    <stop offset="95%" stopOpacity={0} stopColor="#22C55E" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                <Tooltip formatter={(v) => currency(v)} />
                <Area type="monotone" dataKey="gross" stroke="#6366F1" fill="url(#gross)" />
                <Area type="monotone" dataKey="net" stroke="#22C55E" fill="url(#net)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deductions vs Net (Pie) */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-800">Net vs Deductions</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deductionsPie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {deductionsPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => currency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department bars */}
      <div className="mt-6 bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-gray-800">Net Salary by Department</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
              <Tooltip formatter={(v) => currency(v)} />
              <Bar dataKey="net">
                {deptBars.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalarySummaryDashboard;
