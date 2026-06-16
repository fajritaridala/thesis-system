import mongoose from "mongoose";
import { DATABASE_URL } from "./env";

const dbConnect = async () => {
  try {
    // DATABASE_URL is validated at startup in config/env.ts
    await mongoose.connect(DATABASE_URL!, {
      dbName: "toefl-verfication-system",
    });
    return Promise.resolve("Connected!");
  } catch (error) {
    return Promise.reject(error);
  }
};

export default dbConnect;
