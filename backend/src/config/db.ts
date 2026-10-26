import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(uri: string = env.MONGODB_URI) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000, // 10 seconds
  });
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
