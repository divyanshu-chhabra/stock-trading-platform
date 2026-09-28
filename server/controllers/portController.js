const Portfolio = require('../models/portfolio');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { getLivePrice } = require('../services/priceService');

/**
 * Enrich raw transactions to ensure buyPrice, sellPrice, totalCostBasis,
 * profit, and profitPercentage are always computed and present.
 */
const enrichTransactions = (transactions) => {
  return transactions.map((tx, idx, arr) => {
    const txObj = tx.toObject ? tx.toObject() : { ...tx };
    const numPrice = Number(txObj.price) || 0;
    const numShares = Number(txObj.shares) || 0;

    if (txObj.type === 'SELL') {
      if (txObj.sellPrice == null) {
        txObj.sellPrice = numPrice;
      }
      if (txObj.buyPrice == null) {
        // Look up earlier BUY transactions for this ticker to deduce purchase cost
        const earlierBuys = arr.filter(
          (t) =>
            t.ticker === txObj.ticker &&
            t.type === 'BUY' &&
            new Date(t.createdAt) <= new Date(txObj.createdAt)
        );
        if (earlierBuys.length > 0) {
          const totalBuyCost = earlierBuys.reduce((sum, b) => sum + (b.totalAmount || b.shares * b.price), 0);
          const totalBuyShares = earlierBuys.reduce((sum, b) => sum + b.shares, 0);
          txObj.buyPrice = totalBuyShares > 0 ? Number((totalBuyCost / totalBuyShares).toFixed(2)) : numPrice;
        } else {
          txObj.buyPrice = numPrice;
        }
      }
      if (txObj.totalCostBasis == null) {
        txObj.totalCostBasis = Number((numShares * txObj.buyPrice).toFixed(2));
      }
      if (txObj.profit == null) {
        txObj.profit = Number(((txObj.totalAmount || numShares * txObj.sellPrice) - txObj.totalCostBasis).toFixed(2));
      }
      if (txObj.profitPercentage == null) {
        txObj.profitPercentage = txObj.buyPrice > 0
          ? Number((((txObj.sellPrice - txObj.buyPrice) / txObj.buyPrice) * 100).toFixed(2))
          : 0;
      }
    } else {
      // BUY
      if (txObj.buyPrice == null) {
        txObj.buyPrice = numPrice;
      }
      if (txObj.totalCostBasis == null) {
        txObj.totalCostBasis = txObj.totalAmount || Number((numShares * numPrice).toFixed(2));
      }
      if (txObj.profit == null) txObj.profit = 0;
      if (txObj.profitPercentage == null) txObj.profitPercentage = 0;
    }

    return txObj;
  });
};

/**
 * Perform detailed judgment analysis of the user's latest transaction.
 */
const judgeTransaction = async (lastTx) => {
  if (!lastTx) return null;
  const ticker = lastTx.ticker;
  let livePrice = 0;
  try {
    livePrice = await getLivePrice(ticker);
  } catch (e) {
    livePrice = lastTx.price;
  }
  if (!livePrice || isNaN(livePrice)) {
    livePrice = lastTx.price;
  }

  const isSell = lastTx.type === 'SELL';
  if (isSell) {
    const buyPrice = Number(lastTx.buyPrice != null ? lastTx.buyPrice : lastTx.price);
    const sellPrice = Number(lastTx.sellPrice != null ? lastTx.sellPrice : lastTx.price);
    const costBasis = Number(lastTx.totalCostBasis != null ? lastTx.totalCostBasis : (lastTx.shares * buyPrice).toFixed(2));
    const saleProceeds = Number(lastTx.totalAmount != null ? lastTx.totalAmount : (lastTx.shares * sellPrice).toFixed(2));
    const profit = Number((saleProceeds - costBasis).toFixed(2));
    const profitPct = buyPrice > 0 ? Number((((sellPrice - buyPrice) / buyPrice) * 100).toFixed(2)) : 0;

    let verdict = 'Break-Even Trade';
    let verdictType = 'neutral';
    let verdictBadge = '⚖️ Break-Even';

    if (profit > 0) {
      if (profitPct >= 15) {
        verdict = 'High Profit Win';
        verdictBadge = '🏆 High Profit (+15%+)';
      } else {
        verdict = 'Profitable Trade';
        verdictBadge = '🟢 Profitable Trade';
      }
      verdictType = 'success';
    } else if (profit < 0) {
      verdict = 'Loss Realized';
      verdictBadge = '🔴 Loss Realized';
      verdictType = 'danger';
    }

    const commentary = profit > 0
      ? `You bought ${lastTx.shares} shares of ${ticker} at $${buyPrice.toFixed(2)} ($${costBasis.toFixed(2)} total) and sold at $${sellPrice.toFixed(2)} ($${saleProceeds.toFixed(2)} total), locking in a clean profit of +$${profit.toFixed(2)} (+${profitPct}%). Excellent exit!`
      : profit < 0
      ? `You bought ${lastTx.shares} shares of ${ticker} at $${buyPrice.toFixed(2)} ($${costBasis.toFixed(2)} total) and sold at $${sellPrice.toFixed(2)} ($${saleProceeds.toFixed(2)} total), closing with a realized loss of -$${Math.abs(profit).toFixed(2)} (${profitPct}%).`
      : `You exited ${lastTx.shares} shares of ${ticker} at $${sellPrice.toFixed(2)}, breaking even with $0.00 net change.`;

    return {
      ...lastTx,
      currentMarketPrice: livePrice,
      buyPrice,
      sellPrice,
      totalCostBasis: costBasis,
      totalAmount: saleProceeds,
      profit,
      profitPercentage: profitPct,
      verdict,
      verdictBadge,
      verdictType,
      commentary
    };
  } else {
    // BUY trade
    const buyPrice = Number(lastTx.buyPrice != null ? lastTx.buyPrice : lastTx.price);
    const costBasis = Number(lastTx.totalCostBasis != null ? lastTx.totalCostBasis : (lastTx.shares * buyPrice).toFixed(2));
    const currentVal = Number((lastTx.shares * livePrice).toFixed(2));
    const unrealizedProfit = Number((currentVal - costBasis).toFixed(2));
    const unrealizedProfitPct = costBasis > 0 ? Number(((unrealizedProfit / costBasis) * 100).toFixed(2)) : 0;

    let verdict = 'Holding Steady';
    let verdictBadge = '⚖️ Break-Even';
    let verdictType = 'neutral';

    if (unrealizedProfit > 0) {
      verdict = 'In Profit';
      verdictBadge = '🚀 Gaining Now';
      verdictType = 'success';
    } else if (unrealizedProfit < 0) {
      verdict = 'Currently Down';
      verdictBadge = '🔻 Below Buy Price';
      verdictType = 'danger';
    }

    const commentary = unrealizedProfit > 0
      ? `You purchased ${lastTx.shares} shares of ${ticker} at $${buyPrice.toFixed(2)} ($${costBasis.toFixed(2)} total). With current market price at $${livePrice.toFixed(2)}, this position is currently sitting on an unrealized gain of +$${unrealizedProfit.toFixed(2)} (+${unrealizedProfitPct}%).`
      : unrealizedProfit < 0
      ? `You purchased ${lastTx.shares} shares of ${ticker} at $${buyPrice.toFixed(2)} ($${costBasis.toFixed(2)} total). With current market price at $${livePrice.toFixed(2)}, this position is currently down -$${Math.abs(unrealizedProfit).toFixed(2)} (${unrealizedProfitPct}%).`
      : `You purchased ${lastTx.shares} shares of ${ticker} at $${buyPrice.toFixed(2)}. The market price is currently steady at $${livePrice.toFixed(2)}.`;

    return {
      ...lastTx,
      currentMarketPrice: livePrice,
      buyPrice,
      currentValue: currentVal,
      totalCostBasis: costBasis,
      unrealizedProfit,
      unrealizedProfitPercent: unrealizedProfitPct,
      verdict,
      verdictBadge,
      verdictType,
      commentary
    };
  }
};

exports.getPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [holdingsRaw, user, allTransactions] = await Promise.all([
      Portfolio.find({ user: userId }),
      User.findById(userId),
      Transaction.find({ user: userId }).sort({ createdAt: -1 })
    ]);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Enrich transactions with buyPrice, sellPrice, profit metrics
    const enrichedTransactions = enrichTransactions(allTransactions);

    // Fetch real-time market prices for active holdings
    const holdings = await Promise.all(
      holdingsRaw.map(async (h) => {
        let currentPrice;
        try {
          currentPrice = await getLivePrice(h.ticker);
        } catch (e) {
          currentPrice = h.averagePrice;
        }
        if (!currentPrice || isNaN(currentPrice)) {
          currentPrice = h.averagePrice;
        }

        const totalCost = Number((h.shares * h.averagePrice).toFixed(2));
        const currentValue = Number((h.shares * currentPrice).toFixed(2));
        const unrealizedProfit = Number((currentValue - totalCost).toFixed(2));
        const unrealizedProfitPercent = totalCost > 0
          ? Number(((unrealizedProfit / totalCost) * 100).toFixed(2))
          : 0;

        return {
          ...h.toObject(),
          currentPrice,
          totalCost,
          currentValue,
          unrealizedProfit,
          unrealizedProfitPercent,
        };
      })
    );

    // Compute live portfolio statistics
    const totalInvested = Number(holdings.reduce((sum, h) => sum + h.totalCost, 0).toFixed(2));
    const totalHoldingsValue = Number(holdings.reduce((sum, h) => sum + h.currentValue, 0).toFixed(2));
    const totalPortfolioValue = Number((user.balance + totalHoldingsValue).toFixed(2));
    const totalUnrealizedProfit = Number((totalHoldingsValue - totalInvested).toFixed(2));

    // Aggregate purchase and sale metrics
    const totalPurchased = Number(
      enrichedTransactions
        .filter((t) => t.type === 'BUY')
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0)
        .toFixed(2)
    );

    const totalSold = Number(
      enrichedTransactions
        .filter((t) => t.type === 'SELL')
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0)
        .toFixed(2)
    );

    const totalRealizedProfit = Number(
      enrichedTransactions
        .filter((t) => t.type === 'SELL')
        .reduce((sum, t) => sum + (t.profit || 0), 0)
        .toFixed(2)
    );

    const totalAllTimeProfit = Number((totalRealizedProfit + totalUnrealizedProfit).toFixed(2));

    // Judge last transaction if available
    let lastTransactionAnalysis = null;
    if (enrichedTransactions.length > 0) {
      lastTransactionAnalysis = await judgeTransaction(enrichedTransactions[0]);
    }

    res.json({
      holdings,
      balance: user.balance,
      totalPortfolioValue,
      totalHoldingsValue,
      totalInvested,
      totalPurchased,
      totalSold,
      totalRealizedProfit,
      totalUnrealizedProfit,
      totalAllTimeProfit,
      lastTransactionAnalysis,
      transactions: enrichedTransactions,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const rawTransactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    const transactions = enrichTransactions(rawTransactions);
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

    // 3. Log the transaction with purchase price tracking
    const transaction = await Transaction.create({
      user: userId,
      ticker: ticker.toUpperCase(),
      type: 'BUY',
      shares: numShares,
      price: numPrice,
      buyPrice: numPrice,
      sellPrice: null,
      totalAmount: totalCost,
      totalCostBasis: totalCost,
      profit: 0,
      profitPercentage: 0,
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

    const buyPrice = Number(portfolioEntry.averagePrice.toFixed(2));
    const sellPrice = numPrice;
    const totalCostBasis = Number((numShares * buyPrice).toFixed(2));
    const profit = Number((totalProceeds - totalCostBasis).toFixed(2));
    const profitPercentage = buyPrice > 0
      ? Number((((sellPrice - buyPrice) / buyPrice) * 100).toFixed(2))
      : 0;

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

    // 4. Log the transaction with buyPrice, sellPrice, and realized profit
    const transaction = await Transaction.create({
      user: userId,
      ticker: ticker.toUpperCase(),
      type: 'SELL',
      shares: numShares,
      price: numPrice,
      buyPrice: buyPrice,
      sellPrice: sellPrice,
      totalAmount: totalProceeds,
      totalCostBasis: totalCostBasis,
      profit: profit,
      profitPercentage: profitPercentage,
    });

    res.status(200).json({
      success: true,
      message: `Successfully sold ${numShares} share(s) of ${ticker.toUpperCase()} (Profit: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)})`,
      balance: user.balance,
      portfolio: portfolioEntry.shares === 0 ? null : portfolioEntry,
      transaction,
      profit,
      profitPercentage,
      buyPrice,
      sellPrice,
    });
  } catch (error) {
    next(error);
  }
};