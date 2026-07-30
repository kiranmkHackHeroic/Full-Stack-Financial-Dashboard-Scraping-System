
import React, { useState } from 'react';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="bg-gray-900 rounded-md p-4 my-4 overflow-x-auto">
    <code className="text-sm text-yellow-300 font-mono">
      {children}
    </code>
  </pre>
);

const InternTask: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 mb-8">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    <h2 className="text-2xl font-bold text-white">Featured Task: Scrape 5Paisa Stocks</h2>
                </div>
                <button className="text-cyan-400 hover:text-cyan-300">
                    {isOpen ? 'Hide Details' : 'Show Details'}
                </button>
            </div>
            
            {isOpen && (
                <div className="mt-6 border-t border-gray-700 pt-6 animate-fade-in space-y-6 text-gray-300">
                    <p><strong className="text-gray-400">Deadline:</strong> 11 Nov 2025 by 7:00 PM IST</p>
                    
                    <section>
                        <h3 className="text-xl font-semibold text-cyan-400 mb-2">Goal</h3>
                        <p>Create a robust Python scraper that extracts <strong className="text-white">company name</strong> and <strong className="text-white">logo URL</strong> for every company listed on <a href="https://www.5paisa.com/stocks/all" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">https://www.5paisa.com/stocks/all</a> (site loads data dynamically via infinite scroll). Save the final, deduplicated, validated dataset to an Excel file.</p>
                        <p className="mt-2"><strong>Output file:</strong> <code className="bg-gray-700 text-sm p-1 rounded">all_stock_script_Nov11_2025.xlsx</code></p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-cyan-400 mb-2">Acceptance Criteria</h3>
                        <ol className="list-decimal list-inside space-y-1">
                            <li><strong>No duplicates</strong> — dedupe by normalized company name.</li>
                            <li><strong>Logo URL must be valid</strong> — check with a HEAD or light GET request (status 200 and content-type image/*).</li>
                            <li><strong>Complete coverage</strong> — aim for ~8000+ companies.</li>
                            <li><strong>Resumable scraping</strong> — checkpoint progress to continue from last state.</li>
                            <li><strong>Polite & efficient</strong> — respect site load limits, use random delays, identify with a clean User-Agent.</li>
                            <li><strong>Code quality</strong> — include proper error handling, retry logic, and logging.</li>
                        </ol>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-cyan-400 mb-2">Recommended Stack & Libraries</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Python 3.10+</li>
                            <li>Playwright (preferred) or Selenium for dynamic scrolling</li>
                            <li>BeautifulSoup4 (bs4) for parsing</li>
                            <li>httpx or requests for logo validation</li>
                            <li>pandas + openpyxl for Excel output</li>
                            <li>logging for progress tracking</li>
                        </ul>
                    </section>
                    
                    <section>
                        <h3 className="text-xl font-semibold text-cyan-400 mb-2">Example Implementation Sketch</h3>
                        <CodeBlock>
{`# scraper/run_scraper.py (simplified sketch)
from playwright.sync_api import sync_playwright
import pandas as pd, time, httpx, logging

logging.basicConfig(level=logging.INFO)

def validate_logo(url):
    try:
        r = httpx.head(url, follow_redirects=True, timeout=10)
        if r.status_code == 200 and 'image' in r.headers.get('content-type',''):
            return 'Valid'
    except Exception as e:
        logging.warning(f'Error validating {url}: {e}')
    return 'Broken or Missing'

def run_scraper():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('https://www.5paisa.com/stocks/all')
        time.sleep(2)
        
        # scroll until all items load
        prev_height = 0
        while True:
            page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            time.sleep(1.5)
            curr_height = page.evaluate('document.body.scrollHeight')
            if curr_height == prev_height:
                break
            prev_height = curr_height
            
        items = []
        # ... (scraping logic) ...
        
        df = pd.DataFrame(items)
        df.to_excel('5paisa_stocks_Nov11_2025.xlsx', index=False)

if __name__ == '__main__':
    run_scraper()`}
                        </CodeBlock>
                    </section>
                    
                    <section>
                        <h3 className="text-xl font-semibold text-cyan-400 mb-2">Deliverables</h3>
                        <ul className="list-disc list-inside space-y-1">
                           <li>Final Excel: <code className="bg-gray-700 text-sm p-1 rounded">all_stock_script_Nov11_2025.xlsx</code></li>
                           <li>README.md (how to run, dependencies, known issues)</li>
                           <li>Log file with summary counts</li>
                        </ul>
                    </section>
                </div>
            )}
        </div>
    );
};

export default InternTask;
