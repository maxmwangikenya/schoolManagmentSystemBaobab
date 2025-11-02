// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    refreshToken: { type: String, default: null },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    profileImage: { type: String, default: null },
    accountLockedUntil: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil.getTime() > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts = (this.loginAttempts || 0) + 1;
  if (this.loginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    this.loginAttempts = 0;
  }
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.accountLockedUntil = null;
  await this.save();
};

function isBcryptHash(val) {
  return typeof val === 'string' && val.startsWith('$2');
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (isBcryptHash(this.password)) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.loginAttempts;
  delete obj.accountLockedUntil;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
