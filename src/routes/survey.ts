import express from "express";
import {
  choosePageView,
  completeSurvey,
  createSurvey,
  deletePage,
  deleteSurvey,
  editSinglePage,
  fetchSurvey,
  getStudentsSurvey,
  getSurveyProfile,
} from "../controllers/survey";

export const router = express.Router();

router.post("/create", createSurvey);
router.post("/fetch", fetchSurvey);
router.delete("/delete/:id", deleteSurvey);
router.put("/complete/:surveyId", completeSurvey);
router.post("/delete-page/:id", deletePage);
router.get("/get-profile/:id", getSurveyProfile);
router.post("/students-survey", getStudentsSurvey);
router.put("/choose-page-view/:id", choosePageView);
router.put("/edit-single-page/:id", editSinglePage);
