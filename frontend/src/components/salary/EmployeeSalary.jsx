import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  Briefcase,
  User,
  FileText,
} from 'lucide-react';

/**
 * Utility: currency formatter
 * - You can control currency via VITE_CURRENCY (e.g., 'KES' or 'USD').
 * - Falls back to 'KES' if not provided.
 */
const formatMoney = (value) => {
  const code = import.meta.env.VITE_CURRENCY || 'KES';
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(num);
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

/**
 * Key number card
 */
const StatCard = ({ title, value, subtitle, gradient = 'from-slate-50 to-slate-100', border = 'border-slate-200', Icon }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border ${border} shadow-sm`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</span>
      {Icon ? <Icon className="w-5 h-5 text-slate-500" /> : null}
    </div>
    <div className="text-2xl font-extrabold text-slate-900">{value}</div>
    {subtitle ? <div className="text-xs text-slate-600 mt-1">{subtitle}</div> : null}
  </div>
);

/**
 * Labeled row for breakdown sections
 */
const Row = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-slate-600">{label}</span>
    <span className={`text-sm ${strong ? 'font-bold text-slate-900' : 'text-slate-800'}`}>{value}</span>
  </div>
);

/**
 * Section wrapper
 */
const Section = ({ title, children, accent = 'from-indigo-600 to-violet-600' }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
    <div className={`bg-gradient-to-r ${accent} p-5`}>
      <h2 className="text-white text-lg font-bold">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const EmployeeSalary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employee (includes salary object)
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployee(res.data);
        setError(null);
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEmployee();
  }, [id, API_BASE_URL]);

  const salary = employee?.salary || null;

  // Compute totals for display (read-only)
  const {
    basicSalary,
    allowances = {},
    deductions = {},
    grossSalary = 0,
    netSalary = 0,
  } = salary || {};

  const totals = useMemo(() => {
    const totalAllowances =
      Number(allowances.housing || 0) +
      Number(allowances.transport || 0) +
      Number(allowances.medical || 0) +
      Number(allowances.other || 0);

    const totalDeductions =
      Number(deductions.nhif || 0) +
      Number(deductions.nssf || 0) +
      Number(deductions.housingLevy || 0) +
      Number(deductions.paye || 0);

    return {
      totalAllowances,
      totalDeductions,
    };
  }, [allowances, deductions]);

  // Derived pay rates (based on gross by default)
  const rates = useMemo(() => {
    const annualGross = Number(grossSalary || 0);
    return {
      annual: annualGross,
      monthly: annualGross / 12,
      biweekly: annualGross / 26,
      weekly: annualGross / 52,
      daily: annualGross / 260, // workdays/year approx.
      hourly: annualGross / 2080, // hours/year (52*40)
    };
  }, [grossSalary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading payroll…</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <p className="text-red-600 font-semibold mb-4">{error || 'Employee not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const avatarSrc = employee.profileImage
    ? `${API_BASE_URL}/public/uploads/${employee.profileImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Employee')}&background=4f46e5&color=fff&size=200`;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header / Identity */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt={employee.name || 'Employee'}
                    className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white object-cover shadow-xl"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        employee.name || 'Employee'
                      )}&background=4f46e5&color=fff&size=200`;
                    }}
                  />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-extrabold">{employee.name}</h1>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full border border-white/25">
                      <Briefcase className="w-4 h-4" /> {employee.designation || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full border border-white/25">
                      <Building className="w-4 h-4" /> {employee.department || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full border border-white/25">
                      <User className="w-4 h-4" /> ID: {employee.employeeId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-white border border-white/25">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90">Last Updated</div>
                <div className="text-lg font-bold">{formatDate(employee.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Net Pay"
            value={formatMoney(netSalary)}
            subtitle="Take-home"
            gradient="from-emerald-50 to-emerald-100"
            border="border-emerald-200"
            Icon={DollarSign}
          />
          <StatCard
            title="Gross Pay"
            value={formatMoney(grossSalary)}
            subtitle="Before deductions"
            gradient="from-indigo-50 to-indigo-100"
            border="border-indigo-200"
            Icon={TrendingUp}
          />
          <StatCard
            title="Total Deductions"
            value={formatMoney(totals.totalDeductions)}
            subtitle="Statutory & PAYE"
            gradient="from-rose-50 to-rose-100"
            border="border-rose-200"
            Icon={FileText}
          />
          <StatCard
            title="Total Allowances"
            value={formatMoney(totals.totalAllowances)}
            subtitle="Housing, Transport, etc."
            gradient="from-amber-50 to-amber-100"
            border="border-amber-200"
            Icon={Calendar}
          />
        </div>

        {/* Breakdown Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings */}
          <Section title="Earnings" accent="from-emerald-600 to-teal-600">
            <div className="space-y-3">
              <Row label="Basic Salary" value={formatMoney(basicSalary)} strong />
              <div className="mt-2 mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Allowances</div>
              <Row label="Housing" value={formatMoney(allowances.housing)} />
              <Row label="Transport" value={formatMoney(allowances.transport)} />
              <Row label="Medical" value={formatMoney(allowances.medical)} />
              <Row label="Other" value={formatMoney(allowances.other)} />
              <div className="border-t my-2" />
              <Row label="Total Allowances" value={formatMoney(totals.totalAllowances)} strong />
              <div className="border-t my-2" />
              <Row label="Gross Pay" value={formatMoney(grossSalary)} strong />
            </div>
          </Section>

          {/* Deductions */}
          <Section title="Deductions" accent="from-indigo-600 to-violet-600">
            <div className="space-y-3">
              <Row label="NHIF" value={formatMoney(deductions.nhif)} />
              <Row label="NSSF" value={formatMoney(deductions.nssf)} />
              <Row label="Housing Levy" value={formatMoney(deductions.housingLevy)} />
              <Row label="PAYE" value={formatMoney(deductions.paye)} />
              <div className="border-t my-2" />
              <Row label="Total Deductions" value={formatMoney(totals.totalDeductions)} strong />
              <div className="border-t my-2" />
              <Row label="Net Pay (Take-home)" value={formatMoney(netSalary)} strong />
            </div>
          </Section>

          {/* Pay Rates & Statutory IDs */}
          <Section title="Pay Rates & Statutory Details" accent="from-slate-700 to-slate-900">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Rates (Gross)</div>
                <Row label="Annual" value={formatMoney(rates.annual)} />
                <Row label="Monthly" value={formatMoney(rates.monthly)} />
                <Row label="Bi-weekly" value={formatMoney(rates.biweekly)} />
                <Row label="Weekly" value={formatMoney(rates.weekly)} />
                <Row label="Daily (260 days)" value={formatMoney(rates.daily)} />
                <Row label="Hourly (2080 hrs)" value={`${formatMoney(rates.hourly)}`} />
              </div>
              <div className="border-t" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Statutory</div>
                <Row label="KRA PIN" value={employee.kraPIN || '—'} />
                <Row label="NSSF No." value={employee.nssfNumber || '—'} />
                <Row label="NHIF No." value={employee.nhifNumber || '—'} />
              </div>
            </div>
          </Section>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-700">
            The amounts shown reflect the current payroll configuration for this employee as stored in the system.
            For historical payslips, navigate to <span className="font-semibold">Employee → View Payslips</span>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalary;
