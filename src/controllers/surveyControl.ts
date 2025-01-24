import { Request, Response } from "express";
import {
  mongooseErrorHandler,
  Error,
  IPages,
  StudentStars,
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

    // to add summary of student who did not participate
    if (!survey.isStarted) {
      const findStudent = await Student.find({
        surveyId: req.params.id,
        participated: false,
        stars: 0,
      });

      findStudent.forEach((student) => {
        survey.pages.forEach((page: IPages) => {
          page.starsArray.push({
            studentId: student._id,
            userName: student.freeUserName,
            userNumber: student.userNumber,
            stars: 0,
            participated: true,
          });
        });
      });

      findStudent.forEach((student) => {
        student.participated = true;
        student.save();
      });
    }

    if (!survey.isStarted) {
      // Check starsArray if it has student values
      survey.pages.forEach((page: IPages, pageIndex: number) => {
        if (page.starsArray.length === 0 && pageIndex > 0) {
          // If the page has no student values and it's not the first page, add the student values from the first page
          survey.pages[0].starsArray.forEach(
            (student: {
              studentId: string;
              userName: string;
              userNumber: string;
            }) => {
              page.starsArray.push({
                studentId: student.studentId,
                userName: student.userName,
                userNumber: student.userNumber,
                stars: 0,
                participated: true,
              });
            }
          );
        }
      });
    }

    if (!survey.isStarted) {
      ensureEqualStarsArrayLength(survey.pages);
    }

    function ensureEqualStarsArrayLength(pages: IPages[]) {
      const studentMap: { [key: string]: any } = {};

      // Collect all unique studentIds and their corresponding objects
      pages.forEach((page) => {
        page.starsArray.forEach((student: StudentStars) => {
          if (!studentMap[student.studentId]) {
            studentMap[student.studentId] = {
              studentId: student.studentId,
              userName: student.userName,
              userNumber: student.userNumber,
              stars: 0,
              participated: true,
            };
          }
        });
      });

      // Ensure all pages have the same length and contain the same objects
      pages.forEach((page) => {
        const existingStudentIds = page.starsArray.map(
          (student: StudentStars) => student.studentId
        );
        const missingStudents = Object.keys(studentMap).filter(
          (studentId) => !existingStudentIds.includes(studentId)
        );

        missingStudents.forEach((studentId) => {
          page.starsArray.push({ ...studentMap[studentId] });
        });
      });
    }

    // to delete the previous starsArray
    if (survey.isStarted) {
      survey.pages.forEach((page: IPages) => {
        page.starsArray = page.starsArray.filter(
          (obj) => obj.participated !== true
        );
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
            participated: true,
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
