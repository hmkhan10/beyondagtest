import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import TestRun from './pages/TestRun';
import Report from './pages/Report';
import Agents from './pages/Agents';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<TestRun />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
