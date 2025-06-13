import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {type: string, required: true },
    email: {type: string, required: true},
    password:{type : string, required: true},
    role: { type: String, enum: ["admin", "employee"], required: true},
    profileImage: {type: string},
    createAt: {type:Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

const user = mongoose.model("user", userSchema)

export default user;