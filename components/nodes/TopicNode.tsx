import { NodeResizer, type NodeProps } from "@xyflow/react";
import type { TopicFlowNode } from "@/lib/types";

/** A topic (group): a resizable container; sheet nodes whose parentId is this node move with it. */
export default function TopicNode({ data, selected }: NodeProps<TopicFlowNode>) {
  return (
    <div className="h-full w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/60">
      <NodeResizer isVisible={selected} minWidth={260} minHeight={140} />
      <div className="px-3 py-2 text-sm font-semibold text-slate-600">{data.label}</div>
    </div>
  );
}
