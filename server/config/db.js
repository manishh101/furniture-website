// MongoDB connection utility

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGO_URI from environment if available (for Atlas)
    let mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      console.log('Using MongoDB URI from environment variable.');
      const conn = await mongoose.connect(mongoUri, {
        // Performance & connection pool settings
        maxPoolSize: 10, // Maximum number of connections in pool
        minPoolSize: 2, // Minimum number of connections in pool
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        serverSelectionTimeoutMS: 5000, // Server selection timeout 5 seconds
        heartbeatFrequencyMS: 10000, // Heartbeat frequency 10 seconds
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return true;
    } else {
      console.error('MONGO_URI environment variable is not set.');
      return false;
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
