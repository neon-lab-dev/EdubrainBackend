import { Submission } from "../models/Submission.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

// Get all submissions or filter by user ID or course ID
export const getAllSubmissions = catchAsyncError(async (req, res, next) => {
  const { userId, courseId } = req.params;
  let query = {};
  if (userId) {
    query.userId = userId;
  }
  if (courseId) {
    query.courseId = courseId;
  }
  const submissions = await Submission.find(query);
  res.status(200).json(submissions);
});

// Get a submission by ID
export const getSubmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const submission = await Submission.findById(id);
  if (!submission) {
    return next(new ErrorHandler("Submission not found", 404));
  }
  res.status(200).json(submission);
});

// Create a new submission
export const createSubmission = catchAsyncError(async (req, res, next) => {
  const { lectureId, userId, courseId } = req.body;
  const file = req.files['file'][0];
  const fileUri = getDataUri(file);
  const solution = {
    base64: fileUri.content,
  };
  const newSubmission = new Submission({
    lectureId,
    userId,
    courseId,
    solution,
  });
  const savedSubmission = await newSubmission.save();
  res.status(201).json({ message: "Submission created successfully" });
});

// Update a submission by ID
export const updateSubmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const file = req.files['file'][0];
  const fileUri = getDataUri(file);
  const solution = {
    base64: fileUri.content,
  };
  await Submission.findByIdAndUpdate(id, {
    solution,
  });
  res.status(200).json({ message: "Submission updated successfully" });
});

// Delete a submission by ID
export const deleteSubmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const submission = await Submission.findByIdAndDelete(id);
  if (!submission) {
    return next(new ErrorHandler("Submission not found", 404));
  }
  res.status(200).json({ message: "Submission deleted successfully" });
});
