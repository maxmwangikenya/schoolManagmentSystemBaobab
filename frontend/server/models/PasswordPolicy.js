// models/PasswordPolicy.js
import mongoose from 'mongoose';

const passwordPolicySchema = new mongoose.Schema({
  minLength: { type: Number, default: 8 },
  requireUppercase: { type: Boolean, default: true },
  requireLowercase: { type: Boolean, default: true },
  requireNumbers: { type: Boolean, default: true },
  requireSpecialChars: { type: Boolean, default: true },
  specialCharacters: { type: String, default: '!@#$%^&*(),.?":{}|<>[]\\-_+=~`' },
  preventPasswordReuse: { type: Boolean, default: true },
  passwordHistoryCount: { type: Number, default: 5 },
  maxPasswordAge: { type: Number, default: 90 },
  accountLockoutAttempts: { type: Number, default: 5 },
  accountLockoutDuration: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' }
}, { timestamps: true });

passwordPolicySchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

passwordPolicySchema.statics.getCurrentPolicy = async function() {
  let policy = await this.findOne({ isActive: true });
  
  if (!policy) {
    policy = new this({
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
      notes: 'Default password policy'
    });
    await policy.save();
  }
  
  return policy;
};

passwordPolicySchema.methods.validatePassword = function(password) {
  const errors = [];
  const warnings = [];
  let score = 0;

  if (password.length < this.minLength) {
    errors.push(`Password must be at least ${this.minLength} characters long`);
  } else score += 2;

  if (this.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) score += 1;

  if (this.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) score += 1;

  if (this.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) score += 1;

  const specialCharsRegex = new RegExp(`[${this.specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
  if (this.requireSpecialChars && !specialCharsRegex.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (specialCharsRegex.test(password)) score += 1;

  if (password.length >= 12) score += 2;
  if (/(password|admin|user|login|welcome|123456)/i.test(password)) {
    warnings.push('Avoid common words');
    score -= 2;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, Math.min(10, score))
  };
};

export default mongoose.model('PasswordPolicy', passwordPolicySchema);