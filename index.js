import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import userRoute from "./routes/userRoutes.js";

dotenv.config();
const app = express();

const port = process.env.PORT;
const database_url = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json());

connectDB(database_url);

app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
