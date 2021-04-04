const mongoose = require('mongoose');

const tempSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: Date,
  time: [{
    type: String
}],
  temperature: [{
    type: Number
}],
  max: Number,
  min: Number
});

module.exports = mongoose.model('Temperature',tempSchema);
