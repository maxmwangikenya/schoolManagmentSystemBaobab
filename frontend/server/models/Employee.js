import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    // Your user schema fields here
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'employee']
    },
    // Add other fields as needed
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Check if model already exists, if not create it
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;