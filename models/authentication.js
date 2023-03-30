const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    trim: true,
    unique: true,
    require: true,
  },
});

module.exports = mongoose.model("User", userSchema);
