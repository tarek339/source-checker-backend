import express from "express";
import {
  fetchSingleStudent,
  fetchStudentStatus,
  fetchStudentSurvey,
  fetchStudents,
  registerUserName,
} from "../controllers/student";

export const router = express.Router();

router.post("/register-free-user-name", registerUserName);
router.get("/fetch-students/:id", fetchStudents);
router.get("/fetch-single-student/:studentId", fetchSingleStudent);
router.post("/student-join-survey", fetchStudentSurvey);
router.get("/get-student-status/:studentId", fetchStudentStatus);
