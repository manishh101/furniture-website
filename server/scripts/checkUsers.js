require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
    
    const users = await User.find({});
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Phone: ${user.phone}, Name: ${user.name}, Role: ${user.role}`);
    });
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
};

checkUsers();
