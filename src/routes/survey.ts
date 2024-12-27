import express from "express";
import {
  selectPageView,
  addSurveyPage,
  createSurvey,
  deletePage,
  deleteSurvey,
  editAnonymousResults,
  editFreeUserNames,
  logInSurvey,
  getSurveyProfile,
} from "../controllers/survey";
import {
  getStudentPageStars,
  pushStarsAmount,
  setCurrentPage,
  setSurveyStatus,
} from "../controllers/surveyControl";
import { withAdmin } from "../middleware/withAdmin";

export const router = express.Router();

router.post("/create", createSurvey);
router.post("/fetch", logInSurvey);
router.delete("/delete/:id", withAdmin, deleteSurvey);
router.put("/complete/:surveyId", withAdmin, addSurveyPage);
router.post("/delete-page/:id", withAdmin, deletePage);
router.get("/get-profile", withAdmin, getSurveyProfile);
router.put("/choose-page-view/:id", withAdmin, selectPageView);
router.put("/set-survey-status/:id", withAdmin, setSurveyStatus);
router.put("/edit-freeUserNames/:id", withAdmin, editFreeUserNames);
router.put("/edit-anonymousResults/:id", withAdmin, editAnonymousResults);
router.post("/push-stars/:id", withAdmin, pushStarsAmount);
router.post("/set-current-page/:id", withAdmin, setCurrentPage);
router.get(
  "/get-student-page-stars/:id/:pageId/:studentId",
  withAdmin,
  getStudentPageStars
);
