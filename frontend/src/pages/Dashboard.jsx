import { useState, useEffect } from 'react';
import { AlertTriangle, Server, Database, Activity, RefreshCw, GitBranch } from 'lucide-react';

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [orgRisk, setOrgRisk] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch incidents from backend
  const fetchIncidents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/incidents/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIncidents(data);
      
      // Calculate overall risk (average of all incidents)
      if (data.length > 0) {
        const avgRisk = data.reduce((sum, inc) => sum + inc.risk_score, 0) / data.length;
        setOrgRisk(Math.round(avgRisk));
      } else {
        setOrgRisk(0);
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      setError("Cannot connect to backend. Make sure the server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and auto-refresh every 10 seconds
  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      'CRITICAL': 'bg-red-100 text-red-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-green-100 text-green-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header with all navigation buttons */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Enterprise Digital Shadow</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.href = '/graph'}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <GitBranch size={16} className="mr-2" />
            Dependency Graph
          </button>
          <button 
            onClick={() => window.location.href = '/simulator'}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Activity size={16} className="mr-2" />
            What-If Simulator
          </button>
          <button 
            onClick={fetchIncidents}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium">Organization Risk</p>
          <p className={`text-4xl font-bold mt-2 ${getRiskColor(orgRisk).split(' ')[0]}`}>
            {loading ? '...' : `${orgRisk}/100`}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 flex items-center">
          <Server className="text-green-500 mr-4" size={32}/>
          <div>
            <p className="text-gray-500 text-sm font-medium">Servers Online</p>
            <p className="text-2xl font-bold text-gray-800">98%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 flex items-center">
          <Database className="text-purple-500 mr-4" size={32}/>
          <div>
            <p className="text-gray-500 text-sm font-medium">DB Health</p>
            <p className="text-2xl font-bold text-gray-800">91%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 flex items-center">
          <Activity className="text-red-500 mr-4" size={32}/>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Incidents</p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '...' : incidents.length}
            </p>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          <AlertTriangle className="text-orange-500 mr-2" size={20}/> 
          Active Emerging Problems
        </h2>
        
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24}/>
            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-green-500 mb-2">
              <Server size={48} className="mx-auto"/>
            </div>
            <p className="text-gray-500 font-medium">No active incidents</p>
            <p className="text-gray-400 text-sm mt-1">System is healthy. All metrics are normal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4">Incident ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidents.map(inc => (
                  <tr 
                    key={inc.incident_id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/incident/${inc.incident_id}`}
                  >
                    <td className="p-4 font-mono text-sm text-gray-600">{inc.incident_id}</td>
                    <td className="p-4 font-medium text-gray-800">{inc.title}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(inc.risk_score)}`}>
                        {inc.risk_score}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}