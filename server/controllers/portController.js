const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.find({ user: req.user.id });
    res.json(portfolio);
  } catch (error) {
    next(error);
  }
};

exports.buyStock = async (req, res, next) => {
  try {
    const { ticker, shares, price } = req.body;
    const totalCost = shares * price;
    const userId = req.user.id; // Assuming req.user is populated by authMiddleware

    // 1. Fetch the user to check balance
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // 2. Check if user has sufficient balance
    if (user.balance < totalCost) {
      res.status(400);
      throw new Error('Insufficient balance to buy stock');
    }

    // 3. Deduct totalCost from user's balance
    user.balance -= totalCost;
    await user.save();

    // 4. Update or create portfolio entry
    let portfolioEntry = await Portfolio.findOne({ user: userId, ticker });

    if (portfolioEntry) {
      // Update existing entry
      const existingValue = portfolioEntry.averagePrice * portfolioEntry.shares;
      const newValue = price * shares;
      const newTotalShares = portfolioEntry.shares + shares;
      portfolioEntry.averagePrice = (existingValue + newValue) / newTotalShares;
      portfolioEntry.shares += shares;
    } else {
      // Create new entry
      portfolioEntry = await Portfolio.create({
        user: userId,
        ticker,
        shares,
        averagePrice: price,
      });
    }
    await portfolioEntry.save();

    // 5. Log the transaction
    await Transaction.create({
      user: userId,
      ticker,
      type: 'buy',
      shares,
      price,
      totalAmount: totalCost,
      date: new Date(),
    });

    // Respond with updated portfolio or success message
    res.json({ message: `Successfully bought ${shares} shares of ${ticker}` });
    // Consider returning the updated portfolio or user balance
    // res.json({ message: `Successfully bought ${shares} shares of ${ticker}`, portfolio: portfolioEntry, userBalance: user.balance });
  } catch (error) {
    next(error);
  }
};

exports.sellStock = async (req, res, next) => {
  try {
    const { ticker, shares, price } = req.body;
    const userId = req.user.id; // Assuming req.user is populated by authMiddleware
    const totalProceeds = shares * price;

    // 1. Fetch the user's portfolio entry for the given ticker
    let portfolioEntry = await Portfolio.findOne({ user: userId, ticker });

    if (!portfolioEntry || portfolioEntry.shares < shares) {
      res.status(400);
      throw new Error('Insufficient shares to sell');
    }

    // 2. Update portfolio entry: reduce shares
    portfolioEntry.shares -= shares;

    if (portfolioEntry.shares === 0) {
      // If all shares are sold, remove the portfolio entry
      await portfolioEntry.remove();
    } else {
      await portfolioEntry.save();
    }

    // 3. Fetch the user to update balance
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // 4. Add totalProceeds to user's balance
    user.balance += totalProceeds;
    await user.save();

    // 5. Log the transaction
    await Transaction.create({
      user: userId,
      ticker,
      type: 'sell',
      shares,
      price,
      totalAmount: totalProceeds,
      date: new Date(),
    });

    // Respond with updated portfolio or success message
    res.json({ message: `Successfully sold ${shares} shares of ${ticker}` });
    // Consider returning the updated portfolio or user balance
    // res.json({
    //   message: `Successfully sold ${shares} shares of ${ticker}`,
    //   portfolio: portfolioEntry.shares === 0 ? null : portfolioEntry,
    //   userBalance: user.balance
    // });
  } catch (error) {
    next(error);
  }
};