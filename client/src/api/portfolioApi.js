import axios from './axiosConfig';

export const buyStock = async (tradeDetails) => {
  const { ticker, shares, price } = tradeDetails;
  const response = await axios.post('/api/portfolio/buy', { ticker, shares, price });
  return response.data;
};

export const sellStock = async (tradeDetails) => {
  const { ticker, shares, price } = tradeDetails;
  const response = await axios.post('/api/portfolio/sell', { ticker, shares, price });
  return response.data;
};

export const getPortfolio = async () => {
  const response = await axios.get('/api/portfolio');
  return response.data;
};

export const getTransactions = async () => {
  const response = await axios.get('/api/portfolio/transactions');
  return response.data;
};