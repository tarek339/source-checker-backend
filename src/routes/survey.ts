import express from "express";
import {
  selectPageView,
  addSurveyPage,
  createNewSurvey,
  deleteSurveyPage,
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

router.post("/create-new-survey", createNewSurvey);
router.post("/log-in-survey", logInSurvey);
router.delete("/delete-survey/:id", withAdmin, deleteSurvey);
router.put("/add-page-to-survey/:surveyId", withAdmin, addSurveyPage);
router.post("/delete-survey-page/:id", withAdmin, deleteSurveyPage);
router.get("/get-survey-profile", withAdmin, getSurveyProfile);
router.put("/choose-page-view/:id", withAdmin, selectPageView);
router.put("/set-survey-status/:id", withAdmin, setSurveyStatus);
router.put("/edit-free-user-names/:id", withAdmin, editFreeUserNames);
router.put("/edit-anonymous-results/:id", withAdmin, editAnonymousResults);
router.post("/push-stars/:id", withAdmin, pushStarsAmount);
router.post("/set-current-page/:id", withAdmin, setCurrentPage);
router.get(
  "/get-student-page-stars/:id/:pageId/:studentId",
  withAdmin,
  getStudentPageStars
);
