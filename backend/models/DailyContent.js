const mongoose = require('mongoose');

const dailyContentSchema = new mongoose.Schema({
  date: { type: String, required: true },
  game: { type: String, required: true },
  difficulty: { type: String, default: null },
  content: { type: mongoose.Mixed, required: true }, // Mixed for flexibility (string or array)
}, { collection: 'dailycontent' }); // Explicit collection name

module.exports = mongoose.model('DailyContent', dailyContentSchema);