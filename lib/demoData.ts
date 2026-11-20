import { MarkerType, type Edge } from "@xyflow/react";
import type { FlowNode, SheetNodeData, SheetStatus } from "./types";

/**
 * Sample workflow: MBCPL > Opening Balance Reconciliation (Tally vs Farvision).
 * Statuses, run times and Apps Script tags below are sample values only; they are
 * set by hand in the real app. Replaced by saved workflows in later steps.
 * Note: a parent (topic) node must come before its children in the array.
 */

const TOPIC_ID = "topic-mbcpl";

/** Build one sheet node. Positions are relative to the topic node. */
function sheet(
  id: string,
  name: string,
  x: number,
  y: number,
  status: SheetStatus,
  lastRun: string | null,
  hasAppsScript: boolean,
): FlowNode {
  const data: SheetNodeData = { name, status, lastRun, hasAppsScript, instructions: "", script: "" };
  return { id, type: "sheet", parentId: TOPIC_ID, extent: "parent", position: { x, y }, data };
}

// Column x positions (left to right) and the two row y positions for stacked pairs.
const COL = [30, 290, 550, 810, 1070, 1330];
const ROW_TOP = 50;
const ROW_BOTTOM = 200;
const ROW_MID = (ROW_TOP + ROW_BOTTOM) / 2;

export const demoNodes: FlowNode[] = [
  {
    id: TOPIC_ID,
    type: "topic",
    position: { x: 40, y: 40 },
    style: { width: 1590, height: 360 },
    data: { label: "MBCPL > Opening Balance Reconciliation" },
  },
  sheet("s4", "Step 4", COL[0], ROW_MID, "done", "2026-11-18T09:00:00Z", false),
  sheet("s8", "Step 8", COL[1], ROW_MID, "done", "2026-11-19T11:15:00Z", false),
  sheet("s9", "Step 9", COL[2], ROW_MID, "running", "2026-11-20T09:00:00Z", true),
  sheet("s99", "Step 9.9", COL[3], ROW_MID, "waiting", null, true),
  sheet("s10bs", "Step 10 B/S", COL[4], ROW_TOP, "waiting", null, true),
  sheet("s10pl", "Step 10 P&L", COL[4], ROW_BOTTOM, "waiting", null, true),
  sheet("s12bs", "Step 12 B/S", COL[5], ROW_TOP, "waiting", null, false),
  sheet("s12pl", "Step 12 P&L", COL[5], ROW_BOTTOM, "waiting", null, false),
];

/** Arrows: output of the source sheet feeds the input of the target sheet. */
const flow: [source: string, target: string][] = [
  ["s4", "s8"],
  ["s8", "s9"],
  ["s9", "s99"],
  ["s99", "s10bs"],
  ["s99", "s10pl"],
  ["s10bs", "s12bs"],
  ["s10pl", "s12pl"],
];

export const demoEdges: Edge[] = flow.map(([source, target]) => ({
  id: `e-${source}-${target}`,
  source,
  target,
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
}));
