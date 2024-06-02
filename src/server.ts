import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { router as survey } from "./routes/survey";
import { autoDelete } from "./controllers/surveyActions";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/survey", survey);

setTimeout(() => {
  autoDelete();
}, 1000 * 60 * 60 * 24);

const connect = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT!);
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
    app.get("/", (req, res) => {
      res.send("Backend and DB connected");
    });
  } catch (error) {
    console.log("404 connection Error! Not able to connect with Data base!");
  }
};

connect();
