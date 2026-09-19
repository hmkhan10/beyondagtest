import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TestRun from './pages/TestRun';
import Report from './pages/Report';
import Agents from './pages/Agents';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test" element={<TestRun />} />
      <Route path="/report/:id" element={<Report />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
