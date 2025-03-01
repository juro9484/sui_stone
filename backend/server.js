require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gameRoutes = require('./routes/game');

console.log('Starting server...');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Cache-Control']
}));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gameadmin:24October2000@gaminghubcluster.ryrjk.mongodb.net/GamingHubCluster?retryWrites=true&w=majority&appName=GamingHubCluster';
console.log('Attempting MongoDB connection with URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000
})
  .then(async () => {
    console.log('MongoDB connected successfully');
    try {
      await gameRoutes.regenerateDailyWords();
      console.log('All game words regenerated');
    } catch (err) {
      console.error('Error during word regeneration:', err.message);
    }
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.log('Continuing without MongoDB connection...');
  });

mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

app.use('/api/game', gameRoutes);

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