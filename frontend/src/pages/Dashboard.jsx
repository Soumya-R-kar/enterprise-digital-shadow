import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Activity, Shield, TrendingUp, Zap, Clock, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/incidents/`)
      .then(res => res.json())
      .then(data => {
        setIncidents(data);
        setStats({
          total: data.length,
          critical: data.filter(i => i.severity === 'CRITICAL').length,
          high: data.filter(i => i.severity === 'HIGH').length,
          medium: data.filter(i => i.severity === 'MEDIUM').length
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch incidents:", err);
        setLoading(false);
      });
  }, []);

  const getRiskColor = (score) => {
    if (score >= 80) return 'from-red-600 to-red-500';
    if (score >= 60) return 'from-orange-600 to-orange-500';
    return 'from-yellow-600 to-yellow-500';
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      'CRITICAL': 'bg-red-500/20 text-red-400 border-red-500/50',
      'HIGH': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      'MEDIUM': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    };
    return colors[severity] || colors['MEDIUM'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2 flex items-center">
              <Shield className="mr-4 text-blue-400" size={48} />
              <span className="gradient-text">Digital Shadow</span>
            </h1>
            <p className="text-gray-400 text-lg">AI-Powered Predictive Incident Management</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/graph')} 
              className="glass text-gray-300 px-6 py-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
            >
              <Activity size={20} /> Dependency Graph
            </button>
            <button 
              onClick={() => navigate('/simulator')} 
              className="btn-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium"
            >
              <TrendingUp size={20} /> What-If Simulator
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Zap className="text-blue-400" size={24} />
              </div>
              <span className="text-gray-500 text-sm">Total</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
            <p className="text-gray-400 text-sm mt-1">Active Incidents</p>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <AlertTriangle className="text-red-400" size={24} />
              </div>
              <span className="text-gray-500 text-sm">Critical</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.critical}</p>
            <p className="text-gray-400 text-sm mt-1">Requires Attention</p>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <Clock className="text-orange-400" size={24} />
              </div>
              <span className="text-gray-500 text-sm">High</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.high}</p>
            <p className="text-gray-400 text-sm mt-1">High Priority</p>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Users className="text-purple-400" size={24} />
              </div>
              <span className="text-gray-500 text-sm">Systems</span>
            </div>
            <p className="text-4xl font-bold text-white">8</p>
            <p className="text-gray-400 text-sm mt-1">Monitored</p>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl overflow-hidden animate-fade-in">
          <div className="px-8 py-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <AlertTriangle className="mr-3 text-red-400" size={28} />
              Active Incidents
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left">
                  <th className="px-8 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Incident ID</th>
                  <th className="px-8 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Title</th>
                  <th className="px-8 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Severity</th>
                  <th className="px-8 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Risk Score</th>
                  <th className="px-8 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-16 text-center">
                      <div className="text-gray-500">
                        <Shield size={64} className="mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium text-gray-400">System is Healthy</p>
                        <p className="text-sm mt-2">No incidents detected</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  incidents.map((incident, idx) => (
                    <tr key={incident.id} className="hover:bg-white/5 transition-colors animate-slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <td className="px-8 py-6">
                        <span className="font-mono text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-lg">
                          {incident.incident_id}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-semibold text-white">{incident.title}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase border ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${getRiskColor(incident.risk_score)} transition-all duration-500`}
                              style={{ width: `${incident.risk_score}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-bold text-lg">{incident.risk_score}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => navigate(`/incident/${incident.incident_id}`)}
                          className="btn-primary text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                          Investigate
                          <span>→</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}