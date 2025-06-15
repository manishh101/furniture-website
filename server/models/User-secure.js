const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    sparse: true, // Allow multiple null values but unique non-null values
    index: true
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'editor'],
      message: 'Role must be either admin or editor'
    },
    default: 'editor'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to handle failed login attempts
UserSchema.methods.incLoginAttempts = function() {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we have reached max attempts and it's not locked yet, lock it
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user and handle login attempts
UserSchema.statics.getAuthenticated = async function(email, password) {
  try {
    // Find user with password field
    const user = await this.findOne({
      $or: [{ email }, { phone: email }],
      isActive: true
    }).select('+password');
    
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    // Check if user is locked
    if (user.isLocked) {
      await user.incLoginAttempts();
      return { 
        success: false, 
        message: 'Account temporarily locked due to too many failed login attempts',
        isLocked: true 
      };
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      // Reset login attempts on successful login
      if (user.loginAttempts || user.lockUntil) {
        await user.resetLoginAttempts();
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      return { success: true, user };
    } else {
      // Increment login attempts
      await user.incLoginAttempts();
      return { success: false, message: 'Invalid credentials' };
    }
  } catch (error) {
    throw new Error('Authentication error: ' + error.message);
  }
};

// Static method to create admin user if none exists
UserSchema.statics.createAdminIfNone = async function() {
  try {
    const adminExists = await this.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('No admin user found. Creating default admin...');
      
      const adminUser = new this({
        name: 'System Administrator',
        email: 'admin@manishsteel.com',
        phone: '9814379071',
        password: 'Admin@2025!', // This will be hashed by pre-save middleware
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Default admin user created successfully');
      console.log('Email: admin@manishsteel.com');
      console.log('Phone: 9814379071');
      console.log('Password: Admin@2025!');
      console.log('Please change the password after first login');
      
      return adminUser;
    }
    
    return adminExists;
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
