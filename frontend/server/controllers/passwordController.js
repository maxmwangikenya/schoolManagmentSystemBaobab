// controllers/passwordController.js - Enhanced with Password History
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import PasswordHistory from '../models/PasswordHistory.js';
import PasswordPolicy from '../models/PasswordPolicy.js';

const passwordController = {
  // Change password for authenticated user with history tracking
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id || req.user._id;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Please provide current password, new password, and confirmation',
          field: 'general'
        });
      }

      // Get current password policy
      const policy = await PasswordPolicy.getCurrentPolicy();
      
      // Validate new password against policy
      const policyValidation = policy.validatePassword(newPassword);
      if (!policyValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: policyValidation.errors.join(', '),
          field: 'newPassword',
          details: policyValidation
        });
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'New password and confirmation do not match',
          field: 'confirmPassword'
        });
      }

      // Find user
      let user = null;
      let userModel = null;

      user = await User.findById(userId);
      if (user) {
        userModel = 'User';
      } else {
        user = await Employee.findById(userId);
        if (user) {
          userModel = 'Employee';
        }
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          field: 'general'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
          field: 'currentPassword'
        });
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          error: 'New password must be different from current password',
          field: 'newPassword'
        });
      }

      // Check password reuse if policy requires it
      if (policy.preventPasswordReuse) {
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        const isPasswordReused = await PasswordHistory.checkPasswordReuse(
          userId, 
          hashedNewPassword, 
          policy.passwordHistoryCount * 30 // Check based on policy
        );

        if (isPasswordReused) {
          return res.status(400).json({
            success: false,
            error: `Password was used recently. Please choose a different password.`,
            field: 'newPassword'
          });
        }
      }

      // Save current password to history before changing
      await PasswordHistory.logPasswordChange({
        userId: userId,
        userModel: userModel,
        oldPasswordHash: user.password,
        changeType: 'self_change',
        changedBy: userId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      const updateData = {
        password: hashedNewPassword,
        updatedAt: new Date(),
        lastPasswordChange: new Date()
      };

      if (userModel === 'User') {
        await User.findByIdAndUpdate(userId, updateData);
      } else {
        await Employee.findByIdAndUpdate(userId, updateData);
      }

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        passwordStrength: policyValidation.score
      });

    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password. Please try again.',
        field: 'general'
      });
    }
  },

  // ✅ NEW: Admin changes employee password (without current password)
  adminChangeEmployeePassword: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { newPassword, confirmPassword } = req.body;
      const adminId = req.user.id || req.user._id;

      console.log('🔐 Admin changing password for employee:', employeeId);
      console.log('👤 Requesting admin:', req.user.email);

      // Validation
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Please provide new password and confirmation',
          field: !newPassword ? 'newPassword' : 'confirmPassword'
        });
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Passwords do not match',
          field: 'confirmPassword'
        });
      }

      // Get current password policy
      const policy = await PasswordPolicy.getCurrentPolicy();
      
      // Validate new password against policy
      const policyValidation = policy.validatePassword(newPassword);
      if (!policyValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: policyValidation.errors.join(', '),
          field: 'newPassword',
          details: policyValidation
        });
      }

      // Find employee
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      // Save current password to history
      await PasswordHistory.logPasswordChange({
        userId: employeeId,
        userModel: 'Employee',
        oldPasswordHash: employee.password,
        changeType: 'admin_reset',
        changedBy: adminId,
        reason: 'Password changed by administrator',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update employee password
      await Employee.findByIdAndUpdate(employeeId, {
        password: hashedNewPassword,
        updatedAt: new Date(),
        passwordResetBy: adminId,
        passwordResetAt: new Date(),
        lastPasswordChange: new Date()
      });

      console.log(`✅ Password updated successfully for ${employee.firstName} ${employee.lastName}`);

      res.status(200).json({
        success: true,
        message: `Password changed successfully for ${employee.firstName} ${employee.lastName}`,
        passwordStrength: policyValidation.score
      });

    } catch (error) {
      console.error('❌ Error in admin password change:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change employee password. Please try again.'
      });
    }
  },

  // Reset password by admin (for employees)
  resetEmployeePassword: async (req, res) => {
    try {
      const { employeeId, newPassword, confirmPassword, reason } = req.body;
      const adminId = req.user.id || req.user._id;

      // Validation
      if (!employeeId || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Please provide employee ID, new password, and confirmation'
        });
      }

      // Check if requesting user is admin
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      // Get current password policy
      const policy = await PasswordPolicy.getCurrentPolicy();
      
      // Validate new password against policy
      const policyValidation = policy.validatePassword(newPassword);
      if (!policyValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: policyValidation.errors.join(', '),
          details: policyValidation
        });
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Password and confirmation do not match'
        });
      }

      // Find employee
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      // Save current password to history
      await PasswordHistory.logPasswordChange({
        userId: employeeId,
        userModel: 'Employee',
        oldPasswordHash: employee.password,
        changeType: 'admin_reset',
        changedBy: adminId,
        reason: reason || 'Password reset by administrator',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update employee password
      await Employee.findByIdAndUpdate(employeeId, {
        password: hashedNewPassword,
        updatedAt: new Date(),
        passwordResetBy: adminId,
        passwordResetAt: new Date(),
        lastPasswordChange: new Date(),
        forcePasswordChange: true // Force user to change password on next login
      });

      res.status(200).json({
        success: true,
        message: `Password reset successfully for employee: ${employee.firstName} ${employee.lastName}`,
        passwordStrength: policyValidation.score
      });

    } catch (error) {
      console.error('Error resetting employee password:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset password. Please try again.'
      });
    }
  },

  // Get password history
  getPasswordHistory: async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;
      const { limit = 10, employeeId } = req.query;

      // If employeeId is provided and user is admin, get that employee's history
      let targetUserId = userId;
      if (employeeId && req.user.role === 'admin') {
        targetUserId = employeeId;
      }

      // Get password history
      const history = await PasswordHistory.getUserHistory(targetUserId, parseInt(limit));
      
      // Get user info
      let user = await User.findById(targetUserId);
      let userType = 'admin';
      
      if (!user) {
        user = await Employee.findById(targetUserId);
        userType = 'employee';
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const passwordInfo = {
        lastChanged: user.lastPasswordChange || user.updatedAt || user.createdAt,
        userType: userType,
        accountCreated: user.createdAt,
        totalChanges: history.length,
        forcePasswordChange: user.forcePasswordChange || false
      };

      // Format history for response (remove sensitive data)
      const formattedHistory = history.map(record => ({
        id: record._id,
        changeType: record.changeType,
        changedBy: record.changedBy ? {
          name: `${record.changedBy.firstName} ${record.changedBy.lastName}`,
          email: record.changedBy.email
        } : null,
        reason: record.reason,
        createdAt: record.createdAt,
        ipAddress: record.ipAddress ? record.ipAddress.substring(0, 10) + '...' : null 
      }));

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
          email: user.email,
          userType
        },
        passwordInfo,
        history: formattedHistory
      });

    } catch (error) {
      console.error('Error fetching password history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch password information'
      });
    }
  },

  // Get current password policy
  getPasswordPolicy: async (req, res) => {
    try {
      const policy = await PasswordPolicy.getCurrentPolicy()
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      // Remove sensitive internal data
      const publicPolicy = {
        id: policy._id,
        minLength: policy.minLength,
        requireUppercase: policy.requireUppercase,
        requireLowercase: policy.requireLowercase,
        requireNumbers: policy.requireNumbers,
        requireSpecialChars: policy.requireSpecialChars,
        preventPasswordReuse: policy.preventPasswordReuse,
        passwordHistoryCount: policy.passwordHistoryCount,
        maxPasswordAge: policy.maxPasswordAge,
        specialCharacters: policy.specialCharacters,
        isActive: policy.isActive,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
        createdBy: policy.createdBy ? {
          name: `${policy.createdBy.firstName} ${policy.createdBy.lastName}`,
          email: policy.createdBy.email
        } : null,
        updatedBy: policy.updatedBy ? {
          name: `${policy.updatedBy.firstName} ${policy.updatedBy.lastName}`,
          email: policy.updatedBy.email
        } : null,
        notes: policy.notes
      };

      res.status(200).json({
        success: true,
        policy: publicPolicy
      });

    } catch (error) {
      console.error('Error fetching password policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch password policy'
      });
    }
  },

  // Update password policy (admin only)
  updatePasswordPolicy: async (req, res) => {
    try {
      const {
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecialChars,
        preventPasswordReuse,
        passwordHistoryCount,
        maxPasswordAge,
        accountLockoutAttempts,
        accountLockoutDuration,
        specialCharacters,
        notes
      } = req.body;
      const adminId = req.user.id || req.user._id;

      // Check if requesting user is admin
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      // Deactivate current policy
      await PasswordPolicy.updateMany({ isActive: true }, { isActive: false });

      // Create new policy
      const newPolicy = new PasswordPolicy({
        minLength: minLength || 8,
        requireUppercase: requireUppercase !== undefined ? requireUppercase : true,
        requireLowercase: requireLowercase !== undefined ? requireLowercase : true,
        requireNumbers: requireNumbers !== undefined ? requireNumbers : true,
        requireSpecialChars: requireSpecialChars !== undefined ? requireSpecialChars : true,
        preventPasswordReuse: preventPasswordReuse !== undefined ? preventPasswordReuse : true,
        passwordHistoryCount: passwordHistoryCount || 5,
        maxPasswordAge: maxPasswordAge || 90,
        accountLockoutAttempts: accountLockoutAttempts || 5,
        accountLockoutDuration: accountLockoutDuration || 30,
        specialCharacters: specialCharacters || '!@#$%^&*(),.?":{}|<>[]\\-_+=~`',
        isActive: true,
        createdBy: adminId,
        notes: notes || 'Updated password policy'
      });

      await newPolicy.save();
      await newPolicy.populate('createdBy', 'firstName lastName email');

      res.status(200).json({
        success: true,
        message: 'Password policy updated successfully',
        policy: {
          id: newPolicy._id,
          minLength: newPolicy.minLength,
          requireUppercase: newPolicy.requireUppercase,
          requireLowercase: newPolicy.requireLowercase,
          requireNumbers: newPolicy.requireNumbers,
          requireSpecialChars: newPolicy.requireSpecialChars,
          preventPasswordReuse: newPolicy.preventPasswordReuse,
          passwordHistoryCount: newPolicy.passwordHistoryCount,
          maxPasswordAge: newPolicy.maxPasswordAge,
          createdBy: {
            name: `${newPolicy.createdBy.firstName} ${newPolicy.createdBy.lastName}`,
            email: newPolicy.createdBy.email
          },
          createdAt: newPolicy.createdAt
        }
      });

    } catch (error) {
      console.error('Error updating password policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update password policy'
      });
    }
  },

  // Validate password strength
  validatePasswordStrength: async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required'
        });
      }

      // Get current policy
      const policy = await PasswordPolicy.getCurrentPolicy();
      
      // Validate against policy
      const validation = policy.validatePassword(password);
      
      // Additional strength analysis
      const strengthAnalysis = {
        length: password.length,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: new RegExp(`[${policy.specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password),
        uniqueCharacters: new Set(password).size,
        commonPatterns: {
          repeatingChars: /(.)\1{2,}/.test(password),
          sequentialChars: /(abc|bcd|cde|def|123|234|345|456|567|678|789)/i.test(password),
          commonWords: /(password|admin|user|login|welcome|123456)/i.test(password),
          keyboardPatterns: /(qwerty|asdf|zxcv|qaz|wsx|edc)/i.test(password)
        }
      };

      // Calculate entropy (rough estimate)
      const charset = 
        (strengthAnalysis.hasLowercase ? 26 : 0) +
        (strengthAnalysis.hasUppercase ? 26 : 0) +
        (strengthAnalysis.hasNumbers ? 10 : 0) +
        (strengthAnalysis.hasSpecialChars ? policy.specialCharacters.length : 0);
      
      const entropy = password.length * Math.log2(charset);

      // Strength levels
      let strengthLevel = 'Very Weak';
      let strengthColor = 'red';
      let strengthScore = validation.score;

      if (strengthScore >= 8 && entropy >= 60) {
        strengthLevel = 'Very Strong';
        strengthColor = 'green';
      } else if (strengthScore >= 6 && entropy >= 50) {
        strengthLevel = 'Strong';
        strengthColor = 'green';
      } else if (strengthScore >= 4 && entropy >= 40) {
        strengthLevel = 'Good';
        strengthColor = 'blue';
      } else if (strengthScore >= 2 && entropy >= 30) {
        strengthLevel = 'Fair';
        strengthColor = 'yellow';
      } else if (strengthScore >= 1) {
        strengthLevel = 'Weak';
        strengthColor = 'orange';
      }

      res.status(200).json({
        success: true,
        validation: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
          score: validation.score,
          maxScore: 10
        },
        strength: {
          level: strengthLevel,
          color: strengthColor,
          score: strengthScore,
          entropy: Math.round(entropy)
        },
        analysis: strengthAnalysis,
        policy: {
          minLength: policy.minLength,
          requireUppercase: policy.requireUppercase,
          requireLowercase: policy.requireLowercase,
          requireNumbers: policy.requireNumbers,
          requireSpecialChars: policy.requireSpecialChars
        },
        suggestions: [
          password.length < policy.minLength && `Use at least ${policy.minLength} characters`,
          password.length < 12 && 'Consider using 12+ characters for better security',
          !strengthAnalysis.hasUppercase && policy.requireUppercase && 'Add uppercase letters (A-Z)',
          !strengthAnalysis.hasLowercase && policy.requireLowercase && 'Add lowercase letters (a-z)',
          !strengthAnalysis.hasNumbers && policy.requireNumbers && 'Add numbers (0-9)',
          !strengthAnalysis.hasSpecialChars && policy.requireSpecialChars && 'Add special characters',
          strengthAnalysis.commonPatterns.repeatingChars && 'Avoid repeating characters',
          strengthAnalysis.commonPatterns.sequentialChars && 'Avoid sequential characters',
          strengthAnalysis.commonPatterns.commonWords && 'Avoid common words',
          strengthAnalysis.commonPatterns.keyboardPatterns && 'Avoid keyboard patterns',
          strengthAnalysis.uniqueCharacters < password.length * 0.7 && 'Use more diverse characters'
        ].filter(Boolean)
      });

    } catch (error) {
      console.error('Error validating password strength:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate password strength'
      });
    }
  },

  // Check if user needs to change password
  checkPasswordExpiry: async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;
      
      // Find user
      let user = await User.findById(userId);
      let userType = 'admin';
      
      if (!user) {
        user = await Employee.findById(userId);
        userType = 'employee';
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get current policy
      const policy = await PasswordPolicy.getCurrentPolicy();
      
      const lastPasswordChange = user.lastPasswordChange || user.createdAt;
      const daysSinceChange = Math.floor((new Date() - lastPasswordChange) / (1000 * 60 * 60 * 24));
      
      const status = {
        forceChange: user.forcePasswordChange || false,
        daysUntilExpiry: Math.max(0, policy.maxPasswordAge - daysSinceChange),
        isExpired: daysSinceChange > policy.maxPasswordAge,
        daysSinceLastChange: daysSinceChange,
        maxPasswordAge: policy.maxPasswordAge,
        lastPasswordChange: lastPasswordChange,
        userType: userType
      };

      res.status(200).json({
        success: true,
        status
      });

    } catch (error) {
      console.error('Error checking password expiry:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check password status'
      });
    }
  },

  // Bulk password reset for multiple employees (admin only)
  bulkPasswordReset: async (req, res) => {
    try {
      const { employeeIds, newPassword, reason } = req.body;
      const adminId = req.user.id || req.user._id;

      if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please provide employee IDs array'
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Please provide new password'
        });
      }

      // Check if requesting user is admin
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        });
      }

      // Get current password policy
      const policy = await PasswordPolicy.getCurrentPolicy();
      const policyValidation = policy.validatePassword(newPassword);
      
      if (!policyValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: policyValidation.errors.join(', ')
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const results = {
        successful: [],
        failed: [],
        total: employeeIds.length
      };

      // Process each employee
      for (const employeeId of employeeIds) {
        try {
          const employee = await Employee.findById(employeeId);
          if (!employee) {
            results.failed.push({ employeeId, error: 'Employee not found' });
            continue;
          }

          // Save to password history
          await PasswordHistory.logPasswordChange({
            userId: employeeId,
            userModel: 'Employee',
            oldPasswordHash: employee.password,
            changeType: 'admin_reset',
            changedBy: adminId,
            reason: reason || 'Bulk password reset by administrator'
          });

          // Update password
          await Employee.findByIdAndUpdate(employeeId, {
            password: hashedPassword,
            updatedAt: new Date(),
            passwordResetBy: adminId,
            passwordResetAt: new Date(),
            lastPasswordChange: new Date(),
            forcePasswordChange: true
          });

          results.successful.push({
            employeeId,
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email
          });

        } catch (error) {
          results.failed.push({ employeeId, error: error.message });
        }
      }

      res.status(200).json({
        success: true,
        message: `Bulk password reset completed. ${results.successful.length}/${results.total} successful.`,
        results
      });

    } catch (error) {
      console.error('Error in bulk password reset:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform bulk password reset'
      });
    }
  }
};

export default passwordController;