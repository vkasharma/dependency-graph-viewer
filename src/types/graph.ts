/** Priority levels for activity nodes, ordered from most to least critical. */
export type Priority = "critical" | "high" | "medium" | "low";

/** Resource subtypes in the dataset. */
export type ResourceType =
  | "technology"
  | "people"
  | "building"
  | "third_party"
  | "equipment";

/** A business activity that depends on resources (or other activities). */
export interface ActivityNode {
  id: string;
  type: "activity";
  name: string;
  rto_hours: number;
  priority: Priority;
  owner: string;
}

/** A resource that activities depend on. */
export interface ResourceNode {
  id: string;
  type: "resource";
  resource_type: ResourceType;
  name: string;
  vendor?: string;
  contact?: string;
}

/** Union of all node types in the graph dataset. */
export type GraphNode = ActivityNode | ResourceNode;

/** A directed dependency edge: `from` depends on `to`. */
export interface Dependency {
  from: string;
  to: string;
}

/** Top-level shape of graph.json. */
export interface GraphData {
  nodes: GraphNode[];
  dependencies: Dependency[];
}

/** Adjacency info computed for each node. */
export interface NodeAdjacency {
  /** IDs of nodes this node depends on (outgoing edges). */
  dependsOn: Set<string>;
  /** IDs of nodes that depend on this node (incoming edges). */
  dependedBy: Set<string>;
}

/** Processed graph with computed metadata. */
export interface ProcessedGraph {
  data: GraphData;
  nodeMap: Map<string, GraphNode>;
  adjacency: Map<string, NodeAdjacency>;
  /** Set of resource node IDs that are single points of failure. */
  spofIds: Set<string>;
  /** Resource criticality score: resource ID -> number of dependents. */
  resourceCriticality: Map<string, number>;
}

/** Data shape passed to the ActivityNode custom React Flow component. */
export interface ActivityNodeData {
  label: string;
  priority: Priority;
  rtoHours: number;
  owner: string;
  nodeType: "activity";
  dimmed: boolean;
}

/** Data shape passed to the ResourceNode custom React Flow component. */
export interface ResourceNodeData {
  label: string;
  resourceType: ResourceType;
  vendor?: string;
  contact?: string;
  isSpof: boolean;
  dependentCount: number;
  nodeType: "resource";
  dimmed: boolean;
}
