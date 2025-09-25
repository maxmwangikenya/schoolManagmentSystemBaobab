// models/Salary.js
import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: {
    type: Number,
    default: 0,
    min: 0
  },
  deductions: {
    type: Number,
    default: 0,
    min: 0
  },
  netSalary: {
    type: Number,
    required: true,
    min: 0
  },
  payDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
salarySchema.index({ employeeId: 1, payDate: -1 });
salarySchema.index({ departmentId: 1 });
salarySchema.index({ payDate: -1 });

// Virtual for formatted net salary
salarySchema.virtual('formattedNetSalary').get(function() {
  return `$${this.netSalary.toFixed(2)}`;
});

const Salary = mongoose.model('Salary', salarySchema);

export default Salary;