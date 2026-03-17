import type {
  ActivityNode,
  GraphNode,
  Priority,
  ProcessedGraph,
} from "../../../types/graph";

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Sort activities by priority (ascending rank), then rto_hours ascending, then name. */
export function sortActivitiesByCriticality(
  activities: ActivityNode[],
): ActivityNode[] {
  return [...activities].sort((a, b) => {
    const pDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pDiff !== 0) return pDiff;
    const rtoDiff = a.rto_hours - b.rto_hours;
    if (rtoDiff !== 0) return rtoDiff;
    return a.name.localeCompare(b.name);
  });
}

interface ResourceSortKey {
  dependentCount: number;
  bestPriorityRank: number;
  bestRto: number;
  name: string;
}

function getResourceSortKey(
  resourceId: string,
  resourceName: string,
  graph: ProcessedGraph,
): ResourceSortKey {
  const adj = graph.adjacency.get(resourceId);
  const dependentIds = adj ? [...adj.dependedBy] : [];

  let bestPriorityRank = 999;
  let bestRto = Infinity;

  for (const depId of dependentIds) {
    const depNode = graph.nodeMap.get(depId);
    if (depNode && depNode.type === "activity") {
      const rank = PRIORITY_RANK[depNode.priority];
      if (rank < bestPriorityRank) bestPriorityRank = rank;
      if (depNode.rto_hours < bestRto) bestRto = depNode.rto_hours;
    }
  }

  return {
    dependentCount: dependentIds.length,
    bestPriorityRank,
    bestRto: bestRto === Infinity ? 9999 : bestRto,
    name: resourceName,
  };
}

/** Sort resource nodes by derived criticality. */
export function sortResourcesByCriticality(
  resources: GraphNode[],
  graph: ProcessedGraph,
): GraphNode[] {
  const keyed = resources.map((r) => ({
    node: r,
    key: getResourceSortKey(r.id, r.name, graph),
  }));

  keyed.sort((a, b) => {
    const countDiff = b.key.dependentCount - a.key.dependentCount;
    if (countDiff !== 0) return countDiff;
    const priDiff = a.key.bestPriorityRank - b.key.bestPriorityRank;
    if (priDiff !== 0) return priDiff;
    const rtoDiff = a.key.bestRto - b.key.bestRto;
    if (rtoDiff !== 0) return rtoDiff;
    return a.key.name.localeCompare(b.key.name);
  });

  return keyed.map((k) => k.node);
}

const ACTIVITY_X = 0;
const RESOURCE_X = 500;
const NODE_Y_GAP = 120;
const Y_START = 50;
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

export interface LayoutNode {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

/**
 * Compute deterministic positions for nodes in a two-column layout.
 * Activities on the left, resources on the right.
 */
export function computeLayout(
  graph: ProcessedGraph,
  sortActivities: boolean,
  sortResources: boolean,
): LayoutNode[] {
  const activities = graph.data.nodes.filter(
    (n): n is ActivityNode => n.type === "activity",
  );
  const resources = graph.data.nodes.filter((n) => n.type === "resource");

  const orderedActivities = sortActivities
    ? sortActivitiesByCriticality(activities)
    : activities;
  const orderedResources = sortResources
    ? sortResourcesByCriticality(resources, graph)
    : resources;

  const nodes: LayoutNode[] = [];

  orderedActivities.forEach((node, i) => {
    nodes.push({
      id: node.id,
      position: { x: ACTIVITY_X, y: Y_START + i * NODE_Y_GAP },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  orderedResources.forEach((node, i) => {
    nodes.push({
      id: node.id,
      position: { x: RESOURCE_X, y: Y_START + i * NODE_Y_GAP },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  return nodes;
}
