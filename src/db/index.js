import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}practice`
    );
    isConnected = !!connectionInstance.connections[0].readyState;
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
  }
};

export default connectDB;