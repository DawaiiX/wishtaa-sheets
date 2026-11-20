import { Handle, Position, type NodeProps } from "@xyflow/react";
import StatusChip from "@/components/StatusChip";
import { formatLastRun } from "@/lib/format";
import type { SheetFlowNode } from "@/lib/types";

/** A sheet card: name, status chip, last run. Input handle left, output handle right. */
export default function SheetNode({ data, selected }: NodeProps<SheetFlowNode>) {
  return (
    <div
      className={
        "w-48 rounded-lg border bg-white p-3 shadow-sm " +
        (selected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-300")
      }
    >
      <Handle type="target" position={Position.Left} />
      <div className="truncate text-sm font-semibold text-slate-900" title={data.name}>
        {data.name}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <StatusChip status={data.status} />
        {/* Manual tag; the site cannot detect scripts. */}
        {data.hasAppsScript && (
          <span
            title="This sheet has its own Apps Script"
            className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
          >
            Apps Script
          </span>
        )}
      </div>
      <div className="mt-2 text-xs text-slate-500">Last run: {formatLastRun(data.lastRun)}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
