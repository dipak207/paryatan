import mongoose from "mongoose";

const globalAny = global as unknown as { mongoose?: typeof mongoose };

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

let cached = globalAny.mongoose;

if (!cached) {
  cached = globalAny.mongoose = { conn: null, promise: null } as any;
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
