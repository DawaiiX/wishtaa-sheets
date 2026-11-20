"use client";

import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/**
 * Map view: the React Flow canvas (pan, zoom, grid).
 * P1-0 only proves the canvas works; nodes, arrows and status chips come in P1-1.
 */
export default function MapView() {
  return (
    <div className="h-full w-full">
      <ReactFlow nodes={[]} edges={[]} fitView>
        <Background gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
