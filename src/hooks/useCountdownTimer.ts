import { useEffect, useState } from 'react';

export default (end: Date, onEnd?: () => void) => {
  const [secondsRemaining, setSecondsRemaining] = useState(() => Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000)));
  useEffect(() => {
    const interval = setInterval(() => {
      const secondsRemaining = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
      setSecondsRemaining(secondsRemaining);
      if (secondsRemaining <= 0 && onEnd) onEnd();
    }, 1000);
    return () => clearInterval(interval);
  }, [end, onEnd]);
  return secondsRemaining;
};