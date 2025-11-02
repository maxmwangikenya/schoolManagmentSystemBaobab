import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const currency = (n) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })
    : 'N/A';

const dateFmt = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

const labelValue = (label, value) => (
  <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-100 shadow-sm">
    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    <div className="mt-1.5 text-[15px] font-semibold text-slate-900 break-words">{value ?? 'N/A'}</div>
  </div>
);

const StatCard = ({ title, value, hint }) => (
  <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-5 border border-indigo-100 shadow-sm">
    <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
      {title}
    </div>
    <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
    {hint ? <div className="mt-1 text-[12px] text-slate-500">{hint}</div> : null}
  </div>
);

const Section = ({ title, subtitle, children }) => (
  <section className="mb-8">
    <div className="mb-3">
      <h4 className="text-base md:text-lg font-bold text-slate-900">{title}</h4>
      {subtitle ? <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p> : null}
    </div>
    {children}
  </section>
);

const EmployeeProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
  

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

  const photoUrl = useMemo(() => {
    if (!employee) return '';
    if (employee.profileImage) {
      return `${API_BASE_URL}/public/uploads/${employee.profileImage}`;
    }
    const initialsName = encodeURIComponent(employee.name || 'Employee');
    return `https://ui-avatars.com/api/?name=${initialsName}&background=4f46e5&color=fff&size=160`;
  }, [employee, API_BASE_URL]);

  const salary = employee?.salary || {};
  const deductions = salary?.deductions || {};
  const totalDeductions =
    (Number(deductions.nhif || 0) +
      Number(deductions.nssf || 0) +
      Number(deductions.housingLevy || 0) +
      Number(deductions.paye || 0)) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gradient-to-br from-slate-50 via-indigo-50/60 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gradient-to-br from-slate-50 via-rose-50/50 to-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-rose-100">
          <svg className="w-12 h-12 text-rose-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-rose-600 text-base font-semibold mb-4">{error || 'No employee data found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl mx-auto overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={photoUrl}
                alt={employee.name || 'Employee'}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/20 shadow-lg"
                onError={(e) => {
                  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name || 'Employee')}&background=4f46e5&color=fff&size=160`;
                  if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                }}
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">{employee.name || 'N/A'}</h1>
                <div className="mt-1 text-indigo-100 text-sm">
                  {employee.designation || 'N/A'} {employee.department ? `• ${employee.department}` : ''}
                </div>
                <div className="mt-0.5 text-xs text-indigo-100/90">
                  Employee ID: {employee.employeeId || 'N/A'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <StatCard title="Gross" value={currency(salary.grossSalary)} />
              <StatCard title="Net" value={currency(salary.netSalary)} />
              <StatCard title="Deductions" value={currency(totalDeductions)} hint="NHIF + NSSF + H/Levy + PAYE" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {/* Identity & Contact */}
          <Section title="Identity & Contact" subtitle="Your key personal and contact information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {labelValue('Email', employee.email)}
              {labelValue('Phone', employee.phone)}
              {labelValue('Date of Birth', dateFmt(employee.dob))}
              {labelValue('Gender', employee.gender)}
              {labelValue('Marital Status', employee.maritalStatus)}
              {labelValue('Address', employee.address || 'N/A')}
            </div>
          </Section>

          {/* Employment */}
          <Section title="Employment" subtitle="Role and organizational details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {labelValue('Department', employee.department)}
              {labelValue('Designation', employee.designation)}
              {labelValue('Joined', dateFmt(employee.createdAt))}
              {labelValue('Manager', employee.managerName || 'N/A')}
              {labelValue('Employment Type', employee.employmentType || 'N/A')}
              {labelValue('Work Location', employee.workLocation || 'N/A')}
            </div>
          </Section>

          {/* Compensation snapshot */}
          <Section title="Compensation" subtitle="High-level salary summary">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {labelValue('Basic Salary', currency(salary.basicSalary))}
                {labelValue('Gross Salary', currency(salary.grossSalary))}
                {labelValue('Net Salary', currency(salary.netSalary))}
                {labelValue('Total Deductions', currency(totalDeductions))}
              </div>
              <div className="rounded-2xl p-5 border border-slate-100 shadow-sm bg-slate-50/70">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Statutory Deductions</div>
                <div className="mt-2 space-y-1.5 text-[14px]">
                  <div className="flex justify-between"><span>NHIF</span><span className="font-semibold">{currency(deductions.nhif)}</span></div>
                  <div className="flex justify-between"><span>NSSF</span><span className="font-semibold">{currency(deductions.nssf)}</span></div>
                  <div className="flex justify-between"><span>Housing Levy</span><span className="font-semibold">{currency(deductions.housingLevy)}</span></div>
                  <div className="flex justify-between"><span>PAYE</span><span className="font-semibold">{currency(deductions.paye)}</span></div>
                </div>
              </div>
            </div>

            {salary?.allowances && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {labelValue('Housing Allowance', currency(salary.allowances?.housing))}
                {labelValue('Transport Allowance', currency(salary.allowances?.transport))}
                {labelValue('Medical Allowance', currency(salary.allowances?.medical))}
                {labelValue('Other Allowances', currency(salary.allowances?.other))}
              </div>
            )}
          </Section>

          {/* IDs & Benefits */}
          <Section title="IDs & Benefit Numbers" subtitle="Government and insurer references">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {labelValue('KRA PIN', employee.kraPIN)}
              {labelValue('NHIF Number', employee.nhifNumber)}
              {labelValue('NSSF Number', employee.nssfNumber)}
            </div>
          </Section>

          {/* Emergency contact */}
          <Section title="Emergency Contact">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {labelValue('Name', employee.emergencyContact?.name)}
              {labelValue('Relationship', employee.emergencyContact?.relationship)}
              {labelValue('Phone', employee.emergencyContact?.phone)}
              {labelValue('Email', employee.emergencyContact?.email)}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
