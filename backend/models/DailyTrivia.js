const mongoose = require('mongoose');

const dailyContentSchema = new mongoose.Schema({
  date: { type: String, required: true }, // e.g., "2025-02-23"
  game: { type: String, required: true }, // "wordle", "hangman", "trivia"
  difficulty: { type: String }, // "Easy", "Medium", "Hard" (null for Wordle/Trivia)
  content: { type: mongoose.Mixed, required: true }, // String for words, Array for trivia questions
});

module.exports = mongoose.model('DailyContent', dailyContentSchema);