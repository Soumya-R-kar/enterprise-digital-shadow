import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Activity, Shield, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/incidents/`)
      .then(res => res.json())
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch incidents:", err);
        setLoading(false);
      });
  }, []);

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-100 border-red-200';
    if (score >= 60) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-yellow-600 bg-yellow-100 border-yellow-200';
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Shield className="text-blue-600 mr-3" size={32} />
            Enterprise Digital Shadow
          </h1>
          <p className="text-gray-500 mt-1">Real-time predictive incident management</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/graph')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
            <Activity size={18} className="mr-2" /> Dependency Graph
          </button>
          <button onClick={() => navigate('/simulator')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <TrendingUp size={18} className="mr-2" /> What-If Simulator
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Active Incidents</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-6 py-3">Incident ID</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">Risk Score</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No incidents detected. System is healthy.</td></tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{incident.incident_id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{incident.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                      incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                      incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(incident.risk_score)}`}>
                      {incident.risk_score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center text-sm text-gray-600">
                      <AlertTriangle size={14} className="mr-1 text-orange-500" /> {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/incident/${incident.incident_id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Investigate →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}