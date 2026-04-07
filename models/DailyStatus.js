const mongoose = require("mongoose");

const DailySchema = new mongoose.Schema({
  user: String,
  lastOpened: String   // YYYY-MM-DD
});

module.exports = mongoose.model("DailyStatus", DailySchema);