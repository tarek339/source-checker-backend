import { Request, Response } from "express";
import {
  mongooseErrorHandler,
  Error,
  IPages,
} from "../types/interfaces/interfaces";
import { Survey } from "../models/survey";
import { io } from "../socket";
import { Student } from "../models/student";
require("dotenv").config();

export const setSurveyStatus = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    survey.isStarted = req.body.isStarted;
    if (req.body.pageNum) {
      survey.pageNum = req.body.pageNum;
    }
    if (req.body.expiryDate !== null && !(survey.validUntil instanceof Date)) {
      survey.validUntil = req.body.expiryDate;
    }

    io?.emit("surveyStatusChanged", {
      surveyId: survey._id,
      isStarted: survey.isStarted,
    });

    survey.pageNum = 1;

    if (!survey.isStarted) {
      const students = await Student.find({ surveyId: req.params.id });
      const studentPromise: Promise<any>[] = [];
      students.forEach((student) => {
        if (student.stars > 0) {
          student.participated = true;
          studentPromise.push(student.save());
        }
      });
      await Promise.all(studentPromise);
      io?.emit("isStudentUpdated", {
        isStudentUpdated: true,
      });
    }

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

export const pushStarsAmount = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id);
    const student = await Student.findById(req.body.studentId);

    student.stars = req.body.stars;
    await student.save();

    io?.emit("isStudentUpdated", {
      isStudentUpdated: true,
    });

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
