import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationBar } from './components/NavigationBar';
import { navItems } from './data/nav';
import IntroductionPage from './pages/IntroductionPage';
import NotesPage from './pages/NotesPage';
import ToolsPage from './pages/ToolsPage';
import PhotoPage from './pages/PhotoPage';
import { PhotoDetail } from './pages/PhotoPage/PhotoDetail';

export default function App() {
  return (
    <HashRouter>
      <NavigationBar items={navItems} />
      <div className="App-content">
        <Routes>
          <Route path="/" element={<Navigate to="/introduction" replace />} />
          <Route path="/introduction" element={<IntroductionPage />} />
          <Route path="/notes/*" element={<NotesPage />} />
          <Route path="/tools/*" element={<ToolsPage />} />
          <Route path="/photos" element={<PhotoPage />} />
          <Route path="/photos/:albumId" element={<PhotoDetail />} />
          <Route path="*" element={<Navigate to="/introduction" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
