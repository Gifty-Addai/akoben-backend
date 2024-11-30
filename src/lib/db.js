import mongoose from 'mongoose';

export const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in the environment variables");
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`Connected successfully with ${conn.connection.host}`);
  } catch (error) {
    console.error(`Connection failed: ${error instanceof Error ? error.message : error}`);
  }
};
