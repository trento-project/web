import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { initSocketConnection } from '@lib/network/socket';
import { getUserProfile } from '@state/selectors/user';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const user = useSelector(getUserProfile);
  const userId = user?.id;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      return;
    }
    setSocket(initSocketConnection());
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
