import { useEffect, useRef, useCallback } from 'react';

export default function usePolling(callback, interval, isActive) {
  const savedCallback = useRef(callback);
  const intervalId = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive || !interval) {
      stop();
      return;
    }

    savedCallback.current();
    intervalId.current = setInterval(() => savedCallback.current(), interval);

    return stop;
  }, [isActive, interval, stop]);

  return { stop };
}
