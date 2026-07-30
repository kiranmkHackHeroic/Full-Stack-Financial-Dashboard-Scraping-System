import os
import json
import time
import asyncio
import logging
import re
from typing import Dict, List, Any
from bs4 import BeautifulSoup
import httpx
import pandas as pd

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("scraper/scraper.log"),
        logging.StreamHandler()
    ]
)

CHECKPOINT_FILE = "scraper/checkpoint.json"
OUTPUT_FILE = "all_stock_script_Nov11_2025.xlsx"
BASE_URL = "https://companiesmarketcap.com/"
MAX_CONCURRENT_VALIDATIONS = 50

# Global progress checkpoint data
progress_data: Dict[str, Any] = {}

def load_checkpoint():
    global progress_data
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, 'r') as f:
                progress_data = json.load(f)
            logging.info(f"Loaded checkpoint with {len(progress_data)} validated companies.")
        except Exception as e:
            logging.error(f"Error loading checkpoint: {e}")
            progress_data = {}
    else:
        logging.info("No checkpoint found. Starting fresh.")
        progress_data = {}

def save_checkpoint():
    try:
        os.makedirs(os.path.dirname(CHECKPOINT_FILE), exist_ok=True)
        with open(CHECKPOINT_FILE, 'w') as f:
            json.dump(progress_data, f, indent=4)
        logging.info(f"Saved checkpoint with {len(progress_data)} companies.")
    except Exception as e:
        logging.error(f"Error saving checkpoint: {e}")

async def validate_logo_url(client: httpx.AsyncClient, semaphore: asyncio.Semaphore, company_name: str, url: str) -> str:
    if not url or not url.startswith("http"):
        return "Missing or Invalid URL"
    
    # Check if already validated in checkpoint
    if company_name in progress_data and progress_data[company_name].get("logo_url") == url:
        cached_status = progress_data[company_name].get("logo_status")
        if cached_status in ["Valid", "Broken or Missing"]:
            return cached_status

    async with semaphore:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        for attempt in range(3):  # 3 Retries
            try:
                # Try HEAD first
                response = await client.head(url, headers=headers, follow_redirects=True, timeout=10.0)
                content_type = response.headers.get("content-type", "").lower()
                if response.status_code == 200 and "image" in content_type:
                    return "Valid"
                
                # If HEAD fails, try GET
                response = await client.get(url, headers=headers, follow_redirects=True, timeout=10.0)
                content_type = response.headers.get("content-type", "").lower()
                if response.status_code == 200 and "image" in content_type:
                    return "Valid"
            except Exception as e:
                logging.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                await asyncio.sleep(1.0 * (attempt + 1))
        
        logging.info(f"Validation failed for logo URL: {url}")
        return "Broken or Missing"

async def validate_all_logos(companies: List[Dict[str, str]]) -> List[Dict[str, str]]:
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_VALIDATIONS)
    limits = httpx.Limits(max_keepalive_connections=20, max_connections=100)
    
    async with httpx.AsyncClient(limits=limits, verify=False) as client:
        tasks = []
        for c in companies:
            name = c["company_name"]
            url = c["logo_url"]
            tasks.append(validate_logo_url(client, semaphore, name, url))
        
        results = await asyncio.gather(*tasks)
        
        for idx, status in enumerate(results):
            companies[idx]["logo_status"] = status
            # Update global progress data
            comp_name = companies[idx]["company_name"]
            progress_data[comp_name] = {
                "logo_url": companies[idx]["logo_url"],
                "logo_status": status,
                "ticker": companies[idx]["ticker"]
            }
            
    return companies

def scrape_companies():
    load_checkpoint()
    
    companies_list: List[Dict[str, str]] = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # We will loop pages. Aiming for ~8000+ companies. 100 companies per page -> ~80 pages.
    max_pages = 82
    page = 1
    
    logging.info("Starting web scraping from CompaniesMarketCap...")
    
    while page <= max_pages:
        url = f"{BASE_URL}?page={page}"
        logging.info(f"Scraping page {page}/{max_pages}: {url}")
        
        try:
            response = httpx.get(url, headers=headers, timeout=20.0)
            if response.status_code != 200:
                logging.error(f"Failed to fetch page {page}: Status code {response.status_code}")
                break
                
            soup = BeautifulSoup(response.text, 'html.parser')
            rows = soup.select("table tr")
            
            # Skip header row
            if not rows or len(rows) <= 1:
                logging.info(f"No rows found on page {page}. Stopping.")
                break
                
            page_companies = 0
            for row in rows[1:]:
                # Extract elements
                name_td = row.select_one("td.name-td")
                if not name_td:
                    continue
                    
                name_el = name_td.select_one("div.company-name")
                code_el = name_td.select_one("div.company-code")
                img_el = name_td.select_one("img.company-logo")
                
                if name_el and code_el:
                    company_name = name_el.text.strip()
                    ticker = code_el.text.strip()
                    
                    # Resolve logo URL
                    logo_url = ""
                    if img_el:
                        src = img_el.get("src") or img_el.get("data-src") or ""
                        if src:
                            if src.startswith("http"):
                                logo_url = src
                            else:
                                # Prepend base domain
                                logo_url = BASE_URL.rstrip('/') + '/' + src.lstrip('/')
                                
                    companies_list.append({
                        "company_name": company_name,
                        "ticker": ticker,
                        "logo_url": logo_url,
                        "logo_status": "Pending"
                    })
                    page_companies += 1
            
            logging.info(f"Extracted {page_companies} companies from page {page}.")
            
            if page_companies == 0:
                logging.info("No more companies loaded. Stopping.")
                break
                
            page += 1
            # Polite scraping delay
            time.sleep(0.5)
            
        except Exception as e:
            logging.error(f"Error scraping page {page}: {e}")
            break
            
    # Deduplicate companies list by normalized company name
    seen_names = set()
    deduped_companies = []
    for c in companies_list:
        norm_name = re.sub(r'\s+', ' ', c["company_name"].lower()).strip()
        if norm_name not in seen_names:
            seen_names.add(norm_name)
            deduped_companies.append(c)
            
    logging.info(f"Extracted a total of {len(companies_list)} companies.")
    logging.info(f"Deduplicated to {len(deduped_companies)} unique companies.")
    
    if not deduped_companies:
        logging.error("No companies extracted. Excel sheet will not be generated.")
        return
        
    # Run async validation on the deduplicated companies list
    logging.info("Starting asynchronous logo validation...")
    validated_companies = asyncio.run(validate_all_logos(deduped_companies))
    
    # Save progress checkpoint
    save_checkpoint()
    
    # Generate Excel Spreadsheet
    logging.info(f"Saving final dataset to {OUTPUT_FILE}...")
    df = pd.DataFrame(validated_companies)
    df.to_excel(OUTPUT_FILE, index=False)
    
    # Generate Summary Metrics
    total = len(validated_companies)
    valid = sum(1 for c in validated_companies if c["logo_status"] == "Valid")
    broken = sum(1 for c in validated_companies if c["logo_status"] == "Broken or Missing")
    
    logging.info("Scraping and validation complete.")
    logging.info(f"SUMMARY: Total: {total} | Valid Logos: {valid} | Broken/Missing: {broken}")

if __name__ == '__main__':
    # Ensure scraper dir exists
    os.makedirs("scraper", exist_ok=True)
    scrape_companies()
