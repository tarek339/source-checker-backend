import { Request, Response } from "express";
import { Student } from "../models/student";
import { mongooseErrorHandler, Error } from "../types/interfaces/interfaces";
import { Survey } from "../models/survey";
import { io } from "../socket";

export const registerUserName = async (req: Request, res: Response) => {
  try {
    const studentExists = await Student.findOne({
      freeUserName: req.body.freeUserName.toLowerCase(),
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

    io?.emit("fetchStudent", {
      student: student,
    });

    res.json({ student });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchStudentStatus = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.studentId);

    io?.emit("fetchStudentStatus", {
      stars: student.stars,
      participated: student.participated,
    });

    res.json({ stars: student.stars, participated: student.participated });
  } catch (error) {
    res.status(422).json({
      message: mongooseErrorHandler(error as Error),
    });
  }
};

export const fetchStudents = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ surveyId: req.params.id });
    io?.emit("fetchStudents", {
      students: students,
    });
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
