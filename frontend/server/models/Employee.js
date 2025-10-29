import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, "Employee name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Employee email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  employeeId: {
    type: String,
    required: [true, "Employee ID is required"],
    unique: true,
    trim: true,
  },

  // Personal Information
  dob: { type: Date },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  maritalStatus: {
    type: String,
    enum: ["Single", "Married", "Divorced", "Widowed"],
  },

  // Contact Information
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  nationalId: {
    type: String,
    required: [true, "National ID is required"],
    unique: true,
  },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },

  // Job Information
  designation: {
    type: String,
    required: [true, "Designation is required"],
    trim: true,
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    index: true, // Used for analytics and grouping
  },

  // Salary Structure
  salary: {
    basicSalary: { type: Number, required: true, default: 0 },
    allowances: {
      housing: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      nhif: { type: Number, default: 0 },
      nssf: { type: Number, default: 0 },
      housingLevy: { type: Number, default: 0 },
      paye: { type: Number, default: 0 },
    },
    grossSalary: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
  },

  // Statutory Details
  kraPIN: { type: String },
  nssfNumber: { type: String },
  nhifNumber: { type: String },

  // Profile
  profileImage: { type: String },

  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update "updatedAt" on save
employeeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Salary calculation helper method
employeeSchema.methods.calculateSalary = function () {
  const basic = this.salary.basicSalary || 0;

  const allowances = this.salary.allowances || {};
  const totalAllowances =
    (allowances.housing || 0) +
    (allowances.transport || 0) +
    (allowances.medical || 0) +
    (allowances.other || 0);

  this.salary.grossSalary = basic + totalAllowances;

  const deductions = this.salary.deductions || {};
  const totalDeductions =
    (deductions.nhif || 0) +
    (deductions.nssf || 0) +
    (deductions.housingLevy || 0) +
    (deductions.paye || 0);

  this.salary.netSalary = this.salary.grossSalary - totalDeductions;

  return this.salary;
};

// Index for department analytics
employeeSchema.index({ department: 1 });

// Prevent model overwrite errors during development
delete mongoose.models.Employee;
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
