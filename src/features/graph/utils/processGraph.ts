import type {
  GraphData,
  GraphNode,
  NodeAdjacency,
  ProcessedGraph,
} from "../../../types/graph";

function buildNodeMap(nodes: GraphNode[]): Map<string, GraphNode> {
  const map = new Map<string, GraphNode>();
  for (const node of nodes) {
    map.set(node.id, node);
  }
  return map;
}

function buildAdjacency(data: GraphData): Map<string, NodeAdjacency> {
  const adj = new Map<string, NodeAdjacency>();

  const getOrCreate = (id: string): NodeAdjacency => {
    let entry = adj.get(id);
    if (!entry) {
      entry = { dependsOn: new Set(), dependedBy: new Set() };
      adj.set(id, entry);
    }
    return entry;
  };

  for (const node of data.nodes) {
    getOrCreate(node.id);
  }

  for (const dep of data.dependencies) {
    getOrCreate(dep.from).dependsOn.add(dep.to);
    getOrCreate(dep.to).dependedBy.add(dep.from);
  }

  return adj;
}

function findSpofIds(
  nodeMap: Map<string, GraphNode>,
  adjacency: Map<string, NodeAdjacency>,
): Set<string> {
  const spof = new Set<string>();
  for (const [id, node] of nodeMap) {
    if (node.type === "resource") {
      const incoming = adjacency.get(id);
      if (incoming && incoming.dependedBy.size > 1) {
        spof.add(id);
      }
    }
  }
  return spof;
}

function computeResourceCriticality(
  nodeMap: Map<string, GraphNode>,
  adjacency: Map<string, NodeAdjacency>,
): Map<string, number> {
  const scores = new Map<string, number>();
  for (const [id, node] of nodeMap) {
    if (node.type === "resource") {
      const incoming = adjacency.get(id);
      scores.set(id, incoming ? incoming.dependedBy.size : 0);
    }
  }
  return scores;
}

/**
 * Process raw graph data into a fully enriched structure with adjacency,
 * SPOF flags, and resource criticality scores.
 */
export function processGraphData(data: GraphData): ProcessedGraph {
  const nodeMap = buildNodeMap(data.nodes);
  const adjacency = buildAdjacency(data);
  const spofIds = findSpofIds(nodeMap, adjacency);
  const resourceCriticality = computeResourceCriticality(nodeMap, adjacency);

  return { data, nodeMap, adjacency, spofIds, resourceCriticality };
}
