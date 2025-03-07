import { Request, Response } from "express";
import { Student } from "../models/student";
import { mongooseErrorHandler, Error } from "../types/interfaces/interfaces";
import { Survey } from "../models/survey";
import jwt from "jsonwebtoken";
import { io } from "../socket";

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const studentExists = await Student.findOne({
      freeUserName: req.body.freeUserName.toLowerCase(),
      participated: false,
      surveyId: req.body.surveyId,
    });

    if (studentExists) {
      res.status(401).json({
        errorMessage: "User existiert bereits",
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

    const token = jwt.sign(
      {
        studentId: student._id,
      },
      process.env.SECRET_TOKEN!,
      {
        expiresIn: "1d",
      }
    );

    await student.save();

    res.json({ message: "user name created", student, token });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchSingleStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.body.studentId);

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
    if (!req.body.surveyId) {
      res.status(401).json({
        errorMessage: "Pflichtfeld",
      });
      return;
    }

    const survey = await Survey.findOne({ surveyId: req.body.surveyId }).select(
      "-surveyPin"
    );

    if (!survey) {
      res.status(401).json({
        errorMessage: "Umfage nicht gefunden",
      });
      return;
    }
    if (survey.pages.length === 0) {
      res.status(401).json({
        errorMessage: "Umfrage nicht vollständig",
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

export const fetchStudentSurveyByToken = async (
  req: Request,
  res: Response
) => {
  try {
    const student = await Student.findOne({ _id: req.body.studentId });
    const survey = await Survey.findById(student.surveyId).select("-surveyPin");
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
    res.json({
      survey,
    });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchStudentSurveyById = async (req: Request, res: Response) => {
  try {
    const survey = await Survey.findById(req.params.id).select("-surveyPin");

    res.json({
      survey,
    });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};
