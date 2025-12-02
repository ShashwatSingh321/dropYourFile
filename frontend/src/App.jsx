import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileView from './pages/MobileView';
import GlobalView from './pages/GlobalView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/mobile" element={<MobileView />} />
          <Route path="/global" element={<GlobalView />} />
          <Route path="/" element={<Navigate to="/mobile" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;