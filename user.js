const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  googleId: String,
});

module.exports = mongoose.model('User', UserSchema);
