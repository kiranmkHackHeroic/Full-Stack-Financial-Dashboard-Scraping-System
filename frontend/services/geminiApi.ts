import { NewsArticle } from '../types';

export const fetchCompanyNews = async (companyName: string): Promise<{ summary: string; articles: NewsArticle[] }> => {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const apiBase = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiBase}/api/news`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ companyName }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      summary: data.summary || `Summary for ${companyName} unavailable.`,
      articles: Array.isArray(data.articles) ? data.articles : [],
    };
  } catch (error) {
    console.error('Error fetching company news:', error);
    return {
      summary: `${companyName} continues to operate across key business divisions. Track recent announcements and financial performance in official company filings.`,
      articles: [
        {
          title: `${companyName} Financial Updates & Reports`,
          uri: `https://www.google.com/search?q=${encodeURIComponent(companyName + ' latest news financial results')}`,
        },
      ],
    };
  }
};
