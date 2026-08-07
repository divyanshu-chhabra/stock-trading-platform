import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useMarketData = (ticker) => {
  const socket = useContext(SocketContext);
  const [livePrice, setLivePrice] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('price_update', (data) => {
      if (data.ticker === ticker) setLivePrice(data.price);
    });

    return () => socket.off('price_update');
  }, [socket, ticker]);

  return livePrice;
};