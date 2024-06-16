import express from "express";
import {
  fetchSingleStudent,
  fetchStudents,
  registerUserName,
} from "../controllers/student";

export const router = express.Router();

router.post("/register-free-user-name", registerUserName);
router.get("/fetch-students/:id", fetchStudents);
router.get("/fetch-single-student/:studentId", fetchSingleStudent);
