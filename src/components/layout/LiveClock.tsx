'use client';

import { useEffect, useState } from 'react';

export function formatHeaderTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatHeaderDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const initial = window.setTimeout(() => setCurrentTime(new Date()), 0);
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);

  if (!currentTime) {
    return (
      <div className="hidden min-w-24 text-right lg:block" aria-hidden="true">
        <p className="tabular-nums text-sm font-semibold text-ink">--.--.--</p>
        <p className="text-xs text-ink-muted">---, -- ---</p>
      </div>
    );
  }

  const time = formatHeaderTime(currentTime);
  const date = formatHeaderDate(currentTime);

  return (
    <time
      dateTime={currentTime.toISOString()}
      aria-label={`${date}, ${time}`}
      className="hidden min-w-24 text-right lg:block"
    >
      <span className="block tabular-nums text-sm font-semibold text-ink">{time}</span>
      <span className="block text-xs text-ink-muted">{date}</span>
    </time>
  );
}
