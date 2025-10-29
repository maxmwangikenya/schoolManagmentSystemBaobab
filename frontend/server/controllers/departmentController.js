// server/controllers/departmentController.js
import mongoose from "mongoose";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js"; // for counts

// Helpers
const clean = (s) => (typeof s === "string" ? s.trim() : s);
const ensureUpper = (s) => (typeof s === "string" ? s.trim().toUpperCase() : s);

// POST /api/departments
export const createDepartment = async (req, res) => {
  try {
    const {
      dep_name, dep_code, description,
      headName, headEmail, headPhone,
      location, costCenter, brandColor, icon,
      approvers, defaultWorkWeek, defaultStartTime, defaultEndTime
    } = req.body;

    if (!dep_name?.trim()) return res.status(400).json({ success:false, error:"Department name is required" });
    if (!dep_code?.trim()) return res.status(400).json({ success:false, error:"Department code is required" });

    // Uniqueness checks
    const code = ensureUpper(dep_code);
    const existCode = await Department.findOne({ dep_code: code });
    if (existCode) return res.status(409).json({ success:false, error:"Department code already exists" });

    const existName = await Department.findOne({ dep_name: clean(dep_name) });
    if (existName) return res.status(409).json({ success:false, error:"Department name already exists" });

    const dep = await Department.create({
      dep_name: clean(dep_name),
      dep_code: code,
      description: clean(description) || "",
      headName: clean(headName) || "",
      headEmail: (headEmail || "").toLowerCase().trim(),
      headPhone: clean(headPhone) || "",
      location: clean(location) || "",
      costCenter: clean(costCenter) || "",
      brandColor: clean(brandColor) || "",
      icon: clean(icon) || "",
      approvers: Array.isArray(approvers) ? approvers.map(clean) : [],
      defaultWorkWeek: Array.isArray(defaultWorkWeek) && defaultWorkWeek.length ? defaultWorkWeek : undefined,
      defaultStartTime: clean(defaultStartTime) || undefined,
      defaultEndTime: clean(defaultEndTime) || undefined,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null
    });

    return res.status(201).json({ success:true, department: dep });
  } catch (err) {
    console.error("createDepartment error:", err);
    return res.status(500).json({ success:false, error:"Failed to create department" });
  }
};

// GET /api/departments
// Query: q, active, archived, page, limit, sort (e.g., "dep_name:asc,updatedAt:desc")
export const listDepartments = async (req, res) => {
  try {
    const {
      q = "", active, archived, page = 1, limit = 10, sort = "dep_name:asc"
    } = req.query;

    const filter = {};
    if (q) {
      filter.$or = [
        { dep_name:   { $regex: q, $options: "i" } },
        { dep_code:   { $regex: q, $options: "i" } },
        { slug:       { $regex: q, $options: "i" } },
        { location:   { $regex: q, $options: "i" } },
        { costCenter: { $regex: q, $options: "i" } },
        { headName:   { $regex: q, $options: "i" } }
      ];
    }
    if (active !== undefined)   filter.isActive   = active === "true";
    if (archived !== undefined) filter.isArchived = archived === "true";

    // Sorting
    const sortObj = {};
    String(sort).split(",").forEach(s => {
      const [k, dir] = s.split(":");
      if (k) sortObj[k] = dir === "desc" ? -1 : 1;
    });

    const pageNum  = Math.max(parseInt(page) || 1, 1);
    const perPage  = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip     = (pageNum - 1) * perPage;

    // Aggregate to include employeeCount
    const pipeline = [
      { $match: filter },
      { $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "department",
          as: "employees"
        }
      },
      { $addFields: { employeeCount: { $size: "$employees" } } },
      { $project: { employees: 0 } },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: perPage }
    ];

    const [rows, total] = await Promise.all([
      Department.aggregate(pipeline),
      Department.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      page: pageNum,
      limit: perPage,
      total,
      pages: Math.ceil(total / perPage),
      departments: rows
    });
  } catch (err) {
    console.error("listDepartments error:", err);
    return res.status(500).json({ success:false, error:"Failed to fetch departments" });
  }
};

// GET /api/departments/:id
export const getDepartment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success:false, error:"Invalid id" });
    }
    const dep = await Department.findById(req.params.id).lean();
    if (!dep) return res.status(404).json({ success:false, error:"Department not found" });

    const employeeCount = await Employee.countDocuments({ department: dep._id });
    return res.json({ success:true, department: { ...dep, employeeCount } });
  } catch (err) {
    console.error("getDepartment error:", err);
    return res.status(500).json({ success:false, error:"Failed to fetch department" });
  }
};

// PUT/PATCH /api/departments/:id
export const updateDepartment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success:false, error:"Invalid id" });

    const body = req.body || {};
    const update = {
      ...(body.dep_name !== undefined ? { dep_name: clean(body.dep_name) } : {}),
      ...(body.dep_code !== undefined ? { dep_code: ensureUpper(body.dep_code) } : {}),
      ...(body.description !== undefined ? { description: clean(body.description) || "" } : {}),
      ...(body.headName !== undefined ? { headName: clean(body.headName) || "" } : {}),
      ...(body.headEmail !== undefined ? { headEmail: (body.headEmail || "").toLowerCase().trim() } : {}),
      ...(body.headPhone !== undefined ? { headPhone: clean(body.headPhone) || "" } : {}),
      ...(body.location !== undefined ? { location: clean(body.location) || "" } : {}),
      ...(body.costCenter !== undefined ? { costCenter: clean(body.costCenter) || "" } : {}),
      ...(body.brandColor !== undefined ? { brandColor: clean(body.brandColor) || "" } : {}),
      ...(body.icon !== undefined ? { icon: clean(body.icon) || "" } : {}),
      ...(body.approvers !== undefined ? { approvers: Array.isArray(body.approvers) ? body.approvers.map(clean) : [] } : {}),
      ...(body.defaultWorkWeek !== undefined ? { defaultWorkWeek: Array.isArray(body.defaultWorkWeek) ? body.defaultWorkWeek : [1,2,3,4,5] } : {}),
      ...(body.defaultStartTime !== undefined ? { defaultStartTime: clean(body.defaultStartTime) || "08:00" } : {}),
      ...(body.defaultEndTime !== undefined ? { defaultEndTime: clean(body.defaultEndTime) || "17:00" } : {}),
      ...(body.isActive !== undefined ? { isActive: !!body.isActive } : {}),
      updatedBy: req.user?._id || null
    };

    // Uniqueness checks when changing name/code
    if (update.dep_name) {
      const clash = await Department.findOne({ dep_name: update.dep_name, _id: { $ne: id } });
      if (clash) return res.status(409).json({ success:false, error:"Department name already exists" });
    }
    if (update.dep_code) {
      const clash = await Department.findOne({ dep_code: update.dep_code, _id: { $ne: id } });
      if (clash) return res.status(409).json({ success:false, error:"Department code already exists" });
    }

    const updated = await Department.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success:false, error:"Department not found" });

    return res.json({ success:true, message:"Department updated", department: updated });
  } catch (err) {
    console.error("updateDepartment error:", err);
    return res.status(500).json({ success:false, error:"Failed to update department" });
  }
};

// POST /api/departments/:id/archive
export const archiveDepartment = async (req, res) => {
  try {
    const id = req.params.id;
    const dep = await Department.findByIdAndUpdate(id, { isArchived: true, isActive: false, updatedBy: req.user?._id || null }, { new: true });
    if (!dep) return res.status(404).json({ success:false, error:"Department not found" });
    return res.json({ success:true, message:"Department archived", department: dep });
  } catch (err) {
    console.error("archiveDepartment error:", err);
    return res.status(500).json({ success:false, error:"Failed to archive department" });
  }
};

// POST /api/departments/:id/restore
export const restoreDepartment = async (req, res) => {
  try {
    const id = req.params.id;
    const dep = await Department.findByIdAndUpdate(id, { isArchived: false, isActive: true, updatedBy: req.user?._id || null }, { new: true });
    if (!dep) return res.status(404).json({ success:false, error:"Department not found" });
    return res.json({ success:true, message:"Department restored", department: dep });
  } catch (err) {
    console.error("restoreDepartment error:", err);
    return res.status(500).json({ success:false, error:"Failed to restore department" });
  }
};

// POST /api/departments/:id/activate
export const activateDepartment = async (req, res) => {
  try {
    const id = req.params.id;
    const dep = await Department.findByIdAndUpdate(id, { isActive: true, updatedBy: req.user?._id || null }, { new: true });
    if (!dep) return res.status(404).json({ success:false, error:"Department not found" });
    return res.json({ success:true, message:"Department activated", department: dep });
  } catch (err) {
    console.error("activateDepartment error:", err);
    return res.status(500).json({ success:false, error:"Failed to activate department" });
  }
};

// POST /api/departments/:id/deactivate
export const deactivateDepartment = async (req, res) => {
  try {
    const id = req.params.id;
    const dep = await Department.findByIdAndUpdate(id, { isActive: false, updatedBy: req.user?._id || null }, { new: true });
    if (!dep) return res.status(404).json({ success:false, error:"Department not found" });
    return res.json({ success:true, message:"Department deactivated", department: dep });
  } catch (err) {
    console.error("deactivateDepartment error:", err);
    return res.status(500).json({ success:false, error:"Failed to deactivate department" });
  }
};
