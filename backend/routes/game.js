const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// MongoDB Schemas
const dailyContentSchema = new mongoose.Schema({
  date: String,
  game: String,
  content: String,
});
const DailyContent = mongoose.model('DailyContent', dailyContentSchema);

const playerSchema = new mongoose.Schema({
  username: String,
  scores: [{
    game: String,
    points: Number,
    time: Number,
    date: Date,
  }],
});
const Player = mongoose.model('Player', playerSchema);

const hasPlayedToday = async (username, game) => {
  if (!mongoose.connection.readyState) {
    console.log('MongoDB not connected, assuming not played today');
    return false;
  }
  const today = new Date().toISOString().split('T')[0];
  const player = await Player.findOne({ username });
  if (!player) return false;
  return player.scores.some(score => 
    score.game === game && 
    score.date.toISOString().split('T')[0] === today
  );
};

const regenerateDailyWords = async () => {
  console.log('Regenerating daily words...');
  if (!mongoose.connection.readyState) {
    console.log('MongoDB not connected, skipping regeneration');
    return;
  }
  const today = new Date().toISOString().split('T')[0];

  const generateGameWord = async (game, words) => {
    const existing = await DailyContent.findOne({ date: today, game });
    if (existing) return;
    const word = words[Math.floor(Math.random() * words.length)];
    const newDailyContent = new DailyContent({ date: today, game, content: word });
    await newDailyContent.save();
  };

  await generateGameWord('hangman', ['CRYPTO', 'SUISTONE', 'GROK', 'MINES', 'LEDGER']);
  await generateGameWord('wordle', ['STONE', 'CRYPT', 'RELIC', 'GROVE', 'CHASM']);
  await generateGameWord('higherlower', ['HIGHERLOWER_PLACEHOLDER']);
  // Add trivia, minehunter as needed
};

router.get('/daily-word/hangman', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    if (await hasPlayedToday(username, 'hangman')) {
      return res.status(403).json({ error: 'You have already played Hangman today' });
    }
    if (!mongoose.connection.readyState) {
      return res.status(200).json({ word: 'GROK' }); // Fallback word
    }
    await regenerateDailyWords();
    const doc = await DailyContent.findOne({ date: today, game: 'hangman' });
    if (!doc) return res.status(404).json({ error: 'No word found for today' });
    res.status(200).json({ word: doc.content });
  } catch (err) {
    console.error('Error fetching hangman word:', err.message);
    res.status(500).json({ error: 'Failed to fetch word from MongoDB, check backend!' });
  }
});

router.get('/daily-word/wordle', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    if (await hasPlayedToday(username, 'wordle')) {
      return res.status(403).json({ error: 'You have already played Wordle today' });
    }
    if (!mongoose.connection.readyState) {
      return res.status(200).json({ word: 'STONE' }); // Fallback word
    }
    await regenerateDailyWords();
    const doc = await DailyContent.findOne({ date: today, game: 'wordle' });
    if (!doc) return res.status(404).json({ error: 'No word found for today' });
    res.status(200).json({ word: doc.content });
  } catch (err) {
    console.error('Error fetching wordle word:', err.message);
    res.status(500).json({ error: 'Failed to fetch word from MongoDB, check backend!' });
  }
});

router.get('/daily-word/higherlower', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const username = req.query.username;
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek !== 2 && dayOfWeek !== 6) {
    return res.status(403).json({ error: 'Higher/Lower only runs on Tuesdays and Saturdays!' });
  }
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    if (await hasPlayedToday(username, 'higherlower')) {
      return res.status(403).json({ error: 'You have already played Higher/Lower today' });
    }
    if (!mongoose.connection.readyState) {
      return res.status(200).json({ message: 'Higher/Lower initialized (DB offline)' });
    }
    await regenerateDailyWords();
    const doc = await DailyContent.findOne({ date: today, game: 'higherlower' });
    if (!doc) return res.status(404).json({ error: 'No state found for Higher/Lower' });
    res.status(200).json({ message: 'Higher/Lower initialized' });
  } catch (err) {
    console.error('Error fetching Higher/Lower state:', err.message);
    res.status(500).json({ error: 'Failed to fetch word from MongoDB, check backend!' });
  }
});

router.post('/higherlower/next', async (req, res) => {
  const { username, currentNumber, guess } = req.body;
  console.log('POST /higherlower/next:', { username, currentNumber, guess });
  if (!username || currentNumber === undefined || !guess) {
    return res.status(400).json({ error: 'Username, currentNumber, and guess required' });
  }
  const nextNumber = Math.floor(Math.random() * 15) + 1;
  const correct = (guess === 'higher' && nextNumber > currentNumber) || (guess === 'lower' && nextNumber < currentNumber);
  res.status(200).json({ nextNumber, correct });
});

// Add trivia, minehunter routes as needed...

router.post('/score', async (req, res) => {
  const { username, game, points, time } = req.body;
  console.log('Received score POST:', { username, game, points, time });
  if (!username || !game || points === undefined || time === undefined) {
    return res.status(400).json({ error: 'Missing required fields: username, game, points, time' });
  }
  if (!mongoose.connection.readyState) {
    console.log('MongoDB not connected, skipping score save');
    return res.status(200).json({ message: 'Score not saved - DB offline' });
  }
  try {
    let player = await Player.findOne({ username });
    if (!player) {
      player = new Player({ username, scores: [] });
    }
    player.scores.push({ game, points, time, date: new Date() });
    const savedPlayer = await player.save({ w: 'majority', writeConcern: { wtimeout: 5000 } });
    console.log(`Score ${points} saved for ${username}, ID: ${savedPlayer._id}`);
    res.status(201).json({ message: 'Score saved', playerId: savedPlayer._id });
  } catch (err) {
    console.error('Error saving score:', err.message);
    res.status(500).json({ error: 'Failed to save score', details: err.message });
  }
});

router.get('/leaderboard/:game', async (req, res) => {
  const { game } = req.params;
  console.log(`Fetching leaderboard for game: ${game}`);
  if (!mongoose.connection.readyState) {
    console.log('MongoDB not connected, returning empty leaderboard');
    return res.status(200).json([]);
  }
  try {
    const leaderboard = await Player.aggregate([
      { $unwind: '$scores' },
      { $match: { 'scores.game': game } },
      { $group: { _id: '$username', totalPoints: { $sum: '$scores.points' }, minTime: { $min: '$scores.time' } } },
      { $sort: { totalPoints: -1, minTime: 1 } },
      { $limit: 10 },
      { $project: {username: '$_id', points: '$totalPoints', time: '$minTime' } }
    ]);
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard', details: err.message });
  }
});

module.exports = router;
module.exports.regenerateDailyWords = regenerateDailyWords;