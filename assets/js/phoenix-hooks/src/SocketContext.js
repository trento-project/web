import React, { useEffect, useState } from 'react';
import { Socket } from 'phoenix';

export const SocketContext = React.createContext();

export function SocketProvider({ children, options, url }) {
  const [socket, setSocket] = useState(null);
  const [handlers, setHandlers] = useState([]);

  useEffect(() => {
    const s = new Socket(url, options);
    s.connect();
    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    }
  }, [options, url]);

  const props = {
    value: {
      socket,
      handlers,
      setHandlers,
    }
  };

  return React.createElement(SocketContext.Provider, props, children);
}
