import { Request, Response } from "express";
import { mongooseErrorHandler, Error } from "../types/interfaces/interfaces";
import { Survey } from "../models/survey";

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
    survey.link = `https//quellenchecker/${survey._id}.de`;
    await survey.save();

    // const surveys = await Survey.find();
    // const surveyNumber = surveys.findIndex(
    //   (survey) => survey.surveyNumber === null
    // );
    // if (surveyNumber !== -1) {
    //   survey.surveyNumber = surveyNumber + 1;
    // }
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
  try {
    const survey = await Survey.findOne({ surveyId: req.params.surveyId });
    survey.pages.push(req.body.page);
    await survey.save();

    res.json({
      message: "survey completed",
      survey,
    });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const editSinglePage = async (req: Request, res: Response) => {
  const survey = await Survey.findById(req.params.id);
  console.log(survey);
  // loop find page id and edit isMobile to true or true as requested
  // res survey
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
    res.json(survey);
  } catch (error) {
    console.log(error);
  }
};

export const getStudentsSurvey = async (req: Request, res: Response) => {
  try {
    console.log("first");

    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      res.status(401).json({
        errorMessage: "ID not registered",
      });
      return;
    }
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};
