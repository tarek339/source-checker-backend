import express from "express";
import {
  fetchSingleStudent,
  fetchStudentSurvey,
  fetchStudentSurveyById,
  fetchStudentSurveyByToken,
  fetchStudents,
  registerStudent,
} from "../controllers/student";
import { withStudent } from "../middleware/withStudent";
import { withAdmin } from "../middleware/withAdmin";

export const router = express.Router();

router.post("/register-free-user-name", registerStudent);
router.get("/fetch-students/:id", withAdmin, fetchStudents);
router.get("/fetch-single-student", withStudent, fetchSingleStudent);
router.get("/fetch-students-survey", withStudent, fetchStudentSurveyByToken);
router.get("/fetch-students-survey/:id", fetchStudentSurveyById);
router.post("/student-join-survey", fetchStudentSurvey);
