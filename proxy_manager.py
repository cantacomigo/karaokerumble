# =============================================================================
# proxy_manager.py — Busca, valida e rotaciona proxies
# =============================================================================

import logging
import random
import socket
from typing import Optional

import requests

from config import MANUAL_PROXIES, PROXY_TEST_TIMEOUT, USE_FREE_PROXIES

log = logging.getLogger(__name__)

# ── Fontes de proxies gratuitos (APIs públicas em JSON) ───────────────────────
FREE_PROXY_SOURCES = [
    "https://proxylist.geonode.com/api/proxy-list?limit=100&page=1&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all",
]


def _fetch_geonode(url: str) -> list[str]:
    """Parseia resposta JSON do GeoNode."""
    try:
        r = requests.get(url, timeout=10)
        data = r.json().get("data", [])
        return [f"{p['ip']}:{p['port']}" for p in data]
    except Exception as e:
        log.warning(f"Erro ao buscar proxies do GeoNode: {e}")
        return []


def _fetch_plain_text(url: str) -> list[str]:
    """Parseia lista de proxies em texto puro (ip:porta por linha)."""
    try:
        r = requests.get(url, timeout=10)
        return [line.strip() for line in r.text.splitlines() if ":" in line.strip()]
    except Exception as e:
        log.warning(f"Erro ao buscar proxies (texto): {e}")
        return []


def fetch_free_proxies() -> list[str]:
    """Retorna lista combinada de proxies das fontes públicas."""
    proxies: list[str] = []
    for url in FREE_PROXY_SOURCES:
        if "geonode" in url:
            proxies += _fetch_geonode(url)
        else:
            proxies += _fetch_plain_text(url)
    random.shuffle(proxies)
    log.info(f"✅ {len(proxies)} proxies buscados de fontes públicas.")
    return list(dict.fromkeys(proxies))  # remove duplicatas preservando ordem


def is_proxy_alive(proxy: str, timeout: int = PROXY_TEST_TIMEOUT) -> bool:
    """Testa rapidamente se o proxy responde via socket TCP."""
    try:
        host, port_str = proxy.split(":")[:2]
        port = int(port_str)
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


class ProxyManager:
    """Gerencia rotação de proxies válidos."""

    def __init__(self):
        self._proxies: list[str] = []
        self._bad: set[str] = set()
        self._current: Optional[str] = None

    def load(self):
        """Carrega proxies manuais e/ou gratuitos."""
        if MANUAL_PROXIES:
            self._proxies = list(MANUAL_PROXIES)
            log.info(f"📋 Usando {len(self._proxies)} proxies manuais.")
        elif USE_FREE_PROXIES:
            self._proxies = fetch_free_proxies()
        else:
            log.warning("⚠️  Nenhum proxy configurado — rodando sem proxy.")

    def next(self) -> Optional[str]:
        """Retorna o próximo proxy válido (round-robin filtrando ruins)."""
        available = [p for p in self._proxies if p not in self._bad]
        if not available:
            log.warning("⚠️  Sem proxies disponíveis. Recarregando...")
            self._bad.clear()
            if USE_FREE_PROXIES:
                self._proxies = fetch_free_proxies()
            available = self._proxies[:]

        for proxy in available:
            if is_proxy_alive(proxy):
                self._current = proxy
                log.info(f"🌐 Proxy ativo: {proxy}")
                return proxy
            else:
                log.debug(f"❌ Proxy inativo: {proxy}")
                self._bad.add(proxy)

        log.error("❌ Todos os proxies falharam. Continuando sem proxy.")
        self._current = None
        return None

    def mark_bad(self, proxy: str):
        """Marca um proxy como com falha."""
        self._bad.add(proxy)
        log.warning(f"🚫 Proxy marcado como falho: {proxy}")

    @property
    def current(self) -> Optional[str]:
        return self._current
