interface ToolbarProps {
  nodeCount: number;
  edgeCount: number;
  spofCount: number;
  sortActivities: boolean;
  onSortActivitiesChange: (value: boolean) => void;
  sortResources: boolean;
  onSortResourcesChange: (value: boolean) => void;
  onReload: () => void;
}

export function Toolbar({
  nodeCount,
  edgeCount,
  spofCount,
  sortActivities,
  onSortActivitiesChange,
  sortResources,
  onSortResourcesChange,
  onReload,
}: ToolbarProps) {
  return (
    <header className="px-4 py-3 border-b border-gray-200 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Dependency Graph Viewer
          </h1>
          <p className="text-xs text-gray-400">
            {nodeCount} nodes &middot; {edgeCount} edges &middot;{" "}
            {spofCount} SPOF{spofCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sortActivities}
              onChange={(e) => onSortActivitiesChange(e.target.checked)}
              className="rounded"
            />
            Sort activities by criticality
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sortResources}
              onChange={(e) => onSortResourcesChange(e.target.checked)}
              className="rounded"
            />
            Sort resources by criticality
          </label>
          <button
            onClick={onReload}
            aria-label="Reload graph data from server"
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Data
          </button>
        </div>
      </div>
    </header>
  );
}
