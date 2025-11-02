import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  CalendarDays,
  ClipboardList,
  FileCheck2,
  Hourglass,
  Info,
  Loader2,
  Umbrella,
  Stethoscope,
  CalendarHeart,
} from 'lucide-react';

/* ----------------------------- Helpers ----------------------------- */

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const diffDaysInclusive = (startISO, endISO) => {
  const s = new Date(startISO);
  const e = new Date(endISO);
  if (isNaN(s) || isNaN(e)) return 0;
  return Math.max(0, Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1);
};

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  };
  const cls =
    map[status?.toLowerCase?.()] ||
    'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}
    >
      {status || 'unknown'}
    </span>
  );
};

const ProgressBar = ({ value = 0, tone = 'indigo' }) => {
  const bar = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
  }[tone];
  return (
    <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full ${bar} transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

const BalanceCard = ({
  title,
  total = 0,
  used = 0,
  pending = 0,
  remaining = 0,
  tone = 'indigo',
  Icon = Umbrella,
}) => {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const ring = {
    indigo: 'ring-indigo-200',
    blue: 'ring-blue-200',
    emerald: 'ring-emerald-200',
  }[tone];
  const pill = {
    indigo: 'from-indigo-600 to-violet-600',
    blue: 'from-blue-600 to-cyan-600',
    emerald: 'from-emerald-600 to-green-600',
  }[tone];

  return (
    <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-2 ${ring}`}>
            <Icon className="h-4 w-4 text-slate-700" />
          </span>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            {title}
          </div>
        </div>
        <div className="text-xs text-slate-400">Total: {total}</div>
      </div>

      <div className="mt-2 flex items-end gap-2">
        <div className="text-3xl font-extrabold text-slate-900">{remaining}</div>
        <div className="text-sm text-slate-500">day(s) remaining</div>
      </div>

      <ProgressBar value={pct} tone={tone} />

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
          <div className="text-slate-500">Used</div>
          <div className="font-semibold text-slate-800">{used}</div>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-center">
          <div className="text-amber-700">Pending</div>
          <div className="font-semibold text-amber-800">{pending}</div>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
          <div className="text-slate-600">Remaining</div>
          <div className="font-semibold text-slate-900">{remaining}</div>
        </div>
      </div>

      <div className="mt-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${pill} px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm`}>
          <FileCheck2 className="h-3.5 w-3.5" />
          {pct}% available
        </span>
      </div>
    </div>
  );
};

/* ----------------------------- Component ----------------------------- */

const EmployeeLeave = () => {
  const { id: employeeId } = useParams();
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  const token = localStorage.getItem('token');

  const [balances, setBalances] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const computedDays = useMemo(
    () => diffDaysInclusive(startDate, endDate),
    [startDate, endDate]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balRes, histRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/leaves/balance/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/leaves/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setBalances(balRes.data.data);
      setLeaves(histRes.data.leaves || []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason) {
      alert('Please fill all fields.');
      return;
    }
    if (computedDays <= 0) {
      alert('End date must be on or after start date.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/leaves`,
        { employeeId, leaveType, startDate, endDate, days: computedDays, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Leave application submitted successfully.');
      setLeaveType('annual');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to apply for leave.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-600">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading leave data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-white rounded-2xl shadow text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-200">
          <Info className="h-6 w-6 text-rose-600" />
        </div>
        <p className="text-rose-600 mb-4 font-semibold">{error}</p>
        <button
          onClick={fetchData}
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Always show all three types; default to 0 if backend didn’t send them
  const total = {
    casual: balances?.totalLeaves?.casual ?? 0,
    sick: balances?.totalLeaves?.sick ?? 0,
    annual: balances?.totalLeaves?.annual ?? 0,
  };
  const used = {
    casual: balances?.usedLeaves?.casual ?? 0,
    sick: balances?.usedLeaves?.sick ?? 0,
    annual: balances?.usedLeaves?.annual ?? 0,
  };
  const pending = {
    casual: balances?.pendingLeaves?.casual ?? 0,
    sick: balances?.pendingLeaves?.sick ?? 0,
    annual: balances?.pendingLeaves?.annual ?? 0,
  };
  const remaining = {
    casual: balances?.remainingLeaves?.casual ?? (total.casual - used.casual - pending.casual),
    sick: balances?.remainingLeaves?.sick ?? (total.sick - used.sick - pending.sick),
    annual: balances?.remainingLeaves?.annual ?? (total.annual - used.annual - pending.annual),
  };

  const totalRemaining = Math.max(0, (remaining.annual || 0) + (remaining.casual || 0) + (remaining.sick || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-2xl">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Leave Portal
                </h1>
                <p className="text-indigo-100/90 text-sm">
                  View your leave balance, apply for new leave, and review your history.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 backdrop-blur self-start sm:self-auto">
              <FileCheck2 className="h-4 w-4" />
              <span className="text-sm">
                You have <span className="font-bold">{totalRemaining}</span> day(s) remaining in total
              </span>
            </div>
          </div>
        </div>

        {/* Balances */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">Leave Balances</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <BalanceCard
              title="Casual Leave"
              total={total.casual}
              used={used.casual}
              pending={pending.casual}
              remaining={Math.max(0, remaining.casual)}
              tone="blue"
              Icon={Umbrella}
            />
            <BalanceCard
              title="Sick Leave"
              total={total.sick}
              used={used.sick}
              pending={pending.sick}
              remaining={Math.max(0, remaining.sick)}
              tone="emerald"
              Icon={Stethoscope}
            />
            <BalanceCard
              title="Annual Leave"
              total={total.annual}
              used={used.annual}
              pending={pending.annual}
              remaining={Math.max(0, remaining.annual)}
              tone="indigo"
              Icon={CalendarHeart}
            />
          </div>
        </section>

        {/* Apply Form */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-200">
              <ClipboardList className="h-5 w-5 text-indigo-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Apply for Leave</h3>
          </div>

          <form onSubmit={handleApply} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Leave Type */}
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Leave Type
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
              >
                <option value="annual">Annual</option>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value && new Date(endDate) < new Date(e.target.value)) {
                    setEndDate('');
                  }
                }}
                required
              />
            </div>

            {/* End Date */}
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                End Date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {/* Days */}
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Days
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={computedDays || 0}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 shadow-sm"
                />
                <Hourglass className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Reason */}
            <div className="md:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Reason
              </label>
              <textarea
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-slate-800 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Brief reason for requesting leave (include dates, any handoffs, and contactability)."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit Leave Request'}
              </button>
            </div>
          </form>
        </section>

        {/* History */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
              <CalendarDays className="h-5 w-5 text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Leave History</h3>
          </div>

          {leaves.length === 0 ? (
            <p className="text-sm text-slate-500">No leave applications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-6">
                <thead>
                  <tr className="text-left text-[12px] uppercase tracking-wider text-slate-500">
                    <th className="px-3">Type</th>
                    <th className="px-3">Dates</th>
                    <th className="px-3">Days</th>
                    <th className="px-3">Reason</th>
                    <th className="px-3">Status</th>
                    <th className="px-3">Reviewed By</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((lv) => (
                    <tr key={lv._id} className="bg-white align-top">
                      <td className="rounded-l-2xl px-3 py-3 font-semibold capitalize text-slate-900">
                        {lv.leaveType}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {fmtDate(lv.startDate)} – {fmtDate(lv.endDate)}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{lv.days}</td>
                      <td className="px-3 py-3 text-slate-700">
                        <div className="max-w-[520px] rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
                          {lv.reason}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={lv.status} />
                      </td>
                      <td className="rounded-r-2xl px-3 py-3 text-slate-700">
                        {lv.reviewedBy?.name || (lv.status === 'pending' ? '—' : 'Admin')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmployeeLeave;
