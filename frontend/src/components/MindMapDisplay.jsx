import React, { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
/* ================= CUSTOM NODE ================= */
const CustomNode = ({ data, id }) => {
  // Color scheme based on depth (vertical layout style)
  let bgClass = "bg-white border-gray-200 text-gray-800";
  if (data.level === 0) bgClass = "bg-blue-600 border-blue-700 text-white font-bold"; // Root
  else if (data.level === 1) bgClass = "bg-white border-purple-500 text-gray-800"; // Level 1
  else if (data.level >= 2) bgClass = "bg-gray-50 border-gray-300 text-gray-600 text-sm"; // Level 2+

  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 min-w-[150px] text-center transition-all duration-300 ${bgClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      
      <div className="font-semibold">{data.label}</div>

      {data.expandable && (
        <button
          className={`mt-2 text-xs flex items-center justify-center w-full transition-colors ${
            data.expanded 
              ? 'text-red-500 hover:text-red-700' 
              : 'text-blue-500 hover:text-blue-700'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            data.onToggle(id);
          }}
        >
          {data.expanded ? '− Collapse' : '+ Expand'}
        </button>
      )}
      
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

/* ================= HELPER FUNCTIONS ================= */
// Helper to find all recursive descendants of a node
const getAllDescendants = (parentId, currentNodes, currentEdges) => {
  let descendants = [];
  const childrenEdges = currentEdges.filter(e => e.source === parentId);
  
  childrenEdges.forEach(edge => {
    const childNode = currentNodes.find(n => n.id === edge.target);
    if (childNode) {
      descendants.push(childNode);
      descendants = [...descendants, ...getAllDescendants(childNode.id, currentNodes, currentEdges)];
    }
  });
  return descendants;
};

/* ================= MAIN COMPONENT ================= */
export default function MindMapDisplay({ content }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [initialData, setInitialData] = useState(null);
  const [rfInstance, setRfInstance] = useState(null);

  // Memoize nodeTypes to prevent React Flow warning
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Parse JSON content
  useEffect(() => {
    if (!content) return;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const parsed = JSON.parse(jsonStr);
      
      // AI should now return a single object, but handle arrays as fallback
      if (Array.isArray(parsed)) {
          if (parsed.length === 1) {
              setInitialData(parsed[0]); // Single item array, unwrap it
          } else if (parsed.length > 1) {
              // Multiple roots - wrap in synthetic node (rare case)
              setInitialData({ 
                  topic: "Overview", 
                  children: parsed 
              });
          }
      } else {
          // Expected case: single root object
          setInitialData(parsed);
      }
    } catch (e) {
      console.error("Failed to parse Mind Map JSON", e);
    }
  }, [content]);

  // Build Graph from Data - Vertical Layout with Expand/Collapse
  useEffect(() => {
    if (!initialData) return;

    const newNodes = [];
    const newEdges = [];
    let nodeIdCounter = 1;

    // Build initial graph - show root + level 1 only
    const traverse = (item, level, x, y, parentId = null) => {
      const currentId = `n${nodeIdCounter++}`;
      const hasChildren = item.children && item.children.length > 0;
      
      newNodes.push({
        id: currentId,
        type: 'custom',
        position: { x, y },
        data: { 
          label: item.topic || item.name || item.title || "Node",
          level: level,
          children: item.children || [], // Store children for later expansion
          expanded: level < 1, // Root expanded by default
          expandable: hasChildren,
          onToggle: toggleNode
        },
      });

      if (parentId) {
        newEdges.push({
          id: `e${parentId}-${currentId}`,
          source: parentId,
          target: currentId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        });
      }

      // Only show children if level < 1 (root + level 1)
      if (level < 1 && hasChildren) {
        const childCount = item.children.length;
        const spacing = 220;
        const totalWidth = (childCount - 1) * spacing;
        const startX = x - (totalWidth / 2);

        item.children.forEach((child, index) => {
          traverse(child, level + 1, startX + (index * spacing), y + 150, currentId);
        });
      }
    };

    // Handle both single object and array
    if (Array.isArray(initialData)) {
      initialData.forEach((item, index) => {
        traverse(item, 0, 400 + (index * 300), 50);
      });
    } else {
      traverse(initialData, 0, 400, 50);
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
    
    // Fit view after render
    setTimeout(() => {
      if (rfInstance) rfInstance.fitView({ padding: 0.2 });
    }, 100);

  }, [initialData, rfInstance]);

  // Toggle Node Expand/Collapse
  const toggleNode = useCallback((nodeId) => {
    setNodes((nds) => {
      const parentNode = nds.find(n => n.id === nodeId);
      if (!parentNode) return nds;

      const isExpanded = parentNode.data.expanded;
      const children = parentNode.data.children;

      if (!children || children.length === 0) return nds;

      // Update parent expanded state
      const updatedNodes = nds.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, expanded: !isExpanded } } : n
      );

      if (isExpanded) {
        // COLLAPSE: Remove all descendants
        let descendantIds = [];
        
        // Calculate descendants and update edges
        setEdges((currentEdges) => {
          const descendants = getAllDescendants(nodeId, nds, currentEdges);
          descendantIds = descendants.map(d => d.id);
          
          // Remove edges where either source OR target is a descendant
          return currentEdges.filter(e => 
            !descendantIds.includes(e.target) && !descendantIds.includes(e.source)
          );
        });
        
        // Filter out descendant nodes
        return updatedNodes.filter(n => !descendantIds.includes(n.id));

      } else {
        // EXPAND: Add immediate children
        const parentPos = parentNode.position;
        const newNodes = [];
        const newEdges = [];

        const childCount = children.length;
        const spacing = 220;
        const totalWidth = (childCount - 1) * spacing;
        const startX = parentPos.x - (totalWidth / 2);

        children.forEach((child, index) => {
          const childId = `${nodeId}_${index}`;
          
          // Check if node already exists
          const exists = nds.find(n => n.id === childId);
          if (exists) return;

          newNodes.push({
            id: childId,
            type: 'custom',
            position: { x: startX + (index * spacing), y: parentPos.y + 150 },
            data: { 
              label: child.topic || child.name || child.title || "Node", 
              level: parentNode.data.level + 1,
              children: child.children || [],
              expanded: false,
              expandable: child.children && child.children.length > 0,
              onToggle: toggleNode
            }
          });

          newEdges.push({
            id: `e${nodeId}-${childId}`,
            source: nodeId,
            target: childId,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#94a3b8', strokeWidth: 2 }
          });
        });

        setEdges(eds => [...eds, ...newEdges]);
        
        // Fit view after expansion
        setTimeout(() => {
          if (rfInstance) rfInstance.fitView({ padding: 0.2, duration: 500 });
        }, 50);
        
        return [...updatedNodes, ...newNodes];
      }
    });
  }, [edges, rfInstance]);

  if (!initialData) return <div className="text-gray-500">Parsing Mind Map...</div>;

  return (
    <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      <div className="absolute top-4 right-4 z-10 bg-white/90 p-3 rounded-lg shadow-sm text-xs text-slate-500 border border-slate-100 backdrop-blur-sm">
        <div className="font-semibold text-slate-700 mb-1">Controls</div>
        Click <span className="text-blue-500 font-semibold">+ Expand</span> to reveal children
        <br/>Click <span className="text-red-500 font-semibold">− Collapse</span> to hide children
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={memoizedNodeTypes}
        onInit={setRfInstance}
        fitView
        attributionPosition="bottom-right"
        connectionLineType={ConnectionLineType.Bezier}
        defaultEdgeOptions={{ type: 'default', animated: false }}
      >
        <Controls showInteractive={false} className="bg-white shadow-sm border border-slate-100" />
        <MiniMap nodeStrokeWidth={3} zoomable pannable className="bg-white shadow-sm border border-slate-100 rounded-lg overflow-hidden" />
        <Background color="#94a3b8" gap={24} size={1} variant="dots" />
      </ReactFlow>
    </div>
  );
}
