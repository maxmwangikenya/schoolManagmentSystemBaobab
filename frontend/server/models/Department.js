// server/models/Department.js
import mongoose from "mongoose";
import { slugify } from "../utils/strings.js";

const departmentSchema = new mongoose.Schema(
  {
    dep_name: { type: String, required: true, trim: true },
    dep_code: { type: String, required: true, trim: true, uppercase: true }, // e.g., "ENG"
    slug:     { type: String, required: true, trim: true, lowercase: true }, // e.g., "engineering"
    description: { type: String, trim: true },

    // Head (free text)
    headName:  { type: String, trim: true, default: "" },
    headEmail: { type: String, trim: true, lowercase: true, default: "" },
    headPhone: { type: String, trim: true, default: "" },

    // Ops & Finance
    location:   { type: String, trim: true, default: "" },
    costCenter: { type: String, trim: true, default: "" },

    // UI
    brandColor: { type: String, trim: true, default: "" }, // e.g., "#4f46e5"
    icon:       { type: String, trim: true, default: "" }, // e.g., "Building2"

    // Workflow
    approvers: [{ type: String, trim: true }], // emails/names for now

    // Defaults (optional)
    defaultWorkWeek: { type: [Number], default: [1,2,3,4,5] }, // 1=Mon..7=Sun
    defaultStartTime: { type: String, default: "08:00" }, // HH:mm
    defaultEndTime:   { type: String, default: "17:00" },

    // State
    isActive:   { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

// Uniques
departmentSchema.index({ dep_code: 1 }, { unique: true });
departmentSchema.index({ slug: 1 }, { unique: true });
departmentSchema.index({ dep_name: 1 }, { unique: true });

// Pre-validate: compute slug
departmentSchema.pre("validate", function(next) {
  if (this.isModified("dep_name") || !this.slug) {
    this.slug = slugify(this.dep_name);
  }
  next();
});

const Department = mongoose.model("Department", departmentSchema);
export default Department;
