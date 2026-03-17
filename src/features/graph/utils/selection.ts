import type { ProcessedGraph } from "../../../types/graph";

/**
 * Compute the set of node IDs that should be highlighted:
 * the selected node + all nodes directly connected by an edge.
 */
export function getHighlightedNodeIds(
  selectedId: string,
  graph: ProcessedGraph,
): Set<string> {
  const highlighted = new Set<string>([selectedId]);
  const adj = graph.adjacency.get(selectedId);
  if (adj) {
    for (const id of adj.dependsOn) highlighted.add(id);
    for (const id of adj.dependedBy) highlighted.add(id);
  }
  return highlighted;
}

/**
 * Check if a dependency edge is connected to the selected node.
 */
export function isEdgeHighlighted(
  dep: { from: string; to: string },
  selectedId: string,
): boolean {
  return dep.from === selectedId || dep.to === selectedId;
}
