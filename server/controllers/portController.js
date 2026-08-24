const Portfolio = require('../models/portfolio');
const User = require('../models/user');
const Transaction = require('../models/transaction');

exports.getPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [holdings, user, transactions] = await Promise.all([
      Portfolio.find({ user: userId }),
      User.findById(userId),
      Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(10)
    ]);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      holdings,
      balance: user.balance,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

exports.buyStock = async (req, res, next) => {
  try {
    const { ticker, shares, price } = req.body;
    const numShares = Number(shares);
    const numPrice = Number(price);

    if (!ticker || isNaN(numShares) || numShares <= 0 || isNaN(numPrice) || numPrice <= 0) {
      res.status(400);
      throw new Error('Invalid trade parameters: positive shares and price are required.');
    }

    const totalCost = Number((numShares * numPrice).toFixed(2));
    const userId = req.user.id;

    // 1. Fetch user to check and deduct balance
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.balance < totalCost) {
      res.status(400);
      throw new Error(`Insufficient balance ($${user.balance.toFixed(2)}) to complete purchase of $${totalCost.toFixed(2)}.`);
    }

    user.balance = Number((user.balance - totalCost).toFixed(2));
    await user.save();

    // 2. Update or create portfolio entry
    let portfolioEntry = await Portfolio.findOne({ user: userId, ticker: ticker.toUpperCase() });

    if (portfolioEntry) {
      const existingValue = portfolioEntry.averagePrice * portfolioEntry.shares;
      const newValue = numPrice * numShares;
      const newTotalShares = portfolioEntry.shares + numShares;
      portfolioEntry.averagePrice = Number(((existingValue + newValue) / newTotalShares).toFixed(2));
      portfolioEntry.shares = newTotalShares;
      await portfolioEntry.save();
    } else {
      portfolioEntry = await Portfolio.create({
        user: userId,
        ticker: ticker.toUpperCase(),
        shares: numShares,
        averagePrice: Number(numPrice.toFixed(2)),
      });
    }

    // 3. Log the transaction
    const transaction = await Transaction.create({
      user: userId,
      ticker: ticker.toUpperCase(),
      type: 'BUY',
      shares: numShares,
      price: numPrice,
      totalAmount: totalCost,
    });

    res.status(200).json({
      success: true,
      message: `Successfully bought ${numShares} share(s) of ${ticker.toUpperCase()}`,
      balance: user.balance,
      portfolio: portfolioEntry,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

exports.sellStock = async (req, res, next) => {
  try {
    const { ticker, shares, price } = req.body;
    const numShares = Number(shares);
    const numPrice = Number(price);

    if (!ticker || isNaN(numShares) || numShares <= 0 || isNaN(numPrice) || numPrice <= 0) {
      res.status(400);
      throw new Error('Invalid trade parameters: positive shares and price are required.');
    }

    const userId = req.user.id;
    const totalProceeds = Number((numShares * numPrice).toFixed(2));

    // 1. Fetch the user's portfolio entry
    const portfolioEntry = await Portfolio.findOne({ user: userId, ticker: ticker.toUpperCase() });

    if (!portfolioEntry || portfolioEntry.shares < numShares) {
      res.status(400);
      throw new Error(`Insufficient shares to sell. You currently own ${portfolioEntry ? portfolioEntry.shares : 0} shares.`);
    }

    // 2. Update portfolio entry: reduce shares or remove if zero
    portfolioEntry.shares -= numShares;

    if (portfolioEntry.shares === 0) {
      await Portfolio.deleteOne({ _id: portfolioEntry._id });
    } else {
      await portfolioEntry.save();
    }

    // 3. Update user balance
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.balance = Number((user.balance + totalProceeds).toFixed(2));
    await user.save();

    // 4. Log the transaction
    const transaction = await Transaction.create({
      user: userId,
      ticker: ticker.toUpperCase(),
      type: 'SELL',
      shares: numShares,
      price: numPrice,
      totalAmount: totalProceeds,
    });

    res.status(200).json({
      success: true,
      message: `Successfully sold ${numShares} share(s) of ${ticker.toUpperCase()}`,
      balance: user.balance,
      portfolio: portfolioEntry.shares === 0 ? null : portfolioEntry,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};