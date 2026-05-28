import { useState, useCallback, useRef } from "react";

export function useUndoRedo<T>(initial: T, limit = 50) {
  const [state, setState] = useState<T>(initial);
  const history = useRef<T[]>([initial]);
  const index = useRef(0);

  const push = useCallback((next: T) => {
    // Remove any future states after current index
    history.current = history.current.slice(0, index.current + 1);
    history.current.push(next);
    if (history.current.length > limit) {
      history.current.shift();
    } else {
      index.current += 1;
    }
    setState(next);
  }, []);

  const undo = useCallback(() => {
    if (index.current <= 0) return;
    index.current -= 1;
    setState(history.current[index.current]);
  }, []);

  const redo = useCallback(() => {
    if (index.current >= history.current.length - 1) return;
    index.current += 1;
    setState(history.current[index.current]);
  }, []);

  const canUndo = index.current > 0;
  const canRedo = index.current < history.current.length - 1;

  return { state, setState: push, undo, redo, canUndo, canRedo, peek: () => state };
}
