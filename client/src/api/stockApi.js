import api from './axiosConfig';

export const getStockQuote = async (ticker) => {
  const response = await api.get(`/api/market/quote/${ticker}`);
  return response.data;
};

export const getMarketNews = async (category = 'general') => {
  const response = await api.get(`/api/market/news`, {
    params: { category }
  });
  return response.data;
};

export const buyStock = async (tradeData) => {
  const response = await api.post('/api/portfolio/buy', tradeData);
  return response.data;
};