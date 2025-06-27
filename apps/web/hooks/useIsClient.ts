'use client';

import { useState, useEffect } from 'react';

/**
 * Simple hook that returns `true` only after the component is mounted
 * on the client.  Useful for guarding widget logic that should never
 * execute during the server render / hydration phase.
 */
export function useIsClient(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
} 