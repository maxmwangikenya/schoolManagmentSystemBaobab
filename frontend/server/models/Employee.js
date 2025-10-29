import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    employeeId: { 
        type: String, 
        required: true,
        unique: true 
    },
    dob: { 
        type: Date 
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other']
    },
    maritalStatus: { 
        type: String, 
        enum: ['Single', 'Married', 'Divorced', 'Widowed']
    },
    // 🆕 New Contact Fields
    phone: {
        type: String,
        required: true
    },
    nationalId: {
        type: String,
        required: true,
        unique: true
    },
    emergencyContact: {
        name: {
            type: String,
            required: true
        },
        relationship: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String
        }
    },
    // Professional Info
    designation: { 
        type: String,
        required: true
    },
    department: { 
        type: String,
        required: true
    },
    // 🆕 Salary with Deductions
    salary: {
        basicSalary: {
            type: Number,
            required: true,
            default: 0
        },
        allowances: {
            housing: { type: Number, default: 0 },
            transport: { type: Number, default: 0 },
            medical: { type: Number, default: 0 },
            other: { type: Number, default: 0 }
        },
        deductions: {
            nhif: { type: Number, default: 0 },
            nssf: { type: Number, default: 0 },
            housingLevy: { type: Number, default: 0 },
            paye: { type: Number, default: 0 }
        },
        grossSalary: { type: Number, default: 0 },
        netSalary: { type: Number, default: 0 }
    },
    // KRA PIN
    kraPIN: {
        type: String
    },
    nssfNumber: {
        type: String
    },
    nhifNumber: {
        type: String
    },
    profileImage: { 
        type: String 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Auto-update updatedAt
employeeSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate gross and net salary
employeeSchema.methods.calculateSalary = function() {
    const basicSalary = this.salary.basicSalary || 0;
    const allowances = this.salary.allowances || {};
    const totalAllowances = 
        (allowances.housing || 0) + 
        (allowances.transport || 0) + 
        (allowances.medical || 0) + 
        (allowances.other || 0);

    this.salary.grossSalary = basicSalary + totalAllowances;

    const deductions = this.salary.deductions || {};
    const totalDeductions = 
        (deductions.nhif || 0) + 
        (deductions.nssf || 0) + 
        (deductions.housingLevy || 0) + 
        (deductions.paye || 0);

    this.salary.netSalary = this.salary.grossSalary - totalDeductions;

    return this.salary;
};

// ✅ Force model recompilation to ensure schema changes take effect
delete mongoose.models.Employee;
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;