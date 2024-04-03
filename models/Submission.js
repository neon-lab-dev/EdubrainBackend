import mongoose from "mongoose";

const schema = new mongoose.Schema({
  lectureId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  solution: {
    base64: {
      type: String,
      required: true,
    },
  },
});

export const Submission = mongoose.model("Submission", schema);