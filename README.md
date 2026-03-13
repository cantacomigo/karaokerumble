# 🤖 Rumble Bot — Automação de Engajamento

Bot Python para automatizar visualizações, curtidas e comentários nos seus vídeos do Rumble, com rotação de proxy e comportamento simulado de usuário humano.

---

## ⚠️ Aviso Legal

> Este script é fornecido **exclusivamente para fins educacionais e de pesquisa técnica**.  
> Automatizar interações (views, likes, comentários) pode violar os [Termos de Serviço do Rumble](https://rumble.com/s/terms) e pode resultar em **banimento de conta** ou outras sanções.  
> **Use por sua conta e risco.** O autor não se responsabiliza pelo uso indevido.

---

## 📁 Estrutura dos Arquivos

```
rumble/
├── config.py          # ← Edite aqui: credenciais, proxies e configurações
├── comments.py        # Pool de comentários aleatórios  
├── proxy_manager.py   # Busca e rotação de proxies
├── rumble_bot.py      # Script principal
├── requirements.txt   # Dependências Python
└── README.md
```

---

## 🖥️ Pré-requisitos

| Requisito | Versão mínima |
|-----------|---------------|
| Python | 3.10+ |
| Google Chrome | qualquer versão atual |
| pip | qualquer |

> **O ChromeDriver** é baixado automaticamente pelo `webdriver-manager` — não precisa instalar manualmente.

---

## 🚀 Instalação Passo a Passo

### 1. Abra o PowerShell na pasta do projeto

```powershell
cd C:\Users\joaqu\.gemini\antigravity\playground\rumble
```

### 2. Crie e ative um ambiente virtual (recomendado)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

> Se aparecer erro de política de execução, rode antes:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

### 3. Instale as dependências

```powershell
pip install -r requirements.txt
```

---

## ⚙️ Configuração

Abra o arquivo **`config.py`** e edite:

```python
# Suas credenciais do Rumble
RUMBLE_USERNAME = "seu_usuario_aqui"
RUMBLE_PASSWORD = "sua_senha_aqui"

# Quantos vídeos processar por execução (0 = todos)
MAX_VIDEOS = 5

# Tempo mínimo de visualização por vídeo (segundos)
MIN_WATCH_SECONDS = 30

# True para rodar o Chrome sem janela (modo silencioso)
HEADLESS = False
```

### Configurando Proxies (opcional)

**Opção A — Proxies automáticos (gratuitos):**
```python
USE_FREE_PROXIES = True   # já habilitado por padrão
MANUAL_PROXIES = []       # deixe vazio
```

**Opção B — Seus próprios proxies:**
```python
MANUAL_PROXIES = [
    "201.148.32.120:8080",
    "190.60.39.130:999",
    # formato com autenticação: "ip:porta:usuario:senha"
]
USE_FREE_PROXIES = False
```

> ⚠️ Proxies gratuitos são instáveis. Para uso sério, considere proxies pagos (ex: [BrightData](https://brightdata.com), [Oxylabs](https://oxylabs.io)).

---

## ▶️ Executando

```powershell
python rumble_bot.py
```

O bot irá:
1. 🌐 Buscar e validar proxies
2. 🔐 Fazer login na sua conta
3. 🔍 Extrair os links dos vídeos do perfil
4. ▶️ Para cada vídeo:
   - Abrir o link com um proxy diferente
   - Assistir por tempo aleatório (30s → duração total)
   - Dar like 👍
   - Postar comentário aleatório 💬
   - Aguardar delay aleatório antes do próximo

---

## 📋 Logs

Todas as ações são registradas em **`rumble_bot.log`** e também exibidas no terminal.

```
2026-03-03 17:00:01 [INFO] 🌐 Proxy ativo: 201.148.32.120:8080
2026-03-03 17:00:05 [INFO] ✅ Login realizado com sucesso!
2026-03-03 17:00:06 [INFO] 📋 8 vídeos encontrados.
2026-03-03 17:00:08 [INFO] ▶️  Abrindo vídeo: https://rumble.com/v/...
2026-03-03 17:00:37 [INFO] 👍 Like dado com sucesso!
2026-03-03 17:00:45 [INFO] 💬 Comentário postado: "Ótimo vídeo! Continue postando. 👍"
```

---

## 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| `ModuleNotFoundError` | Rode `pip install -r requirements.txt` |
| ChromeDriver incompatível | O `webdriver-manager` atualiza automaticamente; verifique se o Chrome está atualizado |
| Login falha | Confirme usuário/senha no `config.py`; verifique se o Rumble não exige 2FA |
| Nenhum vídeo encontrado | O seletor CSS pode ter mudado; abra a página manualmente e inspecione os links |
| Todos proxies falham | Use `USE_FREE_PROXIES = False` e rode sem proxy; ou configure proxies pagos |
| Erro de política no PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## 🗂️ Personalizando Comentários

Edite a lista `COMMENT_POOL` em **`comments.py`** para adicionar seus próprios comentários:

```python
COMMENT_POOL = [
    "Seu comentário personalizado aqui!",
    "Mais um comentário diferente.",
    ...
]
```
