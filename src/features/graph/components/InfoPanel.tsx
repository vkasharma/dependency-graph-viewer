import type { GraphNode, ProcessedGraph } from "../../../types/graph";

interface InfoPanelProps {
  node: GraphNode;
  graph: ProcessedGraph;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export function InfoPanel({ node, graph, onClose }: InfoPanelProps) {
  const isSpof = node.type === "resource" && graph.spofIds.has(node.id);

  return (
    <aside
      className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white p-4 overflow-y-auto shrink-0"
      aria-label={`Details for ${node.name}`}
      role="complementary"
    >
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900 leading-tight">
          {node.name}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
          aria-label="Close details panel"
        >
          &times;
        </button>
      </div>

      <p className="text-[11px] text-blue-600 font-medium mb-3">Selected</p>

      {isSpof && (
        <div
          className="mb-4 px-2 py-1.5 bg-red-50 border border-red-200 rounded text-xs font-semibold text-red-700"
          role="status"
        >
          Single Point of Failure &mdash; depended on by{" "}
          {graph.adjacency.get(node.id)?.dependedBy.size ?? 0} nodes
        </div>
      )}

      <dl className="flex flex-col gap-3">
        <Field label="ID" value={node.id} />
        <Field
          label="Type"
          value={node.type === "activity" ? "Activity" : "Resource"}
        />

        {node.type === "activity" && (
          <>
            <Field label="Priority" value={node.priority} />
            <Field
              label="RTO"
              value={`${node.rto_hours} hour${node.rto_hours !== 1 ? "s" : ""}`}
            />
            <Field label="Owner" value={node.owner} />
          </>
        )}

        {node.type === "resource" && (
          <>
            <Field
              label="Resource Type"
              value={node.resource_type.replace("_", " ")}
            />
            {node.vendor && <Field label="Vendor" value={node.vendor} />}
            {node.contact && <Field label="Contact" value={node.contact} />}
            <Field
              label="Dependents"
              value={String(graph.resourceCriticality.get(node.id) ?? 0)}
            />
          </>
        )}
      </dl>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Connections
        </h3>
        <ConnectionList
          label="Depends on"
          ids={[...(graph.adjacency.get(node.id)?.dependsOn ?? [])]}
          nodeMap={graph.nodeMap}
        />
        <ConnectionList
          label="Depended on by"
          ids={[...(graph.adjacency.get(node.id)?.dependedBy ?? [])]}
          nodeMap={graph.nodeMap}
        />
      </div>
    </aside>
  );
}

function ConnectionList({
  label,
  ids,
  nodeMap,
}: {
  label: string;
  ids: string[];
  nodeMap: Map<string, GraphNode>;
}) {
  if (ids.length === 0) return null;

  return (
    <div className="mb-2">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <ul className="space-y-0.5">
        {ids.map((id) => {
          const n = nodeMap.get(id);
          return (
            <li key={id} className="text-sm text-gray-700">
              {n ? n.name : id}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
