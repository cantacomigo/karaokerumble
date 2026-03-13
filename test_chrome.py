"""Diagnóstico mínimo — testa se o Chrome abre sem crash."""
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

opts = Options()
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-dev-shm-usage")
# SEM RemoteDebugPort, SEM AutomationControl, SEM user-data-dir

try:
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    print("✅ Chrome abriu!")
    driver.get("https://www.google.com")
    print(f"Título: {driver.title}")
    time.sleep(3)
    driver.get("https://rumble.com/user/joaquimcdacruz31/videos")
    time.sleep(8)
    title = driver.title
    print(f"Título Rumble: {title}")
    # Pega os primeiros hrefs
    links = [a.get_attribute("href") for a in driver.find_elements("tag name", "a")
             if a.get_attribute("href") and "rumble.com" in (a.get_attribute("href") or "")]
    print(f"Links rumble encontrados: {len(links)}")
    for l in links[:5]:
        print(f"  {l}")
    driver.quit()
except Exception as e:
    print(f"❌ ERRO: {e}")
