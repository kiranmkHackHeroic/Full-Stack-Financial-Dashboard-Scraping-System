
import React, { useState, useMemo } from 'react';
import { NIFTY_100_COMPANIES } from '../constants';
import { Company } from '../types';
import InternTask from './InternTask';

interface DashboardProps {
  onSelectCompany: (companyId: string) => void;
}

const CompanyCard: React.FC<{ company: Company; onClick: () => void }> = ({ company, onClick }) => (
  <div
    onClick={onClick}
    className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-cyan-500"
  >
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center font-bold text-cyan-400">
        {company.name.substring(0, 2).toUpperCase()}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{company.name}</h3>
        <p className="text-sm text-gray-400">{company.id}</p>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onSelectCompany }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) {
      return NIFTY_100_COMPANIES;
    }
    return NIFTY_100_COMPANIES.filter(
      company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Nifty 100 Analysis</h2>
        <p className="text-gray-400">Select a company to view its AI-powered financial insights.</p>
      </div>
      
      <InternTask />

      <div className="sticky top-0 bg-gray-900 py-4 z-10">
        <input
          type="text"
          placeholder="Search for a company (e.g., TCS, Reliance)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
        />
      </div>
      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <CompanyCard key={company.id} company={company} onClick={() => onSelectCompany(company.id)} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16">
            <p className="text-gray-400">No companies found for your search.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;