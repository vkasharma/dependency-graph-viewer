import { Handle, Position } from "@xyflow/react";
import type { ResourceNodeData, ResourceType } from "../../../types/graph";

const RESOURCE_ICONS: Record<ResourceType, string> = {
  technology: "\u{1F5A5}\uFE0F",
  people: "\u{1F465}",
  building: "\u{1F3E2}",
  third_party: "\u{1F517}",
  equipment: "\u2699\uFE0F",
};

interface Props {
  data: ResourceNodeData;
}

export function ResourceNode({ data }: Props) {
  return (
    <div
      className={`rounded-md border-2 px-3 py-2 shadow-sm w-[200px] transition-opacity ${
        data.isSpof
          ? "border-red-600 bg-red-50 ring-2 ring-red-300"
          : "border-blue-400 bg-blue-50"
      } ${data.dimmed ? "opacity-25" : ""}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-sm shrink-0">
            {RESOURCE_ICONS[data.resourceType]}
          </span>
          <div className="font-medium text-sm text-gray-900 leading-tight truncate">
            {data.label}
          </div>
        </div>
        {data.isSpof && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white shrink-0">
            SPOF
          </span>
        )}
      </div>
      <div className="text-[11px] text-gray-500 mt-1">
        {data.resourceType.replace("_", " ")} · {data.dependentCount} dependent
        {data.dependentCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
