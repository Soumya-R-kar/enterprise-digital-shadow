import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, TrendingUp, Users, Building, Zap, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SYSTEMS = [
  { id: 'payment-db', name: 'Payment Database', desc: 'Core payment transaction database', icon: '💾' },
  { id: 'payment-api', name: 'Payment API', desc: 'Payment processing API gateway', icon: '🔌' },
  { id: 'auth-db', name: 'Authentication Database', desc: 'User credentials and authentication data', icon: '🔐' },
  { id: 'auth-api', name: 'Auth API', desc: 'Authentication and authorization service', icon: '🛡️' }
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

  const getRiskGradient = (risk) => {
    if (risk === 'CRITICAL') return 'from-red-600 to-red-500';
    if (risk === 'HIGH') return 'from-orange-600 to-orange-500';
    return 'from-yellow-600 to-orange-500';
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="glass text-gray-300 px-6 py-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 mb-6 animate-fade-in"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 flex items-center">
            <TrendingUp className="mr-4 text-blue-400" size={48} />
            <span className="gradient-text">What-If Simulator</span>
          </h1>
          <p className="text-gray-400 text-xl">Predict the business impact of hypothetical system failures</p>
        </div>

        {/* Simulator Card */}
        <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
          <label className="block text-white text-lg font-medium mb-4">
            Select a system to simulate failure:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {SYSTEMS.map(sys => (
              <button
                key={sys.id}
                onClick={() => { setSelectedSystem(sys.id); setResult(null); }}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedSystem === sys.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-4xl mb-3">{sys.icon}</div>
                <p className="text-white font-bold text-lg mb-1">{sys.name}</p>
                <p className="text-gray-400 text-sm">{sys.desc}</p>
              </button>
            ))}
          </div>
          <button 
            onClick={runSimulation} 
            disabled={!selectedSystem || loading}
            className="w-full btn-danger text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                Running Simulation...
              </>
            ) : (
              <>
                <Zap size={24} />
                Run Failure Simulation
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="glass rounded-2xl p-8 animate-fade-in border-l-4 border-red-500">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <AlertTriangle className="text-red-400 mr-3" size={32} />
              Simulation Results
            </h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <Shield className="mx-auto mb-3 text-red-400" size={40} />
                <p className="text-gray-400 text-sm mb-2">Business Risk</p>
                <span className={`inline-block bg-gradient-to-r ${getRiskGradient(result.business_risk)} px-6 py-2 rounded-full text-white font-bold`}>
                  {result.business_risk}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <Users className="mx-auto mb-3 text-blue-400" size={40} />
                <p className="text-gray-400 text-sm mb-2">Users Impacted</p>
                <p className="text-4xl font-bold text-white">{result.estimated_users_impacted.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <Building className="mx-auto mb-3 text-purple-400" size={40} />
                <p className="text-gray-400 text-sm mb-2">Departments</p>
                <p className="text-4xl font-bold text-white">{result.affected_departments.length}</p>
              </div>
            </div>

            {/* Cascade Impact */}
            <div className="mb-8">
              <p className="text-white text-lg font-medium mb-4">Cascade Impact:</p>
              <div className="flex flex-wrap gap-3">
                {result.affected_services.map((service, idx) => (
                  <div 
                    key={service} 
                    className={`px-5 py-3 rounded-xl font-medium ${
                      idx === 0 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 text-white' 
                        : 'bg-white/10 text-gray-300 border border-white/20'
                    }`}
                  >
                    {idx === 0 ? '🔥 ' : '➔ '}{service}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-xl p-6">
              <p className="text-white text-lg font-medium">{result.simulation_message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}