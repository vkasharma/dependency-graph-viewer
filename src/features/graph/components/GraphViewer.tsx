import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type {
  ProcessedGraph,
  ActivityNode as ActivityNodeType,
  ResourceNode as ResourceNodeType,
} from "../../../types/graph";
import { ActivityNode } from "./ActivityNode";
import { ResourceNode } from "./ResourceNode";
import { computeLayout } from "../utils/layout";
import { getHighlightedNodeIds, isEdgeHighlighted } from "../utils/selection";

const nodeTypes: NodeTypes = {
  activity: ActivityNode,
  resource: ResourceNode,
};

export interface GraphViewerProps {
  graph: ProcessedGraph;
  sortActivities: boolean;
  sortResources: boolean;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onPaneClick: () => void;
}

function buildNodes(
  graph: ProcessedGraph,
  sortActivities: boolean,
  sortResources: boolean,
  selectedNodeId: string | null,
): Node[] {
  const layout = computeLayout(graph, sortActivities, sortResources);
  const layoutMap = new Map(layout.map((l) => [l.id, l]));

  const highlightedIds = selectedNodeId
    ? getHighlightedNodeIds(selectedNodeId, graph)
    : null;

  return graph.data.nodes.map((node): Node => {
    const pos = layoutMap.get(node.id);
    const position = pos ? pos.position : { x: 0, y: 0 };
    const dimmed = highlightedIds !== null && !highlightedIds.has(node.id);

    if (node.type === "activity") {
      const actNode = node as ActivityNodeType;
      return {
        id: node.id,
        type: "activity",
        position,
        data: {
          label: actNode.name,
          priority: actNode.priority,
          rtoHours: actNode.rto_hours,
          owner: actNode.owner,
          nodeType: "activity",
          dimmed,
        },
      };
    }

    const resNode = node as ResourceNodeType;
    return {
      id: node.id,
      type: "resource",
      position,
      data: {
        label: resNode.name,
        resourceType: resNode.resource_type,
        vendor: resNode.vendor,
        contact: resNode.contact,
        isSpof: graph.spofIds.has(node.id),
        dependentCount: graph.resourceCriticality.get(node.id) ?? 0,
        nodeType: "resource",
        dimmed,
      },
    };
  });
}

function buildEdges(
  graph: ProcessedGraph,
  selectedNodeId: string | null,
): Edge[] {
  return graph.data.dependencies.map((dep, i) => {
    const highlighted =
      selectedNodeId !== null && isEdgeHighlighted(dep, selectedNodeId);
    const dimmed = selectedNodeId !== null && !highlighted;

    return {
      id: `e-${i}`,
      source: dep.from,
      target: dep.to,
      animated: highlighted,
      style: {
        stroke: highlighted ? "#3b82f6" : "#94a3b8",
        strokeWidth: highlighted ? 2.5 : 1.5,
        opacity: dimmed ? 0.15 : 1,
      },
      markerEnd: {
        type: "arrowclosed" as const,
        color: highlighted ? "#3b82f6" : "#94a3b8",
      },
    };
  });
}

export function GraphViewer({
  graph,
  sortActivities,
  sortResources,
  selectedNodeId,
  onNodeClick,
  onPaneClick,
}: GraphViewerProps) {
  const nodes = useMemo(
    () => buildNodes(graph, sortActivities, sortResources, selectedNodeId),
    [graph, sortActivities, sortResources, selectedNodeId],
  );

  const edges = useMemo(
    () => buildEdges(graph, selectedNodeId),
    [graph, selectedNodeId],
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick],
  );

  const handlePaneClick = useCallback(() => {
    onPaneClick();
  }, [onPaneClick]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={20} size={1} />
      <Controls />
    </ReactFlow>
  );
}
