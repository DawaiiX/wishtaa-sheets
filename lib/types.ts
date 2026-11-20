import type { Node } from "@xyflow/react";

/**
 * Status values for a sheet node. The label, icon and colours of each status
 * live in STATUS_META below, so changing one is a one-place edit.
 */
export type SheetStatus = "waiting" | "running" | "done" | "failed";

/** Icon names; StatusChip draws one SVG per name, so status is never colour-only. */
export type StatusIcon = "clock" | "spinner" | "check" | "cross";

export const STATUS_META: Record<
  SheetStatus,
  { label: string; icon: StatusIcon; chipClass: string }
> = {
  waiting: { label: "Waiting", icon: "clock", chipClass: "bg-slate-100 text-slate-600 border-slate-300" },
  running: { label: "Running", icon: "spinner", chipClass: "bg-blue-50 text-blue-700 border-blue-300" },
  done: { label: "Done", icon: "check", chipClass: "bg-green-50 text-green-700 border-green-300" },
  failed: { label: "Failed", icon: "cross", chipClass: "bg-red-50 text-red-700 border-red-300" },
};

/** Data carried by a sheet node. */
export type SheetNodeData = {
  name: string;
  status: SheetStatus;
  /** ISO timestamp (UTC) of the last run, or null if it has never run. */
  lastRun: string | null;
  /** Manual tag: this sheet has its own Apps Script (the site cannot detect or run scripts). */
  hasAppsScript: boolean;
  /** Notes for whoever maintains this sheet (edited in the side panel, P1-3). */
  instructions: string;
  /** Script text kept for reference only; pasted by hand into the sheet's own Apps Script. */
  script: string;
};

/** Data carried by a topic (group) node. */
export type TopicNodeData = {
  label: string;
};

export type SheetFlowNode = Node<SheetNodeData, "sheet">;
export type TopicFlowNode = Node<TopicNodeData, "topic">;
export type FlowNode = SheetFlowNode | TopicFlowNode;
