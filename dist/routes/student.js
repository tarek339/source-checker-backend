"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const student_1 = require("../controllers/student");
exports.router = express_1.default.Router();
exports.router.post("/register-free-user-name", student_1.registerUserName);
exports.router.get("/fetch-students/:id", student_1.fetchStudents);
exports.router.get("/fetch-single-student/:studentId", student_1.fetchSingleStudent);
