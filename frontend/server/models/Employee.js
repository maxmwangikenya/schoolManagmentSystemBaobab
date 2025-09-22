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
    designation: { 
        type: String 
    },
    department: { 
        type: String 
    },
    salary: { 
        type: Number 
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

// ✅ Force model recompilation to ensure schema changes take effect
delete mongoose.models.Employee;
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;