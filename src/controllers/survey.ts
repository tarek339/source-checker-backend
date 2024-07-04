import { Request, Response } from "express";
import {
  mongooseErrorHandler,
  Error,
  IPages,
} from "../types/interfaces/interfaces";
import { Survey } from "../models/survey";
import { captureScreenshot } from "../lib/screenshot";
import { uploadImg } from "../lib/upload";
import { v4 as uuid } from "uuid";

import { scrapOpenGraph } from "../lib/scrapOpenGraph";
import { io } from "../socket";
import { Student } from "../models/student";

export const createSurvey = async (req: Request, res: Response) => {
  try {
    const survey = new Survey({
      anonymousResults: req.body.anonymousResults,
      freeUserNames: req.body.freeUserNames,
      selectedSurveysOption: req.body.selectedSurveysOption,
      selectedResultsOption: req.body.selectedResultsOption,
      surveyId: Math.floor(100000 + Math.random() * 900000),
      surveyPin: Math.floor(100000 + Math.random() * 900000),
      link: "",
      surveyNumber: Math.floor(1000 + Math.random() * 9000),
    });

    await Survey.findById(survey._id);
    survey.link = `${process.env.CLIENT_URL}/register-student/${survey._id}`;
    await survey.save();

    await survey.save();

    res.json({
      message: "survey created",
      survey: {
        _id: survey._id,
        anonymousResults: survey.anonymousResults,
        freeUserNames: survey.freeUserNames,
        selectedSurveysOption: survey.selectedSurveysOption,
        selectedResultsOption: survey.selectedResultsOption,
        surveyId: survey.surveyId,
        surveyPin: survey.surveyPin,
        link: survey.link,
        surveyNumber: survey.surveyNumber,
      },
    });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const completeSurvey = async (req: Request, res: Response) => {
  const survey = await Survey.findOne({ surveyId: req.params.surveyId });
  try {
    const mobileContent = await captureScreenshot(
      {
        width: 425,
        height: 1000,
      },
      req.body.page.url
    );
    const desktopContent = await captureScreenshot(
      {
        width: 1024,
        height: 1300,
      },
      req.body.page.url
    );

    const mobileScreenshot = uploadImg(
      mobileContent as Buffer,
      uuid() + ".jpg"
    );
    const desktopScreenshot = uploadImg(
      desktopContent as Buffer,
      uuid() + ".jpg"
    );

    req.body.page.mobileScreenshot = mobileScreenshot
      .replace(process.env.ROOT_TO_DIRECTORY!, "")
      .replace("-", "/");
    req.body.page.desktopScreenshot = desktopScreenshot
      .replace(process.env.ROOT_TO_DIRECTORY!, "")
      .replace("-", "/");

    const openGraphData = await scrapOpenGraph(req.body.page.url);
    req.body.page.openGraph = openGraphData;

    survey.pages.push(req.body.page);
    await survey.save();

    res.json({
      message: "screenshots and open graph data successfully created",
      survey,
    });
  } catch (error) {
    console.log(
      "Capture screenshot timeoutError: Navigation timeout of 30000 ms exceeded. Creating open graph data only."
    );
    try {
      const openGraphData = await scrapOpenGraph(req.body.page.url);
      req.body.page.openGraph = openGraphData;
      survey.pages.push(req.body.page);
      await survey.save();
      res.json({
        message:
          "Unable to caputure screenshots for this website. Created open graph data only.",
        survey,
      });
    } catch (error) {
      console.log(
        "Unable to create screeshots and open graph data. Please try another website!"
      );
      res.status(422).json({
        message:
          "Unable to create screeshots and open graph data. Please try another website!",
      });
    }
  }
};

export const choosePageView = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    const foundPage: IPages = survey.pages.find(
      (page: { _id: string }) => String(page._id) === req.body.pageID
    );
    foundPage.isMobileView = req.body.isMobileView;
    foundPage.isOpenGraphView = req.body.openGraphView;
    await survey.save();
    res.json({
      message: "page view choosed",
      survey,
    });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchSurvey = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findOne({
      surveyId: req.body.surveyId,
      surveyPin: req.body.surveyPin,
    });

    if (!survey) {
      res.status(401).json({
        errorMessage: "Wrong ID or PIN",
      });
      return;
    }

    res.json({
      survey,
    });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const deleteSurvey = async (req: Request, res: Response) => {
  try {
    await Survey.findByIdAndDelete(req.params.id);
    const survey = await Survey.find();

    res.json({
      message: "survey deleted",
      survey,
    });
  } catch (err) {
    res.status(422).json({
      message: mongooseErrorHandler(err as Error),
    });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findOne({ "pages._id": req.params.id });

    survey.pages = survey.pages.filter((page: any, i: number) => {
      return page._id != req.params.id;
    });

    await survey.save();

    res.json({
      message: "page deleted",
    });
  } catch (err) {
    res.status(422).json({
      message: mongooseErrorHandler(err as Error),
    });
  }
};

export const getSurveyProfile = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (survey) {
      io?.emit("surveyStatusChanged", {
        surveyId: survey._id,
        isStarted: survey.isStarted,
      });
      io?.emit("surveyPageNumber", {
        surveyId: survey._id,
        pageNum: survey.pageNum,
      });
    }
    res.json({ survey });
  } catch (error) {
    console.log(error);
  }
};

export const setSurveyStatus = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    survey.isStarted = req.body.isStarted;
    if (req.body.pageNum) {
      survey.pageNum = req.body.pageNum;
    }

    io?.emit("surveyStatusChanged", {
      surveyId: survey._id,
      isStarted: survey.isStarted,
    });

    survey.pageNum = 1;
    await survey.save();
    res.json({ survey });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const setCurrentPage = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    survey.pageNum = req.body.pageNum;

    io?.emit("surveyPageNumber", {
      surveyId: survey._id,
      pageNum: survey.pageNum,
    });

    await survey.save();
    res.json({ message: "current page set", survey });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const pushStarsToArray = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    const student = await Student.findById(req.body.studentId);

    survey.pages.forEach((page: IPages) => {
      if (String(page._id) === req.body.pageId) {
        const foundEqual = page.starsArray.find(
          (starsObj: { studentId: string; stars: number }) => {
            return starsObj.studentId === req.body.studentId;
          }
        );
        if (!foundEqual) {
          page.starsArray.push({
            studentId: req.body.studentId,
            userName: student.freeUserName,
            userNumber: student.userNumber,
            stars: req.body.stars,
          });
        }
      }
    });

    await survey.save();

    res.json({
      message: "stars added",
      survey,
    });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const getStudentPageStars = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);

    let studentStars: number | undefined = 0;
    survey.pages.map((page: IPages) => {
      if (String(page._id) === req.params.pageId) {
        const findStars = page.starsArray.find((obj) => {
          return obj.studentId === req.params.studentId;
        });
        studentStars = findStars?.stars;
      }
    });

    res.json(studentStars);
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};
