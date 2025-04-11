import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

const nodeWidth = 180;
const nodeHeight = 60;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const layoutNodes = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x, y },
      sourcePosition: 'bottom',
      targetPosition: 'top',
    };
  });
};

const dummyWebDevData = {
  subject: 'Web Development',
  nodes: [
    { id: '1', data: { label: 'HTML Basics' } },
    { id: '2', data: { label: 'CSS' } },
    { id: '3', data: { label: 'JavaScript' } },
    { id: '4', data: { label: 'React (Frontend)' } },
    { id: '5', data: { label: 'Node.js (Backend)' } },
    { id: '6', data: { label: 'State Mgmt' } },
    { id: '7', data: { label: 'Express' } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e3-5', source: '3', target: '5' },
    { id: 'e4-6', source: '4', target: '6' },
    { id: 'e5-7', source: '5', target: '7' },
  ]
};

const resourceData = {
  'HTML Basics': ['W3Schools HTML', 'MDN HTML Docs', 'freeCodeCamp HTML Course'],
  'CSS': ['MDN CSS', 'Flexbox Froggy', 'CSS Grid Garden'],
  'JavaScript': ['Eloquent JS', 'JavaScript.info', 'freeCodeCamp JS'],
  'React (Frontend)': ['React Docs', 'Scrimba React', 'Frontend Mentor'],
  'Node.js (Backend)': ['Node Docs', 'The Odin Project Backend'],
  'State Mgmt': ['Redux Docs', 'Jotai', 'Recoil'],
  'Express': ['Express Docs', 'REST APIs with Express'],
};

const SyllabusPage = ({ subject = 'Web Development' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const laidOut = layoutNodes(dummyWebDevData.nodes, dummyWebDevData.edges);
    setNodes(laidOut);
    setEdges(dummyWebDevData.edges);
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_e, node) => {
    setSelectedTopic(node.data.label);
    // Adjust offset for modal appearance
    setModalPosition({ x: node.position.x + 200, y: node.position.y + 60 });
  };

  return (
    <div className="w-full h-screen relative">
      <h2 className="text-2xl font-bold p-4">{subject} Learning Path</h2>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {selectedTopic && (
        <div
          className="absolute bg-white border rounded-xl shadow-lg w-96 z-50 p-6"
          style={{
            left: modalPosition.x,
            top: modalPosition.y,
          }}
        >
          <h3 className="text-xl font-bold mb-4">{selectedTopic} Resources</h3>
          <ul className="list-disc ml-5 space-y-1">
            {(resourceData[selectedTopic] || []).map((res, idx) => (
              <li key={idx} className="text-sm">{res}</li>
            ))}
          </ul>
          <button
            onClick={() => setSelectedTopic(null)}
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default SyllabusPage;
