import { useRef, useState } from 'react';
export function useTask() {
  const lock = useRef(false); const [busy, setBusy] = useState(false); const [error, setError] = useState<string>();
  const run = async (work: () => Promise<unknown>) => {
    if (lock.current) return; lock.current = true; setBusy(true); setError(undefined);
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'Algo deu errado. Tente novamente.'); } finally { lock.current = false; setBusy(false); }
  };
  return { busy, error, run };
}
