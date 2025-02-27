const express = require('express');
const app = express();

console.log('Starting server...');

app.use(express.json());




app.post('/api/game/higherlower/next', (req, res) => {
  console.log('POST /higherlower/next:', req.body);
  const { username, currentNumber, guess } = req.body;
  if (!username || currentNumber === undefined || !guess) {
    return res.status(400).json({ error: 'Username, currentNumber, and guess required' });
  }
  const nextNumber = Math.floor(Math.random() * 15) + 1;
  const correct = (guess === 'higher' && nextNumber > currentNumber) || (guess === 'lower' && nextNumber < currentNumber);
  res.status(200).json({ nextNumber, correct });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason.message || reason);
  process.exit(1);
});