import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useMarketData = (ticker) => {
  const socket = useContext(SocketContext);
  const [livePrice, setLivePrice] = useState(null);

  useEffect(() => {
    if (!socket || !ticker) return;

    const handlePriceUpdate = (data) => {
      if (data.ticker && data.ticker.toUpperCase() === ticker.toUpperCase()) {
        setLivePrice(data.price);
      }
    };

    socket.on('price_update', handlePriceUpdate);

    return () => {
      socket.off('price_update', handlePriceUpdate);
    };
  }, [socket, ticker]);

  return livePrice;
};