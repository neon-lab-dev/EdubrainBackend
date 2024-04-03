import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

//get all  course--user
export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find().select("-lectures");
  res.status(200).json({
    success: true,
    courses,
  });
});

//create course
export const createCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("Please add all fields", 400));

  const file = req.files['file'][0];;
  const fileUri = getDataUri(file);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      base64: fileUri.content,
    },
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully. you can add lectures now",
  });
});

//get course lecture
export const getCourseLectures = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Course not found", 404));

  course.views += 1;

  await course.save();

  res.status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

//add lecture(max video size 100MB)
export const addLecture = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  //const file = req.file;

  const course = await Course.findById(id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  const file = req.files['file'][0];
  const assignment = req.files['pdf']?req.files['pdf'][0]:null;
  const fileUri = getDataUri(file);
  const assignmentUri = assignment?getDataUri(assignment):null;

  course.lectures.push({
    title,
    description,
    videos: {
      base64: fileUri.content,
    },
    assignment: {
      base64: assignmentUri? assignmentUri.content:"No Assignment",
    },
  });

  course.numOfVideos = course.lectures.length;
  await course.save();

  res.status(200).json({
    success: true,
    message: "Lectures added in Course",
  });
});

// update lecture
export const updateLecture = catchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;
  const { title, description } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) return item;
  });

  // Update lecture with new data..
  if (title) {
    lecture.title = title;
  }

  if (description) {
    lecture.description = description;
  }

  if (req.files && req.files['file']) {
    const file = req.files['file'][0];
    const fileUri = getDataUri(file);
    lecture.videos = {
      base64: fileUri.content,
    };
  }

  if (req.files && req.files['pdf']) {
    const assignment = req.files['pdf'][0];
    const assignmentUri = getDataUri(assignment);
    lecture.assignment = {
      base64: assignmentUri.content,
    };
  }

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture updated successfully",
  });
});

//update course
export const updateCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, category, createdBy } = req.body;

  const course = await Course.findById(id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  if (req.files && req.files['file']) {
    const file = req.files['file'][0];
    const fileUri = getDataUri(file);
    course.poster = {
      base64: fileUri.content,
    };
  }

  title?(course.title = title):null;
  description?(course.description = description):null;
  category?(course.category = category):null;
  createdBy?(course.createdBy = createdBy):null;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
  });
});

//delete course
export const deleteCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

//delete lecture
export const deleteLecture = catchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;

  const course = await Course.findById(courseId);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  course.lectures = course.lectures.filter((item) => {
    if (item._id.toString() !== lectureId.toString()) return item;
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture deleted successfully",
  });
});
