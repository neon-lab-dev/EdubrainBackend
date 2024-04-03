import express from "express";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
import {
  getAllSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} from "../controllers/submissionController.js";


const router = express.Router();

// Get or create a submission 
router
  .route("/Submission")
  .get(getAllSubmissions)
  .post(isAuthenticated, singleUpload, createSubmission);

// Get, update or delete a submission by ID
router
  .route("/Submission/id/:id")
  .get(getSubmission)
  .put(isAuthenticated, singleUpload, updateSubmission)
  .delete(isAuthenticated, deleteSubmission);

// Get submissions by user ID
router.route("/Submissions/user/:userId").get(getAllSubmissions);

// Get submissions by course ID
router.route("/Submissions/course/:courseId").get(getAllSubmissions);

export default router;
