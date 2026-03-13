import cloudscraper
from bs4 import BeautifulSoup
import re

url = "https://rumble.com/user/joaquimcdacruz31/videos"
scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True})

try:
    print(f"Buscando {url}...")
    response = scraper.get(url, timeout=15)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string if soup.title else "Sem título"
        print(f"Título: {title}")
        
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if not href.startswith("http"):
                href = "https://rumble.com" + href
            if re.search(r'rumble\.com/v[\w]+-[\w.%-]+\.html', href) and href not in links:
                links.append(href)
                
        print(f"Links encontrados: {len(links)}")
        for l in links[:5]:
            print(f" - {l}")
    else:
        print("Erro: não retornou 200")
        
except Exception as e:
    print(f"ERRO: {e}")
