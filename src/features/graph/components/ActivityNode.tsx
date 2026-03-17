import { Handle, Position } from "@xyflow/react";
import type { ActivityNodeData, Priority } from "../../../types/graph";

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: "border-red-500 bg-red-50",
  high: "border-orange-400 bg-orange-50",
  medium: "border-yellow-400 bg-yellow-50",
  low: "border-gray-400 bg-gray-50",
};

const PRIORITY_BADGES: Record<Priority, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-400 text-white",
  medium: "bg-yellow-400 text-gray-800",
  low: "bg-gray-400 text-white",
};

interface Props {
  data: ActivityNodeData;
}

export function ActivityNode({ data }: Props) {
  return (
    <div
      className={`rounded-lg border-2 px-3 py-2 shadow-sm w-[200px] transition-opacity ${PRIORITY_COLORS[data.priority]} ${data.dimmed ? "opacity-25" : ""}`}
    >
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div className="flex items-start justify-between gap-1">
        <div className="font-medium text-sm text-gray-900 leading-tight truncate">
          {data.label}
        </div>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_BADGES[data.priority]}`}
        >
          {data.priority}
        </span>
      </div>
      <div className="text-[11px] text-gray-500 mt-1">
        RTO: {data.rtoHours}h
      </div>
    </div>
  );
}
