import { FinancialData, HistoricalPricePoint } from '../types';

// Numbers are in millions USD for demonstration
const mockFinancialData: Record<string, FinancialData> = {
  RELIANCE: [
    { year: 2023, revenue: 90000, netIncome: 9500, totalAssets: 150000, totalLiabilities: 70000, shareholdersEquity: 80000, dividendsPaid: 2000, cashFromOps: 12000, marketCap: 200000, peRatio: 21.0, dividendYield: 1.0, marketPrice: 2850.75 },
    { year: 2022, revenue: 85000, netIncome: 8000, totalAssets: 140000, totalLiabilities: 65000, shareholdersEquity: 75000, dividendsPaid: 1800, cashFromOps: 11000 },
    { year: 2021, revenue: 75000, netIncome: 7000, totalAssets: 130000, totalLiabilities: 60000, shareholdersEquity: 70000, dividendsPaid: 1500, cashFromOps: 10000 },
  ],
  TCS: [
    { year: 2023, revenue: 25000, netIncome: 5000, totalAssets: 20000, totalLiabilities: 5000, shareholdersEquity: 15000, dividendsPaid: 3000, cashFromOps: 5500, marketCap: 150000, peRatio: 30.0, dividendYield: 1.2, marketPrice: 3810.20 },
    { year: 2022, revenue: 23000, netIncome: 4500, totalAssets: 18000, totalLiabilities: 4000, shareholdersEquity: 14000, dividendsPaid: 2800, cashFromOps: 5000 },
    { year: 2021, revenue: 21000, netIncome: 4000, totalAssets: 16000, totalLiabilities: 3500, shareholdersEquity: 12500, dividendsPaid: 2500, cashFromOps: 4500 },
  ],
  HDFCBANK: [
    { year: 2023, revenue: 20000, netIncome: 4000, totalAssets: 250000, totalLiabilities: 220000, shareholdersEquity: 30000, dividendsPaid: 1000, cashFromOps: 8000, marketCap: 120000, peRatio: 20.5, dividendYield: 0.8, marketPrice: 1550.45 },
    { year: 2022, revenue: 18000, netIncome: 3500, totalAssets: 230000, totalLiabilities: 205000, shareholdersEquity: 25000, dividendsPaid: 900, cashFromOps: 7500 },
    { year: 2021, revenue: 16000, netIncome: 3000, totalAssets: 210000, totalLiabilities: 190000, shareholdersEquity: 20000, dividendsPaid: 800, cashFromOps: 7000 },
  ],
   INFY: [
    { year: 2023, revenue: 18000, netIncome: 3600, totalAssets: 15000, totalLiabilities: 3000, shareholdersEquity: 12000, dividendsPaid: 2000, cashFromOps: 4000, marketCap: 80000, peRatio: 25.0, dividendYield: 1.5, marketPrice: 1605.00 },
    { year: 2022, revenue: 16500, netIncome: 3300, totalAssets: 14000, totalLiabilities: 2800, shareholdersEquity: 11200, dividendsPaid: 1800, cashFromOps: 3800 },
    { year: 2021, revenue: 15000, netIncome: 3000, totalAssets: 13000, totalLiabilities: 2500, shareholdersEquity: 10500, dividendsPaid: 1500, cashFromOps: 3500 },
  ],
   SBIN: [
    { year: 2023, revenue: 40000, netIncome: 5000, totalAssets: 600000, totalLiabilities: 550000, shareholdersEquity: 50000, dividendsPaid: 1200, cashFromOps: 15000, marketCap: 75000, peRatio: 8.0, dividendYield: 2.5, marketPrice: 830.60 },
    { year: 2022, revenue: 38000, netIncome: 4200, totalAssets: 580000, totalLiabilities: 535000, shareholdersEquity: 45000, dividendsPaid: 1000, cashFromOps: 14000 },
    { year: 2021, revenue: 36000, netIncome: 3000, totalAssets: 560000, totalLiabilities: 520000, shareholdersEquity: 40000, dividendsPaid: 800, cashFromOps: 12000 },
  ],
  // Add more mock data for other companies...
};

// Fill remaining companies with placeholder data for demo purposes
import { NIFTY_100_COMPANIES } from '../constants';
for (const company of NIFTY_100_COMPANIES) {
    if (!mockFinancialData[company.id]) {
        const randomFactor = 1 + (Math.random() - 0.5) * 0.4; // between 0.8 and 1.2
        mockFinancialData[company.id] = [
            { year: 2023, revenue: 15000 * randomFactor, netIncome: 2500 * randomFactor, totalAssets: 18000 * randomFactor, totalLiabilities: 7000 * randomFactor, shareholdersEquity: 11000 * randomFactor, dividendsPaid: 800 * randomFactor, cashFromOps: 3000 * randomFactor, marketCap: 30000 * randomFactor, peRatio: 15 + Math.random() * 10, dividendYield: 0.5 + Math.random() * 2, marketPrice: 500 + Math.random() * 2500 },
            { year: 2022, revenue: 14000 * randomFactor, netIncome: 2200 * randomFactor, totalAssets: 16000 * randomFactor, totalLiabilities: 6000 * randomFactor, shareholdersEquity: 10000 * randomFactor, dividendsPaid: 700 * randomFactor, cashFromOps: 2800 * randomFactor },
            { year: 2021, revenue: 13000 * randomFactor, netIncome: 1900 * randomFactor, totalAssets: 14000 * randomFactor, totalLiabilities: 5000 * randomFactor, shareholdersEquity: 9000 * randomFactor, dividendsPaid: 600 * randomFactor, cashFromOps: 2500 * randomFactor },
        ];
    }
}


export const fetchFinancialData = (companyId: string): Promise<FinancialData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockFinancialData[companyId]) {
        resolve(mockFinancialData[companyId]);
      } else {
        reject(new Error('Company data not found.'));
      }
    }, 500 + Math.random() * 500); // Simulate network latency
  });
};

export const fetchHistoricalStockData = (companyId: string): Promise<HistoricalPricePoint[]> => {
    return new Promise((resolve) => {
        const data: HistoricalPricePoint[] = [];
        const basePrice = mockFinancialData[companyId]?.[0]?.marketPrice || 1000 + Math.random() * 1500;
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 89); // Start 89 days ago to have 90 data points including today

        let price = basePrice * (0.9 + Math.random() * 0.2); // Start price somewhere around the base price

        for (let i = 0; i < 90; i++) {
            const dateStr = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getDate()}`;
            data.push({ date: dateStr, price: parseFloat(price.toFixed(2)) });

            // Fluctuation with a slight upward trend
            const fluctuation = (Math.random() - 0.48) * 0.05 * price; 
            price += fluctuation;
            if (price < 0) price = 0; // Price can't be negative
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setTimeout(() => {
            resolve(data);
        }, 600 + Math.random() * 600);
    });
};
