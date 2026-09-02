import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, TrendingUp, Users, Building } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SYSTEMS = [
  { id: 'payment-db', name: 'Payment Database', desc: 'Core payment transaction database' },
  { id: 'payment-api', name: 'Payment API', desc: 'Payment processing API gateway' },
  { id: 'auth-db', name: 'Authentication Database', desc: 'User credentials and authentication data' },
  { id: 'auth-api', name: 'Auth API', desc: 'Authentication and authorization service' }
];

export default function Simulator() {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!selectedSystem) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/simulate?system_id=${selectedSystem}`, {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'CRITICAL') return 'text-red-600 bg-red-100 border-red-200';
    if (risk === 'HIGH') return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-yellow-600 bg-yellow-100 border-yellow-200';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <TrendingUp className="text-blue-600 mr-3" size={32} />
          What-If Impact Simulator
        </h1>
        <p className="text-gray-500 mb-8">Predict the business impact of hypothetical system failures before they happen.</p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select a system to simulate failure:</label>
          <select 
            value={selectedSystem} 
            onChange={(e) => { setSelectedSystem(e.target.value); setResult(null); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
          >
            <option value="">-- Choose a system --</option>
            {SYSTEMS.map(sys => (
              <option key={sys.id} value={sys.id}>{sys.name} ({sys.desc})</option>
            ))}
          </select>
          <button 
            onClick={runSimulation} 
            disabled={!selectedSystem || loading}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'Running Simulation...' : 'Run Failure Simulation'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="text-red-500 mr-2" size={24} />
              Simulation Results: {result.target_system}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Business Risk</p>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(result.business_risk)}`}>
                  {result.business_risk}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <Users className="text-blue-500 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Users Impacted</p>
                  <p className="text-2xl font-bold text-gray-800">{result.estimated_users_impacted.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <Building className="text-purple-500 mr-3" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Departments Affected</p>
                  <p className="text-lg font-bold text-gray-800">{result.affected_departments.length}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Cascade Impact:</p>
              <div className="flex flex-wrap gap-2">
                {result.affected_services.map((service, idx) => (
                  <span key={service} className={`px-3 py-1 rounded-full text-sm font-medium ${idx === 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                    {idx === 0 ? '🔥 ' : '➔ '}{service}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">{result.simulation_message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}