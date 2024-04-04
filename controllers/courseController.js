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

  const file = req.files["file"][0];
  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
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

  const file = req.files["file"][0];
  // const assignment = req.files["pdf"] ? req.files["pdf"][0] : null;
  const fileUri = getDataUri(file);
  // const assignmentUri = assignment ? getDataUri(assignment) : null;
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });
  // const myCloudAssignment = await cloudinary.v2.uploader.upload(
  //   assignmentUri ? assignmentUri.content : null
  // );
  course.lectures.push({
    title,
    description,
    videos: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    // assignment: {
    //   public_id: myCloudAssignment
    //     ? myCloudAssignment.public_id
    //     : "No Assignment",
    //   url: myCloudAssignment ? myCloudAssignment.secure_url : "No Assignment",
    // },
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

  if (req.files && req.files["file"]) {
    const file = req.files["file"][0];
    const fileUri = getDataUri(file);
    await cloudinary.v2.uploader.destroy(lecture.videos.public_id, {
      resource_type: "video",
    });
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "video",
    });
    lecture.videos = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  // if (req.files && req.files["pdf"]) {
  //   const assignment = req.files["pdf"][0];
  //   const assignmentUri = getDataUri(assignment);
  // const myCloud = await cloudinary.v2.uploader.upload(assignmentUri.content);
  // await cloudinary.v2.uploader.destroy(lecture.assignment.public_id);
  //   lecture.assignment = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  //   };
  // }

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

  if (req.files && req.files["file"]) {
    const file = req.files["file"][0];
    const fileUri = getDataUri(file);
    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    course.poster = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  title ? (course.title = title) : null;
  description ? (course.description = description) : null;
  category ? (course.category = category) : null;
  createdBy ? (course.createdBy = createdBy) : null;

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

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.videos.public_id, {
      resource_type: "video",
    });
  }

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
  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) return item;
  });

  await cloudinary.v2.uploader.destroy(lecture.videos.public_id, {
    resource_type: "video",
  });
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
