import { useState, useCallback } from "react";
import { useGraphData } from "./features/graph/hooks/useGraphData";
import { GraphViewer } from "./features/graph/components/GraphViewer";
import { InfoPanel } from "./features/graph/components/InfoPanel";
import { Legend } from "./features/graph/components/Legend";
import { Toolbar } from "./components/ui/Toolbar";

function App() {
  const { graph, loading, error, reload } = useGraphData();
  const [sortActivities, setSortActivities] = useState(false);
  const [sortResources, setSortResources] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500" role="status">
        <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Loading graph data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4" role="alert">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={reload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!graph) return null;

  const selectedNode = selectedNodeId
    ? graph.nodeMap.get(selectedNodeId) ?? null
    : null;

  return (
    <div className="h-screen flex flex-col bg-white">
      <Toolbar
        nodeCount={graph.data.nodes.length}
        edgeCount={graph.data.dependencies.length}
        spofCount={graph.spofIds.size}
        sortActivities={sortActivities}
        onSortActivitiesChange={setSortActivities}
        sortResources={sortResources}
        onSortResourcesChange={setSortResources}
        onReload={reload}
      />

      <main className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <div className="flex-1 relative min-h-[300px]">
          <GraphViewer
            graph={graph}
            sortActivities={sortActivities}
            sortResources={sortResources}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
            onPaneClick={handleClearSelection}
          />
          <Legend />
        </div>
        {selectedNode && (
          <InfoPanel
            node={selectedNode}
            graph={graph}
            onClose={handleClearSelection}
          />
        )}
      </main>
    </div>
  );
}

export default App;
