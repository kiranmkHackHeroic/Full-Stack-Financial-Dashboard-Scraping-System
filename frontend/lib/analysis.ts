import { FinancialData, FinancialMetric } from '../types';

type Metric = {
  name: string;
  value: number;
  isPro: boolean;
  description: (name: string, value: number) => string;
};

export const analyzeFinancials = (companyName: string, data: FinancialData) => {
  const latestYearData = data[0];
  const previousYearData = data[1] || latestYearData;

  if (!latestYearData) {
    return { pros: [], cons: [], chartData: [], latestMetrics: null };
  }
  
  const metrics: Metric[] = [];

  // 1. Return on Equity (ROE)
  if (latestYearData.shareholdersEquity > 0) {
    const roe = (latestYearData.netIncome / latestYearData.shareholdersEquity) * 100;
    metrics.push({
      name: 'Return on Equity (ROE)',
      value: roe,
      isPro: roe > 10,
      description: (name, val) => `${name} shows strong profitability with an ROE of ${val.toFixed(1)}%.`,
    });
  }

  // 2. Debt to Equity Ratio
  if (latestYearData.shareholdersEquity > 0) {
    const debtToEquity = latestYearData.totalLiabilities / latestYearData.shareholdersEquity;
    metrics.push({
      name: 'Debt to Equity Ratio',
      value: debtToEquity,
      isPro: debtToEquity < 0.5, // Lower is better
      description: (name, val) => `${name} maintains a low debt-to-equity ratio of ${val.toFixed(2)}, indicating financial stability.`,
    });
  }
  
  // 3. Net Profit Margin
  if (latestYearData.revenue > 0) {
      const netProfitMargin = (latestYearData.netIncome / latestYearData.revenue) * 100;
      metrics.push({
        name: 'Net Profit Margin',
        value: netProfitMargin,
        isPro: netProfitMargin > 10,
        description: (name, val) => `With a healthy net profit margin of ${val.toFixed(1)}%, ${name} is efficient at converting revenue into actual profit.`,
      });
  }

  // 4. Revenue Growth
  if (previousYearData.revenue > 0) {
      const revenueGrowth = ((latestYearData.revenue - previousYearData.revenue) / previousYearData.revenue) * 100;
      metrics.push({
        name: 'Year-over-Year Revenue Growth',
        value: revenueGrowth,
        isPro: revenueGrowth > 10,
        description: (name, val) => `${name} has demonstrated impressive growth, with revenue increasing by ${val.toFixed(1)}% year-over-year.`,
      });
  }

  // 5. Dividend Payout Ratio
  if (latestYearData.netIncome > 0) {
      const dividendPayoutRatio = (latestYearData.dividendsPaid / latestYearData.netIncome) * 100;
      metrics.push({
        name: 'Dividend Payout Ratio',
        value: dividendPayoutRatio,
        isPro: dividendPayoutRatio > 10 && dividendPayoutRatio < 60,
        description: (name, val) => `${name} rewards its shareholders with a sustainable dividend payout ratio of ${val.toFixed(1)}%.`,
      });
  }
  
  // 6. Strong Operating Cash Flow
  if (latestYearData.netIncome > 0) {
      const cashFlowQuality = (latestYearData.cashFromOps / latestYearData.netIncome);
      metrics.push({
          name: 'Operating Cash Flow Quality',
          value: cashFlowQuality,
          isPro: cashFlowQuality > 1,
          description: (name, val) => `The company's operating cash flow is ${val.toFixed(2)}x its net income, indicating high-quality earnings.`,
      });
  }

  const pros = metrics
    .filter(m => m.isPro)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(m => m.description(companyName, m.value));
    
  const cons = metrics
    .filter(m => !m.isPro)
    .sort((a,b) => a.value - b.value)
    .slice(0, 3)
    .map(m => {
        // Custom con descriptions
        switch(m.name) {
            case 'Return on Equity (ROE)': return `Return on Equity is low at ${m.value.toFixed(1)}%, suggesting inefficient use of shareholder funds at ${companyName}.`;
            case 'Debt to Equity Ratio': return `${companyName} carries a high debt-to-equity ratio of ${m.value.toFixed(2)}, which could pose a financial risk.`;
            case 'Net Profit Margin': return `The net profit margin of ${m.value.toFixed(1)}% is slim, indicating potential issues with cost control or pricing power for ${companyName}.`;
            case 'Year-over-Year Revenue Growth': return `Revenue growth is sluggish at ${m.value.toFixed(1)}%, which might be a concern for future expansion of ${companyName}.`;
            case 'Dividend Payout Ratio': return `The dividend payout ratio of ${m.value.toFixed(1)}% is either too low or potentially unsustainable for ${companyName}.`;
            case 'Operating Cash Flow Quality': return `Operating cash flow is only ${m.value.toFixed(2)}x net income, suggesting lower quality earnings for ${companyName}.`;
            default: return `The metric "${m.name}" at ${m.value.toFixed(1)} is an area of concern for ${companyName}.`;
        }
    });

  const chartData = data
    .map(d => ({
        year: d.year,
        roe: d.shareholdersEquity > 0 ? parseFloat(((d.netIncome / d.shareholdersEquity) * 100).toFixed(1)) : 0
    }))
    .reverse();

  return { pros, cons, chartData, latestMetrics: latestYearData };
};
