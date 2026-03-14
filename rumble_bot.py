# =============================================================================
# rumble_bot.py — Automação principal para o Rumble
# =============================================================================

import logging
import os
import random
import re
import subprocess
import sys
import time
from typing import Optional

import requests
from selenium import webdriver
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    NoSuchElementException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

import config
from comments import get_random_comment
from proxy_manager import ProxyManager

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(config.LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def human_delay(min_s: float = None, max_s: float = None):
    lo, hi = config.DELAY_BETWEEN_ACTIONS if min_s is None else (min_s, max_s)
    t = random.uniform(lo, hi)
    log.debug(f"⏳ Aguardando {t:.1f}s...")
    time.sleep(t)


def launch_real_chrome(profile_name: str) -> webdriver.Chrome:
    """
    Inicia um Chrome real limpo no modo de depuração e conecta o Selenium nele.
    Usar diretório de perfil customizado via profile_name isola Cookies/Sessões de múltiplas contas!
    """
    log.info("🧹 Fechando processos abertos do Chrome para liberar portas...")
    subprocess.run(["taskkill", "/F", "/IM", "chrome.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_exe):
        chrome_exe = os.path.join(os.environ["LOCALAPPDATA"], r"Google\Chrome\Application\chrome.exe")
        if not os.path.exists(chrome_exe):
            log.error("❌ Google Chrome não encontrado nos caminhos padrão.")
            sys.exit(1)

    debug_port = 9222
    # Cria um perfil limpo só pro bot, isolando os cookies do seu Chrome pessoal
    user_data = os.path.join(os.getcwd(), f"bot_chrome_profile_{profile_name}")
    os.makedirs(user_data, exist_ok=True)
    
    cmd = [
        chrome_exe,
        f"--remote-debugging-port={debug_port}",
        f"--user-data-dir={user_data}",
        "--no-first-run",
        "--no-default-browser-check"
    ]
    log.info("🌐 Iniciando o Chrome de Automação Isolado...")
    subprocess.Popen(cmd)
    
    log.info("⏳ Aguardando o Chrome iniciar a porta (10s)...")
    time.sleep(10)  # tempo extra para o Windows liberar e subir o socket

    opts = Options()
    opts.add_experimental_option("debuggerAddress", f"127.0.0.1:{debug_port}")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    
    # Traz a janela para frente
    driver.switch_to.window(driver.window_handles[0])
    return driver


def wait_for_cloudflare(driver: webdriver.Chrome, timeout: int = 60):
    cf_keywords = ["momento", "just a moment", "checking", "security check", "verificação"]
    
    is_cf = any(k in driver.title.lower() for k in cf_keywords)
    if is_cf:
        print("\n" + "=" * 60)
        print("⚠️  CLOUDFLARE DETECTADO!")
        print("   → Clique em 'Confirme que é humano' na aba do Chrome agora.")
        print("=" * 60)

    end_time = time.time() + timeout
    while time.time() < end_time:
        if any(k in driver.title.lower() for k in cf_keywords):
            time.sleep(2)
        else:
            if is_cf:
                log.info("✅ Cloudflare superado.")
            break
    time.sleep(2)


# ── Operações na página ───────────────────────────────────────────────────────

def login_rumble(driver: webdriver.Chrome, username, password) -> bool:
    log.info(f"🔑 Verificando login para a conta: {username} ...")
    driver.get("https://rumble.com/login.php")
    wait_for_cloudflare(driver)
    time.sleep(3)
    
    # Se já parece logado (checa a foto de perfil/menu)
    if driver.find_elements(By.CSS_SELECTOR, ".header-nav-acc"):
        log.info(f"✅ Conta '{username}' já estava autenticada no perfil Chrome!")
        return True
        
    try:
        user_input = driver.find_element(By.CSS_SELECTOR, "input[name='username'], input[type='email'], input#login-username")
        user_input.send_keys(username)
        time.sleep(1)
        
        pass_input = driver.find_element(By.CSS_SELECTOR, "input[name='password'], input[type='password']")
        pass_input.send_keys(password)
        time.sleep(1)
        
        pass_input.send_keys(Keys.RETURN)
        log.info(f"🔑 Credenciais enviadas. Aguardando processamento...")
        time.sleep(5)
        wait_for_cloudflare(driver)
        
        # Verify
        if driver.find_elements(By.CSS_SELECTOR, ".header-nav-acc") or "login" not in driver.current_url.lower():
            log.info(f"✅ Nova Sessão efetuada com sucesso para '{username}'!")
            return True
        else:
            log.warning(f"⚠️  Login falhou ou bloqueado por captcha extra para '{username}'.")
            return False
            
    except Exception as e:
        log.warning(f"⚠️  Erro na automação de login (pode já estar logado ou layout mudou): {e}")
        return False


def get_video_duration(driver: webdriver.Chrome) -> int:
    # 1. Tentar pegar o 'duration' nativo repetidas vezes (para contornar carregamento metadata)
    for _ in range(8):
        try:
            d = driver.execute_script("""
                const v = document.querySelector('video');
                if (v && v.duration && !isNaN(v.duration) && v.duration !== Infinity && v.duration > 0) {
                    return v.duration;
                }
                return -1;
            """)
            if d and float(d) > 0:
                return int(d)
        except Exception:
            pass
        time.sleep(1.5)

    # 2. Tentar pegar da interface visual (textos como '04:15')
    js_time = """
    let els = Array.from(document.querySelectorAll('span, div, time'));
    let maxSecs = 0;
    for (let el of els) {
        let txt = (el.innerText || '').trim();
        if (txt.match(/^(\\d{1,2}:)?\\d{1,2}:\\d{2}$/)) {
            let parts = txt.split(':').map(Number);
            let secs = 0;
            if (parts.length === 3) secs = parts[0]*3600 + parts[1]*60 + parts[2];
            else if (parts.length === 2) secs = parts[0]*60 + parts[1];
            if (secs > maxSecs) maxSecs = secs;
        }
    }
    return maxSecs;
    """
    try:
        t = driver.execute_script(js_time)
        if t and int(t) > 0:
            return int(t)
    except Exception:
        pass
        
    log.warning("⚠️  Duração do vídeo não encontrada (Live Stream ou erro). Assumindo 300s.")
    return 300


def watch_video(driver: webdriver.Chrome, url: str):
    log.info(f"▶️  Abrindo: {url}")
    driver.get(url)
    wait_for_cloudflare(driver)
    time.sleep(3)

    for sel in [".rumbles-player", "video", ".player-wrap", "#videoPlayer"]:
        try:
            driver.find_element(By.CSS_SELECTOR, sel).click()
            time.sleep(2)
            break
        except (NoSuchElementException, ElementClickInterceptedException):
            continue

    duration = get_video_duration(driver)
    # Ignora o duration real do vídeo pra ganhar tempo e foca no mínimo necessário pra registrar as ações iniciais
    watch_time = min(config.MIN_WATCH_SECONDS, duration) if duration > 0 else config.MIN_WATCH_SECONDS
    log.info(f"⏱  Assistindo os primeiros {watch_time}s para liberar os botões (duração total: {duration}s)...")

    elapsed = 0
    while elapsed < watch_time:
        chunk = random.uniform(2, 5) # chunks curtos pra ir mais rapido
        time.sleep(min(chunk, watch_time - elapsed))
        elapsed += chunk
        if elapsed < watch_time:
            driver.execute_script(f"window.scrollBy(0, {random.randint(50, 150)});")

    log.info("✅ Visualização inicial concluída.")
    return duration, watch_time


def follow_channel(driver: webdriver.Chrome) -> bool:
    human_delay(1, 2)
    js_script = """
    let buttons = Array.from(document.querySelectorAll('button, a'));
    let target = null;
    for (let b of buttons) {
        let text = (b.innerText || '').toLowerCase().trim();
        let aria = (b.getAttribute('aria-label') || '').toLowerCase();
        
        // Verifica se o texto é seguir/follow. Ignora botões com 'seguindo' ou 'following' (já segue)
        if ((text === 'follow' || text === 'seguir' || aria.includes('follow') || aria.includes('seguir')) 
            && !text.includes('following') && !text.includes('seguindo')) {
            target = b;
            break;
        }
    }
    if (target) {
        target.scrollIntoView({behavior: 'smooth', block: 'center'});
        target.click();
        return true;
    }
    return false;
    """
    try:
        if driver.execute_script(js_script):
            log.info("👤 Canal Seguido com sucesso!")
            return True
        else:
            log.info("👤 Canal possivelmente já seguido (ou botão não encontrado).")
            return False
    except Exception:
        log.warning("⚠️  Falha ao tentar seguir o canal.")
        return False


def like_video(driver: webdriver.Chrome) -> bool:
    human_delay(1, 2)
    
    js_script = """
    let buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
    let target = null;
    for (let b of buttons) {
        let text = (b.innerText || '').toLowerCase();
        let aria = (b.getAttribute('aria-label') || '').toLowerCase();
        let title = (b.getAttribute('title') || '').toLowerCase();
        let className = (b.className || '').toString().toLowerCase();
        
        // Match the text or common classes
        if (aria.includes('like') || title.includes('like') || aria.includes('upvote') || 
            className.includes('vote-up') || className.includes('rumbles-vote') || text.trim() === 'like') {
            target = b;
            break;
        }
        
        // Procura DENTRO de SVGs que contenham 'thumb' (no novo layout verde-pílula)
        if (!target) {
            let svgs = Array.from(b.querySelectorAll('svg'));
            for (let s of svgs) {
                let sClasses = (s.getAttribute('class') || '').toLowerCase();
                let useHtml = (s.innerHTML || '').toLowerCase();
                if (sClasses.includes('thumb') || sClasses.includes('up') || useHtml.includes('thumb')) {
                    target = b;
                    break;
                }
            }
        }
        if (target) break;
    }
    
    // Novo Layout: procura a div pílula que fica ao lado de 'Repostar/Repost'
    if (!target) {
        let allEls = Array.from(document.querySelectorAll('div, button'));
        for (let el of allEls) {
            let svg = el.querySelector('svg');
            let txt = (el.innerText || '').trim();
            if (svg && txt.match(/^[0-9]+$/)) { // Se tem um SVG e só um número do lado (contagem de likes)
                target = el;
                break;
            }
        }
    }
    
    if (target) {
        target.scrollIntoView({behavior: 'smooth', block: 'center'});
        target.click();
        return true;
    }
    return false;
    """
    try:
        if driver.execute_script(js_script):
            log.info("👍 Like dado via injeção JavaScript (Novo Layout)!")
            return True
    except Exception:
        pass

    # Fallbacks de CSS baseados no novo layout
    new_selectors = [
        "button.rumbles-vote-btn-up", 
        "div[class*='vote'] button", 
        ".media-by--metadata-btns button:first-child", 
        "div[class*='like'] button"
    ]
    for sel in new_selectors:
        try:
            btns = driver.find_elements(By.CSS_SELECTOR, sel)
            for btn in btns:
                if btn.is_displayed():
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                    time.sleep(1)
                    btn.click()
                    log.info(f"👍 Like dado! (Fallback Seletor CSS: {sel})")
                    return True
        except Exception:
            continue
            
    log.warning("⚠️  Botão de like não encontrado (o Rumble mudou o layout severamente ou você não está logado).")
    return False


def post_comment(driver: webdriver.Chrome) -> bool:
    human_delay(1, 3)
    comment_text = get_random_comment()
    
    # Rola um pouco para baixo para carregar os comentários
    driver.execute_script("window.scrollBy(0, 800);")
    time.sleep(3)
    
    found_field = None
    for sel in ["textarea[placeholder*='comment']", "textarea[placeholder*='Comment']",
                "textarea[name='comment']", "#comment-form textarea", "textarea", "div[contenteditable='true']"]:
        try:
            fields = driver.find_elements(By.CSS_SELECTOR, sel)
            for f in fields:
                if f.is_displayed():
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", f)
                    time.sleep(1)
                    f.click()
                    time.sleep(1)
                    found_field = f
                    break
            if found_field: break
        except Exception:
            continue
            
    if not found_field:
        log.warning("⚠️  Campo de comentário não encontrado (você precisa estar logado).")
        return False
        
    for ch in comment_text:
        try:
            found_field.send_keys(ch)
        except Exception:
            # Emojis crassam nas versões mais novas do driver com "characters in the BMP"
            driver.execute_script("arguments[0].value += arguments[1];", found_field, ch)
        time.sleep(random.uniform(0.03, 0.12))
    human_delay(2, 4)

    js_submit = """
    let elements = Array.from(document.querySelectorAll('button, div, span'));
    let target = null;
    
    // Varredura universal baseada no print do usuário (botão bg-green)
    for (let b of elements) {
        if (b.tagName === 'TEXTAREA' || b.hasAttribute('contenteditable')) continue;
        
        let text = (b.innerText || '').toLowerCase().trim();
        let className = (b.className || '').toString().toLowerCase();
        
        // Captura o botão verde específico do Rumble
        if (className.includes('bg-green') && (text.includes('coment') || text.includes('comment') || text === '')) {
            target = b;
            break;
        }
        
        // Pega botões padrão de envio
        if (b.tagName === 'BUTTON' || b.tagName === 'INPUT') {
            if (text === 'comment' || text.includes('comentá') || text === 'comentar' || text === 'post' || text === 'enviar') {
                target = b;
                break;
            }
        }
    }
    
    if (target) {
        target.scrollIntoView({behavior: 'smooth', block: 'center'});
        target.click();
        return true;
    }
    return false;
    """
    try:
        if driver.execute_script(js_submit):
            log.info(f'💬 Comentário enviado via botão JS: "{comment_text}"')
            return True
    except Exception:
        pass
        
    # fallback final pra enviar com teclado caso botão não seja achado
    try:
        found_field.send_keys(Keys.CONTROL + Keys.RETURN)
        time.sleep(1)
        found_field.send_keys(Keys.TAB)
        time.sleep(0.5)
        found_field.send_keys(Keys.RETURN)
        log.info(f'💬 Comentário enviado via Teclado: "{comment_text}"')
    except Exception:
        log.warning("⚠️  Falha ao tentar forçar envio via teclado.")
    return True


# ── Fluxo principal ───────────────────────────────────────────────────────────

def run():
    print("\n" + "=" * 60)
    print("🚀 RUMBLE BOT MULTI-CONTA INICIADO (Bypass Nativo via Porta de Debug)")
    print("=" * 60 + "\n")

    video_links = [v for v in config.MANUAL_VIDEOS if v.startswith("http")]
    if not video_links:
        log.error("❌ Nenhum link válido configurado. Edite config.MANUAL_VIDEOS no arquivo config.py.")
        return
        
    accounts = getattr(config, "ACCOUNTS", [])
    if not accounts:
        log.error("❌ Nenhuma conta configurada em config.ACCOUNTS.")
        return

    log.info("Feche todas as outras janelas do Chrome antes de rodar este script, se possível.")

    limit = config.MAX_VIDEOS if config.MAX_VIDEOS > 0 else len(video_links)
    video_links = video_links[:limit]

    for acc_idx, acc in enumerate(accounts, 1):
        username = acc.get("username")
        password = acc.get("password")
        
        log.info(f"\n{'#'*60}")
        log.info(f"👥 INICIANDO SESSÃO - CONTA {acc_idx}/{len(accounts)}: @{username}")
        log.info(f"{'#'*60}")
        
        try:
            driver = launch_real_chrome(profile_name=username)
        except Exception as e:
            log.error(f"❌ Erro ao abrir Chrome para {username}: {e}")
            continue
            
        # Tenta Logar
        login_rumble(driver, username, password)

        log.info(f"🎬 Processando {len(video_links)} vídeos listados para a conta @{username}...")

        for idx, url in enumerate(video_links, 1):
            log.info(f"\n{'-'*50}")
            log.info(f"📹 Vídeo {idx}/{len(video_links)}: {url} (@{username})")

            try:
                start_actions = time.time()
                duration, initial_watch = watch_video(driver, url)
                
                try:
                    like_video(driver)
                except Exception as e:
                    log.warning(f"⚠️ Falha isolada no Like: {e}")
                    
                try:
                    follow_channel(driver)
                except Exception as e:
                    log.warning(f"⚠️ Falha isolada no Follow: {e}")
                    
                try:
                    post_comment(driver)
                except Exception as e:
                    log.warning(f"⚠️ Falha isolada no Comment: {e}")
                
                # Aguarda o restante do vídeo com base na duração total capturada
                time_spent = time.time() - start_actions
                remaining = duration - time_spent
                
                if remaining > 0:
                    log.info(f"⏳ Terminando de assistir o restante do vídeo ({int(remaining)}s)...")
                    start_wait = time.time()
                    
                    while (time.time() - start_wait) < remaining:
                        try:
                            # Checa se o player acusa fim antecipado
                            is_finished = driver.execute_script("""
                                const v = document.querySelector('video');
                                if (v && v.ended) return true;
                                if (v && v.duration > 0 && v.currentTime >= (v.duration - 2)) return true;
                                if (v && v.paused) { v.play().catch(e=>console.log(e)); }
                                return false;
                            """)
                            if is_finished:
                                log.info("⏩ Player indicou fim do vídeo antecipadamente.")
                                break
                        except Exception:
                            pass
                            
                        # Continua aguardando e rolando a página
                        time.sleep(5)
                        try:
                            driver.execute_script(f"window.scrollBy(0, {random.randint(-50, 50)});")
                        except Exception:
                            pass
                            
                log.info(f"✅ Vídeo finalizado por completo pela conta @{username}!")
                    
            except Exception as e:
                log.error(f"❌ Erro no vídeo com @{username}: {e}")

            if idx < len(video_links):
                w = random.uniform(*config.DELAY_BETWEEN_VIDEOS)
                log.info(f"⏸  Aguardando {w:.0f}s até o próximo vídeo...")
                time.sleep(w)
                
        # Fecha o Chrome atual antes de ir pra próxima conta
        log.info(f"🚪 Tarefas concluídas para @{username}. Encerrando navegador do perfil...")
        try:
            driver.quit()
        except Exception:
            pass
        
        if acc_idx < len(accounts):
            log.info(f"⏸ Aguardando 10s antes de trocar de conta...\n")
            time.sleep(10)

    log.info("🏁 Automação Multi-Conta Finalizada! Todos os vídeos vistos por todas as contas.")


if __name__ == "__main__":
    run()
