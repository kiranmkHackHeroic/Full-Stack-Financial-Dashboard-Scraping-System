export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface FinancialMetric {
  year: number;
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
  dividendsPaid: number;
  cashFromOps: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  marketPrice?: number;
}

export type FinancialData = FinancialMetric[];

export interface AnalysisResult {
  companyId: string;
  companyName: string;
  pros: string[];
  cons: string[];
  chartData: { year: number; roe: number }[];
  latestMetrics: FinancialMetric | null;
}

export interface NewsArticle {
  title: string;
  uri: string;
}

export interface HistoricalPricePoint {
  date: string;
  price: number;
}