import { MarkerType, type Edge } from "@xyflow/react";
import type { FlowNode } from "./types";

/**
 * Demo data for P1-1 only. P1-2 replaces this file with the full MBCPL flow;
 * the components do not need to change.
 * Note: a parent (topic) node must come before its children in the array.
 */
export const demoNodes: FlowNode[] = [
  {
    id: "topic-mbcpl",
    type: "topic",
    position: { x: 40, y: 40 },
    style: { width: 1100, height: 190 },
    data: { label: "MBCPL > Opening Balance Reconciliation" },
  },
  // Sheet node positions are relative to the topic node.
  {
    id: "s4", type: "sheet", parentId: "topic-mbcpl", extent: "parent", position: { x: 30, y: 60 },
    data: { name: "Step 4", status: "done", lastRun: "2026-11-20T09:00:00Z" },
  },
  {
    id: "s8", type: "sheet", parentId: "topic-mbcpl", extent: "parent", position: { x: 290, y: 60 },
    data: { name: "Step 8", status: "running", lastRun: "2026-11-19T11:15:00Z" },
  },
  {
    id: "s9", type: "sheet", parentId: "topic-mbcpl", extent: "parent", position: { x: 550, y: 60 },
    data: { name: "Step 9", status: "waiting", lastRun: null },
  },
  {
    id: "s99", type: "sheet", parentId: "topic-mbcpl", extent: "parent", position: { x: 810, y: 60 },
    data: { name: "Step 9.9", status: "failed", lastRun: "2026-11-18T05:42:00Z" },
  },
];

export const demoEdges: Edge[] = [
  { id: "e4-8", source: "s4", target: "s8" },
  { id: "e8-9", source: "s8", target: "s9" },
  { id: "e9-99", source: "s9", target: "s99" },
].map((e) => ({ ...e, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed } }));
