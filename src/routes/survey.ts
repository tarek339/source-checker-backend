import express from "express";
import {
  choosePageView,
  completeSurvey,
  createSurvey,
  deletePage,
  deleteSurvey,
  fetchSurvey,
  getStudentPageStars,
  getSurveyProfile,
  pushStarsAmount,
  setCurrentPage,
  setSurveyStatus,
} from "../controllers/survey";

export const router = express.Router();

router.post("/create", createSurvey);
router.post("/fetch", fetchSurvey);
router.delete("/delete/:id", deleteSurvey);
router.put("/complete/:surveyId", completeSurvey);
router.post("/delete-page/:id", deletePage);
router.get("/get-profile/:id", getSurveyProfile);
router.put("/choose-page-view/:id", choosePageView);
router.put("/set-survey-status/:id", setSurveyStatus);
router.post("/push-stars/:id", pushStarsAmount);
router.post("/set-current-page/:id", setCurrentPage);
router.get(
  "/get-student-page-stars/:id/:pageId/:studentId",
  getStudentPageStars
);
