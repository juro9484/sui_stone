const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  scores: [{
    game: { type: String, required: true }, // "hangman", "wordle", "trivia"
    points: { type: Number, required: true },
    time: { type: Number, required: true }, // Time in seconds
    date: { type: Date, default: Date.now } // Still track when saved
  }]
});

module.exports = mongoose.model('Player', playerSchema);