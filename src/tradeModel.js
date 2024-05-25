const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  UTC_Time: { type: Date, required: true },
  Operation: { type: String, required: true },
  Market: { type: String, required: true },
  BuySell_Amount: { type: Number, required: true },
  Price: { type: Number, required: true },
  BaseCoin: { type: String, required: true },
  QuoteCoin: { type: String, required: true },
});

module.exports = mongoose.model('Trade', TradeSchema);

