import React, { useState, useEffect, useRef } from 'react';
import { NIFTY_100_COMPANIES } from '../constants';
import { fetchFinancialData, fetchHistoricalStockData } from '../services/financialApi';
import { analyzeFinancials } from '../lib/analysis';
import { AnalysisResult, NewsArticle, HistoricalPricePoint } from '../types';
import Loader from './Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchCompanyNews } from '../services/geminiApi';
import HistoricalStockChart from './HistoricalStockChart';

interface CompanyDetailProps {
  companyId: string;
  onBack: () => void;
}

const InsightCard: React.FC<{ title: string; insights: string[]; type: 'pro' | 'con' }> = ({ title, insights, type }) => {
  const iconColor = type === 'pro' ? 'text-green-400' : 'text-red-400';
  const borderColor = type === 'pro' ? 'border-green-500/30' : 'border-red-500/30';
  const icon = type === 'pro' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
  );

  return (
    <div className={`bg-gray-800 rounded-lg p-6 shadow-lg border ${borderColor}`}>
      <div className="flex items-center mb-4">
        <div className={`mr-3 ${iconColor}`}>{icon}</div>
        <h3 className={`text-xl font-semibold ${iconColor}`}>{title}</h3>
      </div>
      <ul className="space-y-3 text-gray-300">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start">
            <span className={`mr-3 mt-1 ${iconColor}`}>&#10003;</span>
            <span>{insight}</span>
          </li>
        ))}
        {insights.length === 0 && <li className="text-gray-400">No specific items to highlight.</li>}
      </ul>
    </div>
  );
};

const CompanyDetail: React.FC<CompanyDetailProps> = ({ companyId, onBack }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [news, setNews] = useState<{ summary: string; articles: NewsArticle[] } | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  
  const [historicalData, setHistoricalData] = useState<HistoricalPricePoint[] | null>(null);
  const [historicalLoading, setHistoricalLoading] = useState(true);
  const [historicalError, setHistoricalError] = useState<string | null>(null);

  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [email, setEmail] = useState('');
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  const [alertConfig, setAlertConfig] = useState<{ target: number; email: string; direction: 'above' | 'below' } | null>(null);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const prevPriceRef = useRef<number | null>(null);
  const [formError, setFormError] = useState<{ target?: string; email?: string } | null>(null);
  const [alertJustSet, setAlertJustSet] = useState(false);

  const company = NIFTY_100_COMPANIES.find(c => c.id === companyId);

  useEffect(() => {
    // Reset alert state when company changes
    setAlertConfig(null);
    setAlertTriggered(false);
    setTargetPrice('');
    setEmail('');

    const getAnalysis = async () => {
      if (!company) {
        setError('Company not found.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFinancialData(company.id);
        const result = analyzeFinancials(company.name, data);
        setAnalysis({ ...result, companyId: company.id, companyName: company.name });
         if (result.latestMetrics?.marketPrice) {
          setCurrentPrice(result.latestMetrics.marketPrice);
          prevPriceRef.current = result.latestMetrics.marketPrice;
        } else {
          setCurrentPrice(null);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    getAnalysis();
  }, [companyId, company]);

  useEffect(() => {
    const getNews = async () => {
        if (!company) return;
        try {
            setNewsLoading(true);
            setNewsError(null);
            const newsData = await fetchCompanyNews(company.name);
            setNews(newsData);
        } catch (e) {
            setNewsError((e as Error).message);
        } finally {
            setNewsLoading(false);
        }
    };
    getNews();
  }, [companyId, company]);

  useEffect(() => {
    const getHistoricalData = async () => {
        if (!company) return;
        try {
            setHistoricalLoading(true);
            setHistoricalError(null);
            const data = await fetchHistoricalStockData(company.id);
            setHistoricalData(data);
        } catch (e) {
            setHistoricalError("Could not load historical price chart.");
        } finally {
            setHistoricalLoading(false);
        }
    };
    getHistoricalData();
  }, [companyId, company]);
  
  useEffect(() => {
    if (!analysis?.latestMetrics?.marketPrice) return;

    const intervalId = setInterval(() => {
      setCurrentPrice(prevPrice => {
        if (prevPrice === null) return null;
        prevPriceRef.current = prevPrice;
        const fluctuation = (Math.random() - 0.5) * 0.01 * prevPrice;
        return prevPrice + fluctuation;
      });
    }, 2000); // Update price every 2 seconds

    return () => clearInterval(intervalId);
  }, [analysis]);

  useEffect(() => {
    if (!alertConfig || alertTriggered || currentPrice === null) return;

    const { target, direction, email: alertEmail } = alertConfig;
    let triggered = false;

    if (direction === 'above' && currentPrice >= target) {
      triggered = true;
    } else if (direction === 'below' && currentPrice <= target) {
      triggered = true;
    }

    if (triggered) {
      const message = `${company?.name} price alert! Current price $${currentPrice.toFixed(2)} has reached your target of ${direction} $${target.toFixed(2)}.`;
      alert(message);
      console.log(`Notification for ${alertEmail}: ${message}`);
      setAlertTriggered(true);
    }
  }, [currentPrice, alertConfig, alertTriggered, company?.name]);

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const target = parseFloat(targetPrice);
    const errors: { target?: string; email?: string } = {};

    if (!target || target <= 0) {
      errors.target = 'Please enter a valid, positive price.';
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email address.';
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
    
    const confirmed = window.confirm(
      `Are you sure you want to set this alert?\n\n` +
      `Company: ${company?.name}\n` +
      `Condition: Price ${alertDirection} $${target.toFixed(2)}\n` +
      `Notify: ${email}`
    );

    if (confirmed) {
        setAlertConfig({ target, email, direction: alertDirection });
        setAlertTriggered(false);
        setAlertJustSet(true);
        setTimeout(() => setAlertJustSet(false), 3000); // Show success message for 3 seconds
    }
  };

  const handleCancelAlert = () => {
    setAlertConfig(null);
    setAlertTriggered(false);
    setTargetPrice('');
    setEmail('');
    setAlertJustSet(false);
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-400 p-8">{error}</div>;
  if (!analysis || !company) return null;
  
  const latestMetrics = analysis.latestMetrics;
  
  const priceChangeColor = currentPrice === null || prevPriceRef.current === null || currentPrice === prevPriceRef.current
    ? 'text-cyan-400'
    : currentPrice > prevPriceRef.current
    ? 'text-green-400'
    : 'text-red-400';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-4">
            {company.logoUrl ? (
                <img 
                    src={company.logoUrl} 
                    alt={`${company.name} logo`} 
                    className="w-16 h-16 rounded-lg object-contain bg-white p-1 shadow-lg"
                />
            ) : (
                <div className="flex-shrink-0 w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center font-bold text-cyan-400 text-2xl">
                    {company.name.substring(0, 2).toUpperCase()}
                </div>
            )}
            <div>
              <h2 className="text-3xl font-bold text-white">{analysis.companyName}</h2>
              <p className="text-gray-400">{analysis.companyId}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InsightCard title="Key Strengths" insights={analysis.pros} type="pro" />
        <InsightCard title="Key Weaknesses" insights={analysis.cons} type="con" />
      </div>

      {latestMetrics && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Key Financial Ratios</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            {latestMetrics.marketCap != null && (
              <div>
                <p className="text-sm text-gray-400">Market Cap (USD)</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {latestMetrics.marketCap >= 1000
                    ? `$${(latestMetrics.marketCap / 1000).toFixed(1)}B`
                    : `$${latestMetrics.marketCap.toFixed(0)}M`}
                </p>
              </div>
            )}
            {latestMetrics.peRatio != null && (
              <div>
                <p className="text-sm text-gray-400">P/E Ratio</p>
                <p className="text-2xl font-bold text-cyan-400">{latestMetrics.peRatio.toFixed(1)}</p>
              </div>
            )}
            {latestMetrics.dividendYield != null && (
              <div>
                <p className="text-sm text-gray-400">Dividend Yield</p>
                <p className="text-2xl font-bold text-cyan-400">{latestMetrics.dividendYield.toFixed(2)}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Return on Equity (ROE) Trend</h3>
         <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="year" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} 
                  labelStyle={{ color: '#E2E8F0' }}
                />
                <Legend wrapperStyle={{color: '#E2E8F0'}}/>
                <Bar dataKey="roe" fill="#2DD4BF" name="ROE (%)" />
            </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Stock Price Alert</h3>
        {latestMetrics?.marketPrice ? (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-400">Current Market Price (USD)</p>
              <p className={`text-4xl font-bold ${priceChangeColor} transition-colors duration-500`}>
                {currentPrice !== null ? `$${currentPrice.toFixed(2)}` : 'N/A'}
              </p>
            </div>

            {alertConfig && !alertTriggered && (
              <div className="text-center bg-gray-700 p-4 rounded-lg">
                {alertJustSet && (
                   <p className="text-green-400 font-semibold mb-2 animate-pulse">✅ Alert set successfully!</p>
                )}
                <p className="text-gray-300 mt-1">
                  We will notify <span className="font-bold">{alertConfig.email}</span> when the price goes {alertConfig.direction} <span className="font-bold">${alertConfig.target.toFixed(2)}</span>.
                </p>
                <button onClick={handleCancelAlert} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Cancel Alert
                </button>
              </div>
            )}

            {alertTriggered && (
              <div className="text-center bg-gray-700 p-4 rounded-lg">
                <p className="text-cyan-400 font-semibold">Alert Triggered!</p>
                <p className="text-gray-300 mt-1">
                  Price target of ${alertConfig?.target.toFixed(2)} was reached.
                </p>
                <button onClick={handleCancelAlert} className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Set New Alert
                </button>
              </div>
            )}

            {!alertConfig && (
              <form onSubmit={handleSetAlert} className="space-y-4 max-w-sm mx-auto">
                <div>
                  <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-300 mb-1">Target Price ($)</label>
                  <input type="number" id="targetPrice" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)}
                    className={`w-full p-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${formError?.target ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-cyan-500'}`}
                    placeholder="e.g., 1550.50" step="0.01"
                  />
                  {formError?.target && <p className="text-red-400 text-xs mt-1 px-1">{formError.target}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email for Notification</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${formError?.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-cyan-500'}`}
                    placeholder="you@example.com"
                  />
                  {formError?.email && <p className="text-red-400 text-xs mt-1 px-1">{formError.email}</p>}
                </div>
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-300 mb-2">Condition</legend>
                  <div className="flex gap-x-6 justify-center">
                    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                      <input type="radio" name="alertDirection" value="above" checked={alertDirection === 'above'} onChange={() => setAlertDirection('above')}
                        className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500 focus:ring-offset-gray-800"
                      />
                      <span>Price is Above</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                      <input type="radio" name="alertDirection" value="below" checked={alertDirection === 'below'} onChange={() => setAlertDirection('below')}
                        className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500 focus:ring-offset-gray-800"
                      />
                      <span>Price is Below</span>
                    </label>
                  </div>
                </fieldset>
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Set Alert
                </button>
              </form>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-center">Market price data is not available for this company.</p>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Latest News & Insights</h3>
        {newsLoading && <Loader />}
        {newsError && <p className="text-red-400 text-center">{newsError}</p>}
        {news && (
            <div className="space-y-6">
                <p className="text-gray-300 whitespace-pre-wrap">{news.summary}</p>
                {news.articles.length > 0 && (
                  <div>
                      <h4 className="font-semibold text-gray-200 mb-3">Sources:</h4>
                      <ul className="space-y-2 list-disc list-inside">
                          {news.articles.map((article, index) => (
                              <li key={index}>
                                  <a 
                                      href={article.uri} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                                      aria-label={`Read more about ${article.title}`}
                                  >
                                      {article.title}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
                )}
            </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Historical Stock Price (90-day Trend)</h3>
        {historicalLoading && <Loader />}
        {historicalError && <p className="text-red-400 text-center">{historicalError}</p>}
        {historicalData && !historicalLoading && !historicalError && (
            <HistoricalStockChart data={historicalData} />
        )}
      </div>

    </div>
  );
};

export default CompanyDetail;