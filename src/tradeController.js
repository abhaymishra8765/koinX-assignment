const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Trade = require('./tradeModel');

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, '..', req.file.path);

  const trades = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const [baseCoin, quoteCoin] = row.Market.split('/');
      const trade = {
        UTC_Time: new Date(row.UTC_Time),
        Operation: row.Operation,
        Market: row.Market,
        BuySell_Amount: parseFloat(row['Buy/Sell Amount']),
        Price: parseFloat(row.Price),
        BaseCoin: baseCoin,
        QuoteCoin: quoteCoin,
      };
      trades.push(trade);
    })
    .on('end', async () => {
      try {
        // Clear the trades collection before inserting new trades
        await Trade.deleteMany({});
        await Trade.insertMany(trades);
        res.status(200).send('File processed and data stored successfully.');
      } catch (err) {
        res.status(500).send('Error storing data in the database.');
      }
    })
    .on('error', (err) => {
      res.status(500).send('Error processing the file.');
    });
};

exports.getBalance = async (req, res) => {
  const { timestamp } = req.body;
  if (!timestamp) {
    return res.status(400).send('Timestamp is required.');
  }

  const date = new Date(timestamp);

  try {
    const trades = await Trade.find({ UTC_Time: { $lte: date } });

    // Log the trades to verify they are fetched correctly
    console.log('Trades fetched:', trades);

    const balances = trades.reduce((acc, trade) => {
      if (!acc[trade.BaseCoin]) {
        acc[trade.BaseCoin] = 0;
      }
      if (trade.Operation.toLowerCase() === 'buy') {
        acc[trade.BaseCoin] += trade.BuySell_Amount;
      } else if (trade.Operation.toLowerCase() === 'sell') {
        acc[trade.BaseCoin] -= trade.BuySell_Amount;
      }
      return acc;
    }, {});

    // Log the calculated balances to verify the logic
    console.log('Calculated balances:', balances);

    res.status(200).json(balances);
  } catch (err) {
    console.error('Error calculating balance:', err);
    res.status(500).send('Error calculating balance.');
  }
};
