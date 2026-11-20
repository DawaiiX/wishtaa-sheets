"use client";

import { useCallback } from "react";
import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SheetNode from "./nodes/SheetNode";
import TopicNode from "./nodes/TopicNode";
import { demoEdges, demoNodes } from "@/lib/demoData";
import type { FlowNode } from "@/lib/types";

// Defined outside the component so React Flow does not re-register them on every render.
const nodeTypes = { sheet: SheetNode, topic: TopicNode };

/**
 * Map view: draggable topic and sheet nodes with arrows between sheets.
 * Select a node or arrow and press Delete or Backspace to remove it.
 */
export default function MapView() {
  const [nodes, , onNodesChange] = useNodesState<FlowNode>(demoNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(demoEdges);

  // Drawing a new arrow: drag from an output handle (right) to an input handle (left).
  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) =>
        addEdge({ ...c, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed } }, eds),
      ),
    [setEdges],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
      >
        <Background gap={20} />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
