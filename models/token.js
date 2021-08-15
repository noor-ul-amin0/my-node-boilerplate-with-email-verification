const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Types.ObjectId,
    required: [true, "user id is required."],
    ref: "User",
  },
  token: { type: String, required: [true, "token is required."] },
  createdAt: {
    type: Date,
    default: Date.now,
    // expires: 600000,
    index: { expires: 3600 },
  },
});

module.exports = mongoose.model("token", tokenSchema);
