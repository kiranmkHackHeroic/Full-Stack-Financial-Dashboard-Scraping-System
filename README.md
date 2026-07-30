# Machine Learning Financial Analysis System

A modern, secure financial analysis application featuring a stock scraping subsystem, dynamic indicators dashboard, and persistent data layers.

---

## Features

### 1. Stock Scraper Subsystem
- **Source**: Dynamic crawling on global stock indices (CompaniesMarketCap).
- **Technology**: Playwright browser automation combined with BeautifulSoup4 parsing.
- **Coverage**: Deduplicates and processes **8,000+ companies** globally.
- **Logo Validation**: Parallel, asynchronous URL checks to filter out missing or broken images.
- **Resumability**: Local JSON checkpoints (`scraper/checkpoint.json`) allow restarting interrupted scraping sessions.
- **Output**: Exports a structured Excel spreadsheet `all_stock_script_Nov11_2025.xlsx`.

### 2. JWT Authentication
- Fully gated frontend with glassmorphism Login and Registration panels.
- Secure backend hashing using `bcryptjs`.
- Session tokens signed with 24-hour expiration for secure API communication.

### 3. Persistent Storage (SQLite)
- Relies on database-level persistence (`database.sqlite`) instead of volatile in-memory storage.
- Stores registered user credentials.
- Caches Google Gemini news analysis summaries to optimize API rate limits.

---

## Project Structure

```
├── README.md                      # Setup and usage guide
├── backend/                       # Node/Express API Server
│   ├── database.ts                # SQLite DB connection & migrations
│   └── server.ts                  # API endpoints, JWT validation, and static hosting
├── frontend/                      # React SPA Dashboard
│   ├── App.tsx                    # Core app layout and authentication routing
│   ├── components/                # Glassmorphic user interface elements
│   ├── services/                  # Backend API request wrappers
│   └── constants.ts               # Local ticker and metadata mappings
├── scraper/                       # Stock Scraper
│   ├── run_scraper.py             # Playwright crawler script
│   ├── requirements.txt           # Python dependency lists
│   └── README.md                  # Detailed scraper commands
├── database.sqlite                # Persistent SQLite database file
└── all_stock_script_Nov11_2025.xlsx  # Scraped stock dataset export
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python 3.10+** (with `pip` and virtual environment support)

---

## Installation & Setup

### 1. Server Configuration
Install npm dependencies in the root project folder:
```bash
npm install
```

Configure your local environment variables by creating or editing `.env.local` in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_custom_jwt_secret_key
```

### 2. Scraper Configuration
Set up the Python virtual environment and install standard drivers:
```bash
# Create and activate environment
python3 -m venv scraper_env
source scraper_env/bin/activate

# Install libraries
pip install -r scraper/requirements.txt

# Install Playwright browser drivers
playwright install chromium
```

---

## Running the Application

### Local Development
Start the Express server and Vite watch server in tandem:
```bash
npm run dev
```
Navigate to **[http://localhost:3000](http://localhost:3000)**.
- Choose **Register** to create a persistent profile in SQLite.
- **Login** with your credentials to explore stock stats and request AI-powered news summaries.

### Running the Scraper
To crawl company listings and build the Excel file:
```bash
# Activate environment
source scraper_env/bin/activate

# Start scraping
python scraper/run_scraper.py
```
Output data will compile inside `all_stock_script_Nov11_2025.xlsx` in the workspace root. Detailed progress logs are outputted to `scraper/scraper.log`.

### Production Build
To build and launch the compiled bundle:
```bash
# Compile bundle
npm run build

# Start server
npm run start
```
