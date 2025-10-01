// models/PasswordHistory.js
import mongoose from 'mongoose';

const passwordHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['User', 'Employee']
  },
  oldPasswordHash: {
    type: String,
    required: true
  },
  changeType: {
    type: String,
    required: true,
    enum: ['self_change', 'admin_reset', 'forced_reset', 'system_reset']
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

passwordHistorySchema.index({ userId: 1, createdAt: -1 });

passwordHistorySchema.statics.logPasswordChange = async function(data) {
  const history = new this(data);
  await history.save();
  return history;
};

passwordHistorySchema.statics.checkPasswordReuse = async function(userId, newPasswordHash, daysToCheck = 150) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToCheck);

  const history = await this.find({
    userId: userId,
    createdAt: { $gte: cutoffDate }
  }).select('oldPasswordHash');

  return false; // Simplified - implement bcrypt compare if needed
};

passwordHistorySchema.statics.getUserHistory = async function(userId, limit = 10) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('changedBy', 'firstName lastName email')
    .select('-oldPasswordHash');
};

export default mongoose.model('PasswordHistory', passwordHistorySchema);