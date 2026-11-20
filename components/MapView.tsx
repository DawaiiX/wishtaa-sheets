"use client";

import { useCallback, useEffect, useState } from "react";
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
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SheetNode from "./nodes/SheetNode";
import TopicNode from "./nodes/TopicNode";
import NodePanel from "./panel/NodePanel";
import { demoEdges, demoNodes } from "@/lib/demoData";
import { STATUS_META, type FlowNode, type SheetFlowNode, type SheetNodeData } from "@/lib/types";

// Defined outside the component so React Flow does not re-register them on every render.
const nodeTypes = { sheet: SheetNode, topic: TopicNode };

/** Minimap colours: topics are a pale box, sheets take their status colour. */
function minimapNodeColor(node: Node): string {
  if (node.type === "sheet") {
    const status = (node.data as SheetNodeData).status;
    return STATUS_META[status].minimapColor;
  }
  return "#e2e8f0";
}

/**
 * Map view: draggable topic and sheet nodes with arrows between sheets, and a side
 * panel for the clicked sheet node. Select a node or arrow and press Delete or
 * Backspace to remove it (not while typing in a text box).
 */
export default function MapView() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(demoNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(demoEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // The panel shows this node; if it was deleted the panel closes by itself.
  const selectedNode = nodes.find(
    (n): n is SheetFlowNode => n.id === selectedId && n.type === "sheet",
  );

  // Drawing a new arrow: drag from an output handle (right) to an input handle (left).
  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) =>
        addEdge({ ...c, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed } }, eds),
      ),
    [setEdges],
  );

  // Apply a partial change to the selected sheet node's data (in memory only).
  const updateSelected = useCallback(
    (patch: Partial<SheetNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedId && n.type === "sheet" ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      );
    },
    [selectedId, setNodes],
  );

  // Escape closes the panel.
  useEffect(() => {
    if (!selectedNode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode]);

  return (
    <div className="relative flex h-full w-full">
      <div className="h-full min-w-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedId(node.type === "sheet" ? node.id : null)}
          onPaneClick={() => setSelectedId(null)}
          deleteKeyCode={["Backspace", "Delete"]}
          fitView
        >
          <Background gap={20} />
          <Controls />
          <MiniMap
            pannable
            zoomable
            nodeColor={minimapNodeColor}
            nodeStrokeColor="#64748b"
            nodeStrokeWidth={2}
            nodeBorderRadius={4}
            maskColor="rgba(148, 163, 184, 0.25)"
          />
        </ReactFlow>
      </div>

      {/* Docked on the right from tablet width up; a full overlay on phones. */}
      {selectedNode && (
        <div className="absolute inset-0 z-20 border-l border-slate-200 bg-white md:static md:inset-auto md:w-[380px] md:shrink-0">
          <NodePanel
            key={selectedNode.id}
            node={selectedNode}
            onChange={updateSelected}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  );
}
