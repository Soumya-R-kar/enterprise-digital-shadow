import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Users, Building, Activity, Server } from 'lucide-react';

export default function Simulator() {
  const navigate = useNavigate();
  const [selectedSystem, setSelectedSystem] = useState('payment-db');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/simulate?system_id=${selectedSystem}`, {
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
    if (risk === 'CRITICAL') return 'text-red-600 bg-red-100 border-red-300';
    if (risk === 'HIGH') return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-yellow-600 bg-yellow-100 border-yellow-300';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">What-If Impact Simulator</h1>
      <p className="text-gray-500 mb-8">Simulate a system failure to predict downstream business impact.</p>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select System to Simulate Failure</label>
            <select 
              value={selectedSystem} 
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <optgroup label="Payment Systems">
                <option value="payment-db">Payment Database</option>
                <option value="payment-api">Payment API</option>
                <option value="payment-service">Payment Service</option>
                <option value="checkout-ui">Checkout UI</option>
                <option value="customer-app">Customer App</option>
              </optgroup>
              <optgroup label="Authentication Systems">
                <option value="auth-db">Authentication Database</option>
                <option value="auth-api">Auth API</option>
                <option value="user-portal">User Portal</option>
              </optgroup>
            </select>
          </div>
          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
            <AlertTriangle size={18} className="ml-2" />
          </button>
        </div>
      </div>

      {result && (
        <div className="animate-fade-in">
          <div className={`p-6 rounded-lg border-l-4 mb-6 ${getRiskColor(result.business_risk)}`}>
            <h2 className="text-xl font-bold flex items-center">
              <AlertTriangle className="mr-2" size={24} />
              Predicted Impact: {result.business_risk}
            </h2>
            <p className="mt-2 text-gray-700">{result.simulation_message}</p>
            {result.system_description && (
              <p className="mt-1 text-sm text-gray-600 italic">{result.system_description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-blue-600 mb-3">
                <Users size={24} className="mr-2" />
                <span className="font-semibold">Users Impacted</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{result.estimated_users_impacted.toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-purple-600 mb-3">
                <Building size={24} className="mr-2" />
                <span className="font-semibold">Affected Departments</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.affected_departments.map(dept => (
                  <span key={dept} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-green-600 mb-3">
                <Server size={24} className="mr-2" />
                <span className="font-semibold">Cascading Services</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.affected_services.map(svc => (
                  <span key={svc} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}