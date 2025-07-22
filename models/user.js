const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  reputation: {
    given: { type: Number, default: 0 },
    received: { type: Number, default: 0 },
    timestamp: { type: Date }
  }
});

module.exports = mongoose.model('User', userSchema);
