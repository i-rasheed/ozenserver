const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  businessname: { type: String, required: true },
  businesstype: { type: String, required: true },
  businessno : { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  imgCollection: {
    type: Array
},
  userId: {type: String, required: true}
});

module.exports = Business = mongoose.model("business", businessSchema);


