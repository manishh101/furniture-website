/**
 * Initialize Admin User
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    // Get User model
    const User = require('../models/User');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@manishsteel.com' });
    
    if (existingAdmin) {
      console.log("Admin user already exists");
    } else {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newAdmin = new User({
        name: 'Admin',
        email: 'admin@manishsteel.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log("Admin user created:");
      console.log("  Email: admin@manishsteel.com");
      console.log("  Password: admin123");
    }
    
    await mongoose.connection.close();
    console.log("Done");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
