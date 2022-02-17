const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, minlength: 5 },
  password: { type: String },
  phonenumber: { type: String },
  status: {
    type: String, 
    enum: ['Pending', 'Active'],
    default: 'Pending'
  },
  confirmationCode: {
    type: String, 
    unique: true 
  },
    role : {
      type: 'String',
      enum: ['admin', 'basic'],
      default: 'basic'
    }
});

module.exports = User = mongoose.model("user", userSchema);
