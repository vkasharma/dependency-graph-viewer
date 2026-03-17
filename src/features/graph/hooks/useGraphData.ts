import { useCallback, useEffect, useState } from "react";
import type { GraphData, ProcessedGraph } from "../../../types/graph";
import { processGraphData } from "../utils/processGraph";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; graph: ProcessedGraph };

export interface UseGraphDataResult {
  graph: ProcessedGraph | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

async function fetchGraph(): Promise<ProcessedGraph> {
  const res = await fetch(`/data/graph.json?_t=${Date.now()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as GraphData;
  return processGraphData(data);
}

/**
 * Fetch graph.json and return processed graph data.
 * `reload()` re-fetches with a cache-busting query param.
 */
export function useGraphData(): UseGraphDataResult {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchGraph()
      .then((graph) => {
        if (!cancelled) setState({ status: "ok", graph });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load graph data";
          setState({ status: "error", message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    graph: state.status === "ok" ? state.graph : null,
    loading: state.status === "loading",
    error: state.status === "error" ? state.message : null,
    reload,
  };
}
