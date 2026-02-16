import { useState, useEffect, useCallback } from 'react';
import { getLimits } from '../services/api.js';

export default function useLimits() {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getLimits();
      setLimits(data);
    } catch {
      // Non-critical — limits info is best-effort
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remaining = limits
    ? limits.maxConversionsPerDay - limits.used
    : null;

  return { limits, remaining, loading, refresh };
}
