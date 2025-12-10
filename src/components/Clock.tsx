import React, { useState, useEffect } from 'react';

export const Clock = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="text-lg font-mono opacity-0">00:00:00</div>;

  return (
    <div className="hidden sm:block text-lg font-mono font-semibold text-gray-700 dark:text-gray-200 bg-white/30 dark:bg-gray-800/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/30">
      {time.toLocaleTimeString()}
    </div>
  );
};
