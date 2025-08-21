import mongoose from "mongoose";

let isConnected = false; // track connection state

export const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing database connection");
    return;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI.");
    throw new Error("Missing MONGO_URI (or MONGODB_URI) environment variable");
  }

  try {
    const mongooseOptions = {};
    if (process.env.MONGO_DB_NAME) {
      mongooseOptions.dbName = process.env.MONGO_DB_NAME;
    }
    const conn = await mongoose.connect(mongoUri, mongooseOptions);

    isConnected = true;
    console.log("✅ MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("MongoDB connection failed!");
  }
};
