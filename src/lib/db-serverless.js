import mongoose from 'mongoose';

let isConnected = false;

export const connectDbServerless = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in the environment variables");
        }

        // Optimize for serverless
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        console.log(`Connected successfully with ${conn.connection.host}`);
    } catch (error) {
        console.error(`Connection failed: ${error instanceof Error ? error.message : error}`);
        throw error;
    }
};
