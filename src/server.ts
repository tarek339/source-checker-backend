import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { router as survey } from "./routes/survey";
import { router as student } from "./routes/student";
import { autoDelete, deleteImages } from "./controllers/surveyActions";
import { Server } from "socket.io";
import http from "http";
import { setIO, setSocket } from "./socket";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.WEB_SERVER_URL,
  },
});
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/survey", survey);
app.use("/student", student);

setInterval(() => {
  autoDelete();
  deleteImages();
}, 1000 * 60 * 60 * 24);

app.get("/", (req, res) => {
  res.send("Backend and DB connected");
});

async function startServer() {
  await mongoose.connect(process.env.DB_CONNECT!);
  server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
  io.on("connection", (socket) => {
    setSocket(socket);
    setIO(io);
  });
}

startServer();
