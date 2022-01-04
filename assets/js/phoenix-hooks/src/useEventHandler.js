import { useEffect, useRef } from 'react';

export function useEventHandler(channel, event, handler) {
  const handlerFun = useRef(handler);
  handlerFun.current = handler;

  useEffect(() => {
    if (channel === null) {
      return;
    }

    const ref = channel.on(event, message => {
      handlerFun.current(message);
    });

    return () => {
      channel.off(event, ref);
    }
  }, [channel, event]);
}
