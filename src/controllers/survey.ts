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
import fs from "fs";
import path from "path";
require("dotenv").config();

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
    survey.link = `${process.env.WEB_SERVER_URL}/register-student/${survey._id}`;
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

export const editFreeUserNames = async (req: Request, res: Response) => {
  try {
    console.log("first");
    const survey = await Survey.findById(req.params.id);
    console.log("survey", survey);
    console.log(req.body.freeUserNames);
    survey.freeUserNames = req.body.freeUserNames;

    await survey.save();

    res.json({
      message: "free user names changed",
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
export const editAnonymousResults = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    survey.anonymousResults = req.body.anonymousResults;

    await survey.save();

    res.json({
      message: "anonymous results changed",
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
  let newUrl = req.body.page.url;
  const survey = await Survey.findOne({ surveyId: req.params.surveyId });
  try {
    if (
      req.body.page.url.startsWith("http://") &&
      req.body.page.url.includes("www.")
    ) {
      newUrl = req.body.page.url.replace("http://", `https://`);
    }
    if (
      req.body.page.url.startsWith("www.") &&
      !req.body.page.url.startsWith("http://")
    ) {
      newUrl = req.body.page.url.replace("www.", `https://www.`);
    }
    const mobileContent = await captureScreenshot(
      {
        width: 425,
        height: 1000,
      },
      newUrl
    );
    const desktopContent = await captureScreenshot(
      {
        width: 1024,
        height: 1300,
      },
      newUrl
    );

    const mobileScreenshot = uploadImg(
      mobileContent as Buffer,
      uuid() + ".jpg"
    );
    const desktopScreenshot = uploadImg(
      desktopContent as Buffer,
      uuid() + ".jpg"
    );

    req.body.page.mobileScreenshot = mobileScreenshot.replace(
      process.env.ROOT_TO_DIRECTORY!,
      process.env.WEB_SERVER_URL! + "/images/"
    );
    req.body.page.desktopScreenshot = desktopScreenshot.replace(
      process.env.ROOT_TO_DIRECTORY!,
      process.env.WEB_SERVER_URL! + "/images/"
    );

    const openGraphData = await scrapOpenGraph(newUrl);
    req.body.page.openGraph = openGraphData;

    survey.pages.push(req.body.page);

    await survey.save();

    res.json({
      message: "screenshots and open graph data successfully created",
      survey,
    });
  } catch (error) {
    console.log("TimeoutError: Navigation timeout of 30000 ms exceeded");
    try {
      const openGraphData = await scrapOpenGraph(newUrl);
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
        "Unable to create screeshots and open graph data. Please try another website!",
        error
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
    foundPage.isSelectedView = true;
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
    const survey = await Survey.findById(req.params.id);

    survey?.pages.forEach((page: IPages) => {
      const filePath = process.env.ROOT_TO_DIRECTORY;
      const files = fs.readdirSync(filePath!);
      files.forEach((file) => {
        const fullPath = path.join(filePath!, file);
        if (page.mobileScreenshot.includes(file)) {
          fs.promises.unlink(fullPath);
        }
        if (page.desktopScreenshot.includes(file)) {
          fs.promises.unlink(fullPath);
        }
      });
    });

    const students = await Student.find({ surveyId: req.params.id });

    for (const student of students) {
      await Student.deleteOne({ _id: student._id });
    }

    await Survey.findByIdAndDelete(req.params.id);

    res.json({
      message: "survey deleted",
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

    survey.pageNum = 1;

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
