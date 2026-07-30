
import React from 'react';

interface HeaderProps {
  username: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700/50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
            ML Financial Analysis System
          </h1>
        </div>

        {username && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300 text-sm hidden sm:inline">
              Hello, <span className="text-cyan-400 font-bold">{username}</span>
            </span>
            <button
              onClick={onLogout}
              className="bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 text-red-300 text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02]"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
