import mongoose from 'mongoose';

// Load environment variables from .env file
// This is a common practice to keep sensitive information out of the codebase

import dotenv from 'dotenv';


export const connectDB = async () => {
    console.log('Connecting to MongoDB...');
    console.log(`MongoDB URI: ${process.env.MONGO_URI}`); // Log the MongoDB URI for debugging
    try {

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};
