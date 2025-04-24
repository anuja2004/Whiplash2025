import React from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const getNodes = (isMobile, isFullScreen) => {
  // On mobile, if fullscreen (width >= 640), use horizontal layout but with more spacing
  if (isMobile && isFullScreen) {
    return [
      { id: '1', position: { x: 0, y: 0 }, data: { label: 'Register' }, style: { background: '#facc15', color: '#222', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 22, boxShadow: '0 4px 24px #fde68a88', minWidth: 120, minHeight: 56, textAlign: 'center' } },
      { id: '2', position: { x: 220, y: 0 }, data: { label: 'Upload Syllabus' }, style: { background: '#38bdf8', color: '#fff', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 20, boxShadow: '0 4px 24px #38bdf888', minWidth: 120, minHeight: 56, textAlign: 'center' } },
      { id: '3', position: { x: 440, y: 0 }, data: { label: 'AI Extracts Topics' }, style: { background: '#818cf8', color: '#fff', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 20, boxShadow: '0 4px 24px #818cf888', minWidth: 120, minHeight: 56, textAlign: 'center' } },
      { id: '4', position: { x: 660, y: 0 }, data: { label: 'Personalized Plan' }, style: { background: '#34d399', color: '#222', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 20, boxShadow: '0 4px 24px #34d39988', minWidth: 120, minHeight: 56, textAlign: 'center' } },
      { id: '5', position: { x: 880, y: 0 }, data: { label: 'Track & Learn' }, style: { background: '#f472b6', color: '#222', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 20, boxShadow: '0 4px 24px #f472b688', minWidth: 120, minHeight: 56, textAlign: 'center' } },
    ];
  }
  if (isMobile) {
    // Make the flowchart much longer and visually impressive on small screens
    return [
      { id: '1', position: { x: 0, y: 0 }, data: { label: 'Register' }, style: { background: '#facc15', color: '#222', borderRadius: 20, padding: 32, fontWeight: 800, fontSize: 26, boxShadow: '0 8px 32px #fde68a88', minWidth: 180, minHeight: 70, textAlign: 'center', margin: 0 } },
      { id: '2', position: { x: 0, y: 180 }, data: { label: 'Upload Syllabus' }, style: { background: '#38bdf8', color: '#fff', borderRadius: 20, padding: 32, fontWeight: 800, fontSize: 24, boxShadow: '0 8px 32px #38bdf888', minWidth: 180, minHeight: 70, textAlign: 'center', margin: 0 } },
      { id: '3', position: { x: 0, y: 360 }, data: { label: 'AI Extracts Topics' }, style: { background: '#818cf8', color: '#fff', borderRadius: 20, padding: 32, fontWeight: 800, fontSize: 24, boxShadow: '0 8px 32px #818cf888', minWidth: 180, minHeight: 70, textAlign: 'center', margin: 0 } },
      { id: '4', position: { x: 0, y: 540 }, data: { label: 'Personalized Plan' }, style: { background: '#34d399', color: '#222', borderRadius: 20, padding: 32, fontWeight: 800, fontSize: 24, boxShadow: '0 8px 32px #34d39988', minWidth: 180, minHeight: 70, textAlign: 'center', margin: 0 } },
      { id: '5', position: { x: 0, y: 720 }, data: { label: 'Track & Learn' }, style: { background: '#f472b6', color: '#222', borderRadius: 20, padding: 32, fontWeight: 800, fontSize: 24, boxShadow: '0 8px 32px #f472b688', minWidth: 180, minHeight: 70, textAlign: 'center', margin: 0 } },
    ];
  }
  // Desktop
  return [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Register' }, style: { background: '#facc15', color: '#222', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 24, boxShadow: '0 4px 24px #fde68a88', minWidth: 120, minHeight: 56, textAlign: 'center' } },
    { id: '2', position: { x: 260, y: 0 }, data: { label: 'Upload Syllabus' }, style: { background: '#38bdf8', color: '#fff', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 22, boxShadow: '0 4px 24px #38bdf888', minWidth: 120, minHeight: 56, textAlign: 'center' } },
    { id: '3', position: { x: 520, y: 0 }, data: { label: 'AI Extracts Topics' }, style: { background: '#818cf8', color: '#fff', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 22, boxShadow: '0 4px 24px #818cf888', minWidth: 120, minHeight: 56, textAlign: 'center' } },
    { id: '4', position: { x: 780, y: 0 }, data: { label: 'Personalized Plan' }, style: { background: '#34d399', color: '#222', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 22, boxShadow: '0 4px 24px #34d39988', minWidth: 120, minHeight: 56, textAlign: 'center' } },
    { id: '5', position: { x: 1040, y: 0 }, data: { label: 'Track & Learn' }, style: { background: '#f472b6', color: '#222', borderRadius: 16, padding: 24, fontWeight: 700, fontSize: 22, boxShadow: '0 4px 24px #f472b688', minWidth: 120, minHeight: 56, textAlign: 'center' } },
  ];
};

const getEdges = (isMobile, isFullScreen) => [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#38bdf8', strokeWidth: 5 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#818cf8', strokeWidth: 5 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#34d399', strokeWidth: 5 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#f472b6', strokeWidth: 5 } },
];

export default function ProjectFlow() {
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = dimensions.width < 768;
  const isFullScreen = dimensions.width >= 640 && dimensions.width < 1024;

  const nodes = getNodes(isMobile, isFullScreen);
  const edges = getEdges(isMobile, isFullScreen);

  return (
    <div style={{ width: '100%', maxWidth: isMobile ? (isFullScreen ? 950 : 340) : 1200, height: isMobile ? (isFullScreen ? 220 : 900) : 170, margin: '0 auto', transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        elementsSelectable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background color="#f3f4f6" gap={18} />
      </ReactFlow>
    </div>
  );
}
