import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';

const fmtDateFull = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

const fmtMonthLabel = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—';

const fmtHours = (h) => `${(Number(h) || 0).toFixed(2)}h`;

// Small card component
const StatCard = ({ label, value, sub, Icon, tone = 'indigo' }) => {
  const tones = {
    indigo: {
      border: 'border-indigo-200',
      bg: 'from-indigo-50 to-slate-50',
      iconBg: 'from-indigo-500 to-sky-500',
    },
    emerald: {
      border: 'border-emerald-200',
      bg: 'from-emerald-50 to-slate-50',
      iconBg: 'from-emerald-500 to-teal-500',
    },
    amber: {
      border: 'border-amber-200',
      bg: 'from-amber-50 to-slate-50',
      iconBg: 'from-amber-500 to-orange-500',
    },
    sky: {
      border: 'border-sky-200',
      bg: 'from-sky-50 to-slate-50',
      iconBg: 'from-sky-500 to-cyan-500',
    },
  }[tone] || {
    border: 'border-slate-200',
    bg: 'from-slate-50 to-white',
    iconBg: 'from-slate-500 to-slate-600',
  };

  return (
    <div className={`bg-white border ${tones.border} rounded-xl shadow-sm hover:shadow-lg transition`}>
      <div className={`bg-gradient-to-br ${tones.bg} rounded-xl p-4 flex items-center gap-3`}>
        <div
          className={`bg-gradient-to-br ${tones.iconBg} w-10 h-10 rounded-lg flex items-center justify-center shadow-md`}
        >
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
          <p className="text-lg font-extrabold text-slate-900">{value}</p>
          {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
};

const EmployeeAttendanceAnalytics = () => {
  const { token } = useAuth() || { token: localStorage.getItem('token') };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dailyRaw, setDailyRaw] = useState([]); // last N days
  const [monthlyRaw, setMonthlyRaw] = useState([]); // last N months

  const [daysRange, setDaysRange] = useState(30); // 30 / 60 / 90 etc.

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token || localStorage.getItem('token')}`,
    }),
    [token]
  );

  const fetchData = async (rangeDays = 30) => {
    try {
      setLoading(true);
      setError('');

      const [dailyRes, monthlyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/attendance/me/daily?days=${rangeDays}`, { headers }),
        axios.get(`${API_BASE_URL}/api/attendance/me/monthly?months=6`, { headers }),
      ]);

      if (!dailyRes.data?.success) throw new Error(dailyRes.data?.error || 'Failed to load daily attendance');
      if (!monthlyRes.data?.success) throw new Error(monthlyRes.data?.error || 'Failed to load monthly attendance');

      setDailyRaw(dailyRes.data.data || []);
      setMonthlyRaw(monthlyRes.data.data || []);
    } catch (err) {
      console.error('Attendance analytics error:', err);
      setError(err?.message || 'Failed to load attendance analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (API_BASE_URL && (token || localStorage.getItem('token'))) {
      fetchData(daysRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysRange]);

  // Normalize daily data for charts
  const dailyData = useMemo(
    () =>
      (dailyRaw || []).map((d) => {
        const dt = new Date(d.date);
        return {
          ...d,
          dateLabel: dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          totalHours: Number(d.totalHours || 0),
          present: !!d.present,
        };
      }),
    [dailyRaw]
  );

  // Last 7 days for "This week" summary
  const last7 = useMemo(() => dailyData.slice(-7), [dailyData]);

  // Weekly data: chunk last 56 days into weeks of 7 days
  const weeklyData = useMemo(() => {
    if (!dailyData.length) return [];
    const last56 = dailyData.slice(-56);
    const chunks = [];
    for (let i = 0; i < last56.length; i += 7) {
      const chunk = last56.slice(i, i + 7);
      if (!chunk.length) continue;
      const totalHours = chunk.reduce((sum, d) => sum + (d.totalHours || 0), 0);
      const daysPresent = chunk.filter((d) => d.present).length;
      const weekLabel = `${chunk[0].dateLabel} - ${chunk[chunk.length - 1].dateLabel}`;
      chunks.push({
        label: weekLabel,
        totalHours: Number(totalHours.toFixed(2)),
        daysPresent,
      });
    }
    return chunks;
  }, [dailyData]);

  // Monthly data formatted
  const monthlyData = useMemo(
    () =>
      (monthlyRaw || []).map((m) => ({
        monthLabel: fmtMonthLabel(m.monthStart),
        totalHours: Number(m.totalHours || 0),
        daysPresent: m.daysPresent || 0,
        daysAbsent: m.daysAbsent || 0,
      })),
    [monthlyRaw]
  );

  // Summary stats
  const totalHoursLast7 = useMemo(
    () => last7.reduce((sum, d) => sum + (d.totalHours || 0), 0),
    [last7]
  );
  const daysPresentLast7 = useMemo(() => last7.filter((d) => d.present).length, [last7]);

  const totalHoursRange = useMemo(
    () => dailyData.reduce((sum, d) => sum + (d.totalHours || 0), 0),
    [dailyData]
  );
  const daysPresentRange = useMemo(() => dailyData.filter((d) => d.present).length, [dailyData]);
  const attendanceRateRange = useMemo(() => {
    if (!dailyData.length) return 0;
    return (daysPresentRange / dailyData.length) * 100;
  }, [dailyData.length, daysPresentRange]);

  const currentMonthSummary = useMemo(() => {
    if (!monthlyData.length) return null;
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const found = monthlyRaw.find((m) => {
      const d = new Date(m.monthStart);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    if (!found) return null;
    return {
      totalHours: Number(found.totalHours || 0),
      daysPresent: found.daysPresent || 0,
      daysAbsent: found.daysAbsent || 0,
    };
  }, [monthlyData.length, monthlyRaw]);

  // Recent days table
  const recentDays = useMemo(() => [...dailyData].slice(-10).reverse(), [dailyData]);

  if (loading && !dailyData.length && !monthlyData.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading attendance analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 md:p-6 flex flex-wrap gap-4 items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl w-12 h-12 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                Attendance Analytics
              </h1>
              <p className="text-xs md:text-sm text-slate-600">
                Track your presence, hours worked, and trends over time.
              </p>
            </div>
          </div>

          {/* Range selector */}
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600 mr-1">Showing last</span>
            {[30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDaysRange(d)}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition ${
                  daysRange === d
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="This Week (Last 7 Days)"
            value={fmtHours(totalHoursLast7)}
            sub={`${daysPresentLast7} day(s) present`}
            Icon={Clock}
            tone="emerald"
          />
          <StatCard
            label={`Last ${daysRange} Days`}
            value={fmtHours(totalHoursRange)}
            sub={`${daysPresentRange} day(s) present`}
            Icon={Activity}
            tone="indigo"
          />
          <StatCard
            label="Attendance Rate"
            value={`${attendanceRateRange.toFixed(1)}%`}
            sub={`Based on last ${dailyData.length} day(s)`}
            Icon={TrendingUp}
            tone="amber"
          />
          <StatCard
            label="This Month (Hours)"
            value={fmtHours(currentMonthSummary?.totalHours || 0)}
            sub={
              currentMonthSummary
                ? `${currentMonthSummary.daysPresent} present • ${currentMonthSummary.daysAbsent} absent`
                : 'No data yet for this month'
            }
            Icon={Calendar}
            tone="sky"
          />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Daily hours chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Daily Hours (Last {daysRange} Days)
                </h2>
                <p className="text-xs text-slate-500">
                  Each point shows hours worked per day. 0h = absent.
                </p>
              </div>
            </div>

            {dailyData.length === 0 ? (
              <p className="text-xs text-slate-500 mt-4">No attendance records in this range.</p>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'Hours',
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'totalHours') return [fmtHours(value), 'Total Hours'];
                        if (name === 'present') return [value ? 'Present' : 'Absent', 'Status'];
                        return [value, name];
                      }}
                    />
                    <Legend formatter={(value) => (value === 'totalHours' ? 'Hours' : 'Present')} />
                    <Line type="monotone" dataKey="totalHours" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Weekly summary chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Weekly Summary (Last {weeklyData.length} Week(s))
                </h2>
                <p className="text-xs text-slate-500">
                  Total hours and days present per week (grouped by 7-day blocks).
                </p>
              </div>
            </div>

            {weeklyData.length === 0 ? (
              <p className="text-xs text-slate-500 mt-4">Not enough data to compute weekly summary.</p>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'Hours',
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'Days Present',
                        angle: 90,
                        position: 'insideRight',
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'totalHours') return [fmtHours(value), 'Total Hours'];
                        if (name === 'daysPresent') return [value, 'Days Present'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="totalHours" name="Total Hours" fill="#22c55e" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="daysPresent"
                      name="Days Present"
                      stroke="#0f766e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Monthly chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                Monthly Attendance (Last 6 Months)
              </h2>
              <p className="text-xs text-slate-500">
                Hours worked, days present, and days absent per month.
              </p>
            </div>
          </div>

          {monthlyData.length === 0 ? (
            <p className="text-xs text-slate-500 mt-4">No monthly attendance summary available yet.</p>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10 }}
                    label={{
                      value: 'Hours',
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    label={{
                      value: 'Days',
                      angle: 90,
                      position: 'insideRight',
                      fontSize: 11,
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'totalHours') return [fmtHours(value), 'Total Hours'];
                      if (name === 'daysPresent') return [value, 'Days Present'];
                      if (name === 'daysAbsent') return [value, 'Days Absent'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalHours" name="Total Hours" fill="#4f46e5" />
                  <Bar yAxisId="right" dataKey="daysPresent" name="Days Present" fill="#22c55e" />
                  <Bar yAxisId="right" dataKey="daysAbsent" name="Days Absent" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent attendance table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm md:text-base font-bold text-slate-900">
                Recent Attendance (Last 10 Days)
              </h2>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              Present day = clocked in
            </p>
          </div>

          {recentDays.length === 0 ? (
            <p className="text-xs text-slate-500 mt-2">No attendance records to show.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Clock In</th>
                    <th className="px-3 py-2 text-left">Clock Out</th>
                    <th className="px-3 py-2 text-left">Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDays.map((d, idx) => (
                    <tr
                      key={`${d.date}-${idx}`}
                      className="bg-white border border-slate-200/80 hover:bg-slate-50 transition"
                    >
                      <td className="px-3 py-2 text-slate-900">{fmtDateFull(d.date)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            d.present
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              d.present ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {d.present ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {fmtTime(d.clockInTime || d.clockIn || null)}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {fmtTime(d.clockOutTime || d.clockOut || null)}
                      </td>
                      <td className="px-3 py-2 text-slate-900 font-semibold">
                        {fmtHours(d.totalHours || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceAnalytics;
