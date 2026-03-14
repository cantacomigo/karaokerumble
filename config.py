# =============================================================================
# config.py — Configurações da automação Rumble
# =============================================================================

# ── Credenciais do Rumble (Múltiplas Contas) ──────────────────────────────────
ACCOUNTS = [
    {"username": "uaijoaquim",   "password": "Joaquim1978@"},
    {"username": "joaquimcruz",  "password": "Joaquim1978@"},
    {"username": "naturalisofc", "password": "Joaquim1978@"},
    {"username": "realstories",  "password": "Joaquim1978@"},
    {"username": "olimpiamais",  "password": "Joaquim1978@"}
]

# ── Vídeos Alvo ───────────────────────────────────────────────────────────────
# Cole aqui os links dos vídeos que o bot deve assistir, curtir e comentar.
# Como o Cloudflare bloqueia o scraping do perfil, essa lista é usada diretamente.
MANUAL_VIDEOS = [
    "https://rumble.com/v76mlou-fred-and-gustavo-and-z-neto-and-cristiano-clube-dos-solteiros-karaok-com-se.html",
    "https://rumble.com/v76mlti-bruno-csar-e-rodrigo-and-z-neto-and-cristiano-gaiola-fechada-karaok-com-seg.html",
    "https://rumble.com/v76owmq-karaok-a-loira-do-carro-branco.html",
    "https://rumble.com/v76oxqq-karaok-boate-azul.html",
]

# ── Parâmetros de execução ────────────────────────────────────────────────────
MAX_VIDEOS = 5              # Número máximo de vídeos a processar por execução (0 = todos)
MIN_WATCH_SECONDS = 10      # Tempo mínimo de visualização por vídeo (reduzido para ser rápido)
HEADLESS = False            # True = Chrome sem janela visual

# ── Delays (em segundos) ──────────────────────────────────────────────────────
DELAY_BETWEEN_ACTIONS = (2, 5)    # (min, max) delay entre ações
DELAY_BETWEEN_VIDEOS  = (3, 8)    # (min, max) delay entre vídeos

# ── Proxies ───────────────────────────────────────────────────────────────────
# Deixe vazio para buscar proxies gratuitos automaticamente.
# Para proxies pagos/próprios, preencha no formato "ip:porta" ou "ip:porta:user:senha".
MANUAL_PROXIES = [
    # "201.148.32.120:8080",
    # "190.60.39.130:999",
]

USE_FREE_PROXIES = False    # Busca proxies da web se a lista manual estiver vazia
PROXY_TEST_TIMEOUT = 8      # Segundos para testar cada proxy antes de usar

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_FILE = "rumble_bot.log"
LOG_LEVEL = "INFO"          # DEBUG, INFO, WARNING, ERROR
