import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import Simulator from './pages/Simulator';
import DependencyGraph from './pages/DependencyGraph';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/incident/:id" element={<IncidentDetail />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/graph" element={<DependencyGraph />} />
      </Routes>
    </Router>
  );
}

export default App;