import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user_id: String,
  action: String,
  timestamp: { type: Date, default: Date.now },
  details: Object,
});
export const VolunteerLog = mongoose.model("VolunteerLog", schema);
