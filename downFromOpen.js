// import moment from 'moment/moment';

const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('bankNifty.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(' === results ====', results.length);

    const filterCandles = results
      .filter((item) => parseFloat(item.Close) >= parseFloat(item.Open))
      .map((data) => {
        return {
          ...data,
          diffBwOpenAndLow: parseFloat(data.Open) - parseFloat(data.Low),
        };
      });

    console.log(' === filterCandles ====', filterCandles);
    // Write the candle data to a CSV file
    // Extract column names from the first object in the array
    const columnNames = Object.keys(filterCandles[0]);

    // Create the CSV header row
    const headerRow = `${columnNames.join(',')}\n`;

    // Create the CSV rows
    const csvRows = filterCandles.map((item) => {
      const rowValues = columnNames.map((column) => item[column]);
      return rowValues.join(',');
    });

    // Combine the header row and CSV rows
    const csvContent = headerRow + csvRows.join('\n');

    // Write the CSV content to a file
    fs.writeFile('data.csv', csvContent, 'utf8', (err) => {
      if (err) throw err;
      console.log('CSV file created successfully.');
    });
  });
