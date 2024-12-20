import { Request, Response } from "express";
import { Student } from "../models/student";
import { mongooseErrorHandler, Error } from "../types/interfaces/interfaces";
import { Survey } from "../models/survey";

export const registerUserName = async (req: Request, res: Response) => {
  try {
    const studentExists = await Student.findOne({
      freeUserName: req.body.freeUserName.toLowerCase(),
      participated: false,
      surveyId: req.body.surveyId,
    });
    if (studentExists) {
      res.status(401).json({
        errorMessage: "student allready exists",
      });
      return;
    }

    const student = new Student({
      surveyId: req.body.surveyId,
      freeUserName:
        req.body.freeUserName === ""
          ? null
          : req.body.freeUserName.toLowerCase(),
      userNumber: Math.floor(1000 + Math.random() * 9000),
      isNameRegistered: true,
    });

    await student.save();

    res.json({ message: "user name created", student });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchSingleStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.studentId);

    res.json({ student });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ surveyId: req.params.id });

    res.json({ students });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchStudentSurvey = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findOne({ surveyId: req.body.surveyId });

    if (!survey) {
      res.status(401).json({
        errorMessage: "Wrong ID",
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
