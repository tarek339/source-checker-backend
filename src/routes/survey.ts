import express from "express";
import {
  choosePageView,
  completeSurvey,
  createSurvey,
  deletePage,
  deleteSurvey,
  editAnonymousResults,
  editFreeUserNames,
  fetchSurvey,
  getSurveyProfile,
} from "../controllers/survey";
import {
  getStudentPageStars,
  pushStarsAmount,
  setCurrentPage,
  setSurveyStatus,
} from "../controllers/surveyControl";

export const router = express.Router();

router.post("/create", createSurvey);
router.post("/fetch", fetchSurvey);
router.delete("/delete/:id", deleteSurvey);
router.put("/complete/:surveyId", completeSurvey);
router.post("/delete-page/:id", deletePage);
router.get("/get-profile/:id", getSurveyProfile);
router.put("/choose-page-view/:id", choosePageView);
router.put("/set-survey-status/:id", setSurveyStatus);
router.put("/edit-freeUserNames/:id", editFreeUserNames);
router.put("/edit-anonymousResults/:id", editAnonymousResults);
router.post("/push-stars/:id", pushStarsAmount);
router.post("/set-current-page/:id", setCurrentPage);
router.get(
  "/get-student-page-stars/:id/:pageId/:studentId",
  getStudentPageStars
);
