const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdminUser = async () => {
  try {
    console.log('Starting admin user seeding...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: '9814379071' },
        { phone: '9814379071' }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('M@nishsteel', salt);

    // Create admin user
    const adminUser = new User({
      name: 'Manish Steel Admin',
      email: '9814379071',
      phone: '9814379071',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email/Phone: 9814379071');
    console.log('Password: M@nishsteel');

    return adminUser;
  } catch (error) {
    console.error('Error seeding admin user:', error);
    return null;
  }
};

module.exports = seedAdminUser;
