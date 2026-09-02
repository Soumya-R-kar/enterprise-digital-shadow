import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

// Initial nodes (systems)
const initialNodes = [
  { id: 'payment-db', data: { label: 'Payment Database' }, position: { x: 250, y: 0 }, style: { background: '#3b82f6', color: 'white', border: '2px solid #1e40af' } },
  { id: 'payment-api', data: { label: 'Payment API' }, position: { x: 250, y: 150 }, style: { background: '#8b5cf6', color: 'white', border: '2px solid #6d28d9' } },
  { id: 'payment-service', data: { label: 'Payment Service' }, position: { x: 250, y: 300 }, style: { background: '#10b981', color: 'white', border: '2px solid #047857' } },
  { id: 'checkout-ui', data: { label: 'Checkout UI' }, position: { x: 100, y: 450 }, style: { background: '#f59e0b', color: 'white', border: '2px solid #b45309' } },
  { id: 'customer-app', data: { label: 'Customer App' }, position: { x: 400, y: 450 }, style: { background: '#ef4444', color: 'white', border: '2px solid #b91c1c' } },
  { id: 'auth-db', data: { label: 'Auth Database' }, position: { x: 600, y: 0 }, style: { background: '#ec4899', color: 'white', border: '2px solid #be185d' } },
  { id: 'auth-api', data: { label: 'Auth API' }, position: { x: 600, y: 150 }, style: { background: '#14b8a6', color: 'white', border: '2px solid #0f766e' } },
  { id: 'user-portal', data: { label: 'User Portal' }, position: { x: 600, y: 300 }, style: { background: '#6366f1', color: 'white', border: '2px solid #4338ca' } },
];

// Initial edges (dependencies)
const initialEdges = [
  { id: 'e1', source: 'payment-db', target: 'payment-api', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e2', source: 'payment-api', target: 'payment-service', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e3', source: 'payment-service', target: 'checkout-ui', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e4', source: 'payment-service', target: 'customer-app', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e5', source: 'auth-db', target: 'auth-api', animated: true, style: { stroke: '#6366f1' } },
  { id: 'e6', source: 'auth-api', target: 'user-portal', animated: true, style: { stroke: '#6366f1' } },
];

export default function DependencyGraph() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulate = async (systemId) => {
    setSelectedSystem(systemId);
    
    try {
      const response = await fetch(`http://localhost:8000/api/simulate?system_id=${systemId}`, {
        method: 'POST'
      });
      const data = await response.json();
      setSimulationResult(data);
      
      // Highlight affected nodes in red
      setNodes(nds => nds.map(node => {
        if (data.affected_services.includes(node.id)) {
          return {
            ...node,
            style: { ...node.style, background: '#ef4444', borderColor: '#b91c1c' }
          };
        }
        return node;
      }));
      
      // Highlight affected edges in red
      setEdges(edgs => edgs.map(edge => {
        if (data.affected_services.includes(edge.source) || data.affected_services.includes(edge.target)) {
          return {
            ...edge,
            style: { stroke: '#ef4444', strokeWidth: 3 },
            animated: true
          };
        }
        return edge;
      }));
      
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const resetGraph = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedSystem(null);
    setSimulationResult(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">System Dependency Graph</h1>
      <p className="text-gray-500 mb-6">Click on any system to simulate a failure and see the cascade effect.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visualization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6" style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(event, node) => handleSimulate(node.id)}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Simulation Results Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <AlertTriangle className="text-orange-500 mr-2" size={20} />
            Impact Analysis
          </h2>
          
          {!simulationResult ? (
            <div className="text-center py-12 text-gray-400">
              <p>Click on any system node to simulate a failure</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-l-4 ${simulationResult.business_risk === 'CRITICAL' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'}`}>
                <p className="text-sm text-gray-600">Risk Level</p>
                <p className="text-2xl font-bold text-gray-800">{simulationResult.business_risk}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Users Impacted</p>
                <p className="text-3xl font-bold text-blue-600">{simulationResult.estimated_users_impacted.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Affected Departments</p>
                <div className="flex flex-wrap gap-2">
                  {simulationResult.affected_departments.map(dept => (
                    <span key={dept} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Cascading Services</p>
                <div className="flex flex-wrap gap-2">
                  {simulationResult.affected_services.map(svc => (
                    <span key={svc} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={resetGraph}
                className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Graph
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}