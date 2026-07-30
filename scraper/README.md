# 5Paisa Stocks Scraper

This folder contains a robust Python web scraper to extract the list of companies, tickers, and logo URLs from [5Paisa](https://www.5paisa.com/stocks/all) and validate their logos.

## Features

- **Dynamic Infinite Scrolling**: Uses `Playwright` to simulate scrolling down the page to fetch all stocks loaded dynamically.
- **Deduplication**: Deduplicates data entries based on normalized company names.
- **High-Speed Async Validation**: Validates logo URLs asynchronously using `httpx` and `asyncio` to verify that they are live images (returns 200 HTTP status and `image/*` Content-Type) without blocking.
- **Checkpoint Progress**: Saves validation status in `scraper/checkpoint.json` so validation checks can be resumed if interrupted.
- **Detailed Logging**: Logs progress to the console and to `scraper/scraper.log`.
- **Excel Output**: Outputs the final dataset to `all_stock_script_Nov11_2025.xlsx`.

## Prerequisites

- Python 3.10+
- Node.js (for Playwright installation)

## Getting Started

1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install Playwright browser binaries:
   ```bash
   playwright install chromium
   ```

4. Run the scraper:
   ```bash
   python run_scraper.py
   ```

## Output files

- `all_stock_script_Nov11_2025.xlsx`: Excel spreadsheet containing:
  - `company_name`
  - `ticker`
  - `logo_url`
  - `logo_status` (e.g., `Valid`, `Broken or Missing`)
- `scraper/checkpoint.json`: Checkpoint cache to allow resuming without repeating validation calls.
- `scraper/scraper.log`: Real-time script logs.
