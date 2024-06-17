"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const survey_1 = require("./routes/survey");
const student_1 = require("./routes/student");
const surveyActions_1 = require("./controllers/surveyActions");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
});
const port = process.env.PORT;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/survey", survey_1.router);
app.use("/student", student_1.router);
setInterval(() => {
    (0, surveyActions_1.autoDelete)();
}, 1000 * 60 * 60 * 24);
app.get("/", (req, res) => {
    res.send("Backend and DB connected");
});
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.DB_CONNECT);
        server.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
        io.on("connection", (socket) => {
            (0, socket_1.setSocket)(socket);
            (0, socket_1.setIO)(io);
        });
    });
}
startServer();
