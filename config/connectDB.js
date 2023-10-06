import mongoose from "mongoose";

const connectDB = async (url) => {
  try {
    const DB_Options = {
      dbName: "Authen",
    };
    const res = await mongoose.connect(url, DB_Options);
    console.log(" Database Connect Successfully");
  } catch (error) {
    console.log(error);
  }
};

export { connectDB };
