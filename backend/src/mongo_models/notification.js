import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user_id: Number,
  message: String,
  status: { type: String, default: "unread" },
  created_at: { type: Date, default: Date.now },
});
export const Notification = mongoose.model("Notification", schema);
