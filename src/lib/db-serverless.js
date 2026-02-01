import mongoose from 'mongoose';

/** @type {Promise<typeof mongoose> | null} */
let cachedPromise = null;

export const connectDbServerless = async () => {
    if (cachedPromise) {
        console.log('Using existing database connection');
        return cachedPromise;
    }

    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in the environment variables");
        }

        // Cache the promise immediately to handle concurrent cold starts
        cachedPromise = mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Fail fast after 5s
            socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
            bufferCommands: false,          // Disable mongoose buffering
        }).then((mongoose) => {
            console.log(`Connected successfully with ${mongoose.connection.host}`);
            return mongoose;
        });

        await cachedPromise;
    } catch (error) {
        console.error(`Connection failed: ${error instanceof Error ? error.message : error}`);
        cachedPromise = null; // Reset cache on failure
        throw error;
    }
};
