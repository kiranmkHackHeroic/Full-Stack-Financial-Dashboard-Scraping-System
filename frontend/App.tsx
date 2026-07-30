import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CompanyDetail from './components/CompanyDetail';
import Login from './components/Login';

const App: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash) {
        setSelectedCompanyId(hash);
      } else {
        setSelectedCompanyId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleSelectCompany = (companyId: string) => {
    window.location.hash = `/${companyId}`;
  };

  const handleBackToDashboard = () => {
    window.location.hash = '';
  };

  const handleLoginSuccess = (newToken: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    window.location.hash = ''; // Reset selection on logout
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header username={username} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        {!token ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : selectedCompanyId ? (
          <CompanyDetail companyId={selectedCompanyId} onBack={handleBackToDashboard} />
        ) : (
          <Dashboard onSelectCompany={handleSelectCompany} />
        )}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by React & Gemini Insights. Data is for demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
