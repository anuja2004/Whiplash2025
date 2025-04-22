// config/db.js
import mongoose from 'mongoose';
import config from './config.js'; // Assuming config.js is in the same directory

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB.../n');
    console.log(`MongoDB URI: ${config.MONGO_URI}`);
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;