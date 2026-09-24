import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AIChatDrawer from './components/AIChatDrawer';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Hubs from './pages/Hubs';
import Inventory from './pages/Inventory';
import Routing from './pages/Routing';
import Analytics from './pages/Analytics';
import AIAdvisor from './pages/AIAdvisor';
import Settings from './pages/Settings';

function ProtectedLayout({ children, onOpenAIAdvisor }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Authenticating UrbanLogix Fleet Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar onOpenAIAdvisor={onOpenAIAdvisor} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onOpenAIAdvisor={onOpenAIAdvisor} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected application views */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout onOpenAIAdvisor={() => setIsAIChatOpen(true)}>
              <Dashboard onOpenAIAdvisor={() => setIsAIChatOpen(true)} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/hubs"
          element={
            <ProtectedLayout onOpenAIAdvisor={() => setIsAIChatOpen(true)}>
              <Hubs />
            </ProtectedLayout>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedLayout onOpenAIAdvisor={() => setIsAIChatOpen(true)}>
              <Inventory />
            </ProtectedLayout>
          }
        />
        <Route
          path="/routing"
          element={
            <ProtectedLayout onOpenAIAdvisor={() => setIsAIChatOpen(true)}>
              <Routing />
            </ProtectedLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedLayout onOpenAIAdvisor={() => setIsAIChatOpen(true)}>
              <Analytics />
            </ProtectedLayout>
          }
        />
        <Route
          path="/ai-advisor"
          element={
            <ProtectedLayout onOpenAIAdvisor={() => setIsAIChatOpen(true)}>
              <AIAdvisor />
            </ProtectedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedLayout onOpenAIAdvisor={() => setIsAIChatOpen(true)}>
              <Settings />
            </ProtectedLayout>
          }
        />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global Slide-Over AI Chat Drawer */}
      <AIChatDrawer isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
}
