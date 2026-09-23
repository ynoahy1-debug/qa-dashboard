import React from 'react';
import { QAProvider, useQA } from './context/QAContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { CallList } from './components/CallList';
import { CallEvaluationModal } from './components/CallEvaluationModal';
import { AdminDashboard } from './components/AdminDashboard';

const MainAppContent = () => {
  const { isAuthenticated, activeTab } = useQA();

  // If user is not logged in, show full screen Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {activeTab === 'calls' ? (
          <>
            <FilterBar />
            <CallList />
            <CallEvaluationModal />
          </>
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <QAProvider>
      <MainAppContent />
    </QAProvider>
  );
}
