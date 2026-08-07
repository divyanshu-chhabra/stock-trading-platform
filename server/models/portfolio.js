const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticker: { type: String, required: true },
  shares: { type: Number, required: true },
  averagePrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);