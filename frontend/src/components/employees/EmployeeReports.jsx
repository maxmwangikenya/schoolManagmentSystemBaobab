// src/components/employees/EmployeeReports.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart3, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/authContext';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const EmployeeReports = () => {
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  const employeeId = user?.employeeId || user?._id;

  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAll = async () => {
      if (!employeeId || !API_BASE_URL) return;
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [balRes, leavesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/leaves/balance/${employeeId}`, { headers }),
          axios.get(`${API_BASE_URL}/api/leaves/employee/${employeeId}`, { headers }),
        ]);

        setBalance(balRes.data?.data || null);
        setLeaves(leavesRes.data?.leaves || []);
        setErr(null);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [employeeId, API_BASE_URL, token]);

  // 1) Bar "chart" data – from balance
  const leaveBreakdown = useMemo(() => {
    const totals = balance?.totalLeaves || {};
    const used = balance?.usedLeaves || {};
    const remaining = balance?.remainingLeaves || {};

    const keys = ['casual', 'sick', 'annual'];
    return keys
      .filter((k) => totals[k] !== undefined || used[k] !== undefined || remaining[k] !== undefined)
      .map((k) => ({
        key: k,
        label: k.charAt(0).toUpperCase() + k.slice(1),
        total: Number(totals[k] || 0),
        used: Number(used[k] || 0),
        remaining: Number(remaining[k] || 0),
      }));
  }, [balance]);

  // 2) Monthly trend – from leaves
  const monthlyTrend = useMemo(() => {
    // make an array of 12 months with 0
    const base = Array.from({ length: 12 }, () => 0);
    (leaves || []).forEach((lv) => {
      if (!lv.startDate) return;
      const d = new Date(lv.startDate);
      const m = d.getMonth(); // 0-11
      // we can sum days or count requests; you wanted "leave days taken per month"
      base[m] = (base[m] || 0) + Number(lv.days || 0);
    });
    return base.map((val, idx) => ({
      month: monthNames[idx],
      days: val,
    }));
  }, [leaves]);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
          <p className="text-slate-600 text-sm">Loading reports…</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-1" />
          <div>
            <h2 className="text-sm font-semibold text-rose-700">Could not load reports</h2>
            <p className="text-sm text-rose-600">{err}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 rounded-2xl p-6 shadow-lg text-white flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            My Leave Reports
          </h1>
          <p className="text-sm text-indigo-100 mt-1">
            Visual summary of your leave usage and requests
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-white/80">Employee</p>
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-white/70">ID: {user?.employeeId || user?._id}</p>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar-like leave breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Leave Type Breakdown</h2>
              <p className="text-xs text-slate-500">Fetched from your current leave balance</p>
            </div>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          {leaveBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500">No leave balance data available.</p>
          ) : (
            <div className="space-y-4">
              {leaveBreakdown.map((item) => {
                const pctUsed =
                  item.total > 0 ? Math.min(100, Math.round((item.used / item.total) * 100)) : 0;
                const pctRem =
                  item.total > 0 ? Math.min(100, Math.round((item.remaining / item.total) * 100)) : 0;

                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                      <span className="text-xs text-slate-500">
                        {item.used} used / {item.total} total
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${pctUsed}%` }}
                        title="Used"
                      />
                      {/* show remaining as lighter */}
                      <div
                        className="h-full bg-indigo-200 transition-all"
                        style={{ width: `${pctRem}%` }}
                        title="Remaining"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Remaining: <span className="font-semibold text-slate-700">{item.remaining}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Leave Days per Month</h2>
              <p className="text-xs text-slate-500">Built from your actual leave applications</p>
            </div>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex items-end gap-2 h-44">
            {monthlyTrend.map((m) => {
              const h = m.days === 0 ? 6 : Math.min(160, m.days * 12); // simple height calc
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full max-w-[16px] bg-gradient-to-t from-indigo-500 to-sky-400 rounded-t-lg transition-all"
                    style={{ height: `${h}px` }}
                    title={`${m.days} day(s)`}
                  />
                  <span className="text-[10px] text-slate-500">{m.month}</span>
                  <span className="text-[10px] text-slate-700 font-semibold">{m.days}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* My requests summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">My Leave Requests</h2>
            <p className="text-xs text-slate-500">Last 10 requests</p>
          </div>
        </div>

        {leaves.length === 0 ? (
          <p className="text-sm text-slate-500">You haven’t applied for any leave yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Dates</th>
                  <th className="py-2 pr-3">Days</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Applied</th>
                </tr>
              </thead>
              <tbody>
                {leaves.slice(0, 10).map((lv) => (
                  <tr key={lv._id} className="border-b border-slate-50">
                    <td className="py-2 pr-3 capitalize">{lv.leaveType}</td>
                    <td className="py-2 pr-3 text-slate-700">
                      {lv.startDate
                        ? new Date(lv.startDate).toLocaleDateString()
                        : '—'}{' '}
                      –{' '}
                      {lv.endDate ? new Date(lv.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2 pr-3">{lv.days}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={
                          'px-2 py-0.5 rounded-full text-xs font-semibold ' +
                          (lv.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : lv.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700')
                        }
                      >
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-slate-500 text-xs">
                      {lv.appliedDate
                        ? new Date(lv.appliedDate).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeReports;
