import express from "express";
import {
  addLecture,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
  updateLecture,
  updateCourse,
} from "../controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";

import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//get all course
router.route("/courses").get(getAllCourses);

//create course
router
  .route("/createcourse")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

//Add, Update lecture Delete Course, get course deatils
router
  .route("/course/:id")
  .get(getCourseLectures)
  .post(isAuthenticated, authorizeAdmin, singleUpload, addLecture)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse)
  .put(isAuthenticated, authorizeAdmin, singleUpload, updateCourse);

router
.route("/lecture")
.delete(isAuthenticated, authorizeAdmin, deleteLecture)
.put(isAuthenticated, authorizeAdmin, singleUpload, updateLecture);
export default router;
