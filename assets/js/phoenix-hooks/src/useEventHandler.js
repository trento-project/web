import { SocketContext } from './SocketContext';
import { useEffect, useContext } from 'react';

export function useEventHandler(channel, event, handler) {
  const { handlers, setHandlers } = useContext(SocketContext);

  useEffect(() => {
    setHandlers((handlers) => [...handlers, handler]);
    if (channel === null) {
      return;
    }

    const ref = channel.on(event, message => {
      handlers.map((f) => f(message));
    });

    return () => {
      channel.off(event, ref);
    }
  }, [channel, event]);
}
