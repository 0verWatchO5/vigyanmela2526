import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

/**
 * MongoDB Connection with proper error handling
 */
 async function Dbconns() {
  const status = mongoose.connection.readyState;

  try {
    // Already connected
    if (status === 1) {
      console.log(' Using existing MongoDB connection');
      return mongoose;
    }

    // Currently connecting - wait for it
    if (status === 2) {
      console.log(' MongoDB connection in progress, waiting...');
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
      return mongoose;
    }

    // Disconnected or disconnecting - establish new connection
    if (status === 0 || status === 3) {
      console.log(' Connecting to MongoDB...');
      
      await mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      
      console.log(' MongoDB connected successfully');
      return mongoose;
    }

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw new Error(`Database connection failed: ${error}`);
  }
}

export default Dbconns;