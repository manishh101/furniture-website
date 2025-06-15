require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
    return true;
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    process.exit(1);
  }
};

// Create default admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: '9814379071' });
    
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create a new admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('M@nishsteel', salt);
    
    const adminUser = new User({
      name: 'Manish Steel Admin',
      email: '9814379071', // Using phone as email for backward compatibility
      password: hashedPassword,
      role: 'admin',
      phone: '9814379071'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    
  } catch (err) {
    console.error('Error creating admin user:', err.message);
  }
};

// Main function
const init = async () => {
  const connected = await connectDB();
  
  if (connected) {
    await createAdminUser();
    
    // Disconnect from database
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the script
init();
