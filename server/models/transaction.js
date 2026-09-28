const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BUY', 'SELL'], uppercase: true, required: true },
  ticker: { type: String, required: true },
  shares: { type: Number, required: true },
  price: { type: Number, required: true },
  buyPrice: { type: Number },
  sellPrice: { type: Number },
  totalAmount: { type: Number, required: true },
  totalCostBasis: { type: Number },
  profit: { type: Number, default: 0 },
  profitPercentage: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);