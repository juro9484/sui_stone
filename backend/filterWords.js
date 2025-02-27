const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'words_alpha.txt');
const outputFile = path.join(__dirname, 'wordBank.json');

fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Split into array, filter 5-letter words, convert to uppercase
  const words = data.split('\n')
    .map(word => word.trim().toUpperCase())
    .filter(word => word.length === 5 && /^[A-Z]{5}$/.test(word));

  console.log(`Total 5-letter words: ${words.length}`);

  // Write to JSON
  fs.writeFile(outputFile, JSON.stringify(words, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log(`Saved ${words.length} words to ${outputFile}`);
    }
  });
});