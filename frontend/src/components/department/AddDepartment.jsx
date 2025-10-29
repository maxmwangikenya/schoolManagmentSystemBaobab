import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AddDepartment = () => {
  const [formData, setFormData] = useState({
    dep_name: "",
    dep_code: "",
    description: "",
    headEmployeeId: "",
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setFetching(true);
        const res = await axios.get(`${API_BASE_URL}/api/employees`, {
          headers: authHeaders,
        });
        setEmployees(res.data?.employees || []);
      } catch (err) {
        console.error("Fetch employees error:", err);
        setError("⚠️ Failed to load employees. Try refreshing.");
      } finally {
        setFetching(false);
      }
    };
    fetchEmployees();
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { dep_name, dep_code } = formData;

    if (!dep_name.trim() || !dep_code.trim()) {
      setError("Please fill in both Department Name and Code.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        dep_name: dep_name.trim(),
        dep_code: dep_code.trim().toUpperCase(),
        description: formData.description.trim(),
        headEmployeeId: formData.headEmployeeId || undefined,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/departments`,
        payload,
        { headers: authHeaders }
      );

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => navigate("/admin-dashboard/departments"), 1500);
      } else {
        setError(res.data?.error || "Failed to add department");
      }
    } catch (err) {
      console.error("Add department error:", err);
      setError(err.response?.data?.error || "Server error adding department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="relative rounded-3xl bg-white/90 shadow-2xl border border-white/30 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8">
            <h1 className="text-3xl font-bold text-white mb-1">
              Add New Department
            </h1>
            <p className="text-blue-100 text-sm">
              Assign a head and create a new department record.
            </p>
          </div>

          <div className="p-10">
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl">
                <p className="text-emerald-800 font-semibold">
                  ✅ Department created successfully! Redirecting…
                </p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl">
                <p className="text-rose-800 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Department Name */}
              <div>
                <label
                  htmlFor="dep_name"
                  className="block text-sm font-bold text-slate-800 mb-2"
                >
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="dep_name"
                  name="dep_name"
                  type="text"
                  value={formData.dep_name}
                  onChange={handleChange}
                  placeholder="e.g., Engineering"
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-lg"
                  required
                  disabled={loading}
                />
              </div>

              {/* Department Code */}
              <div>
                <label
                  htmlFor="dep_code"
                  className="block text-sm font-bold text-slate-800 mb-2"
                >
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  id="dep_code"
                  name="dep_code"
                  type="text"
                  value={formData.dep_code}
                  onChange={handleChange}
                  placeholder="e.g., ENG"
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-lg uppercase tracking-widest"
                  maxLength={5}
                  required
                  disabled={loading}
                />
              </div>

              {/* Head of Department */}
              <div>
                <label
                  htmlFor="headEmployeeId"
                  className="block text-sm font-bold text-slate-800 mb-2"
                >
                  Head of Department
                </label>
                <select
                  id="headEmployeeId"
                  name="headEmployeeId"
                  value={formData.headEmployeeId}
                  onChange={handleChange}
                  disabled={loading || fetching}
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="">— Select Head (optional) —</option>
                  {employees.length === 0 && !fetching ? (
                    <option disabled>No employees found</option>
                  ) : (
                    employees.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.firstName} {e.lastName} ({e.designation})
                      </option>
                    ))
                  )}
                </select>
                {fetching && (
                  <p className="text-slate-500 text-sm mt-1">
                    Loading employees…
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-bold text-slate-800 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Short description (optional)"
                  className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white resize-none"
                  disabled={loading}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl text-white font-bold shadow hover:opacity-95 transition"
                >
                  {loading ? "Adding…" : "Add Department"}
                </button>
                <Link
                  to="/admin-dashboard/departments"
                  className="px-8 py-4 border-2 border-slate-200 rounded-2xl bg-white font-bold text-slate-700 shadow hover:bg-slate-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepartment;
