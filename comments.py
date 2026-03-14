# =============================================================================
# comments.py — Pool de comentários variados para evitar repetição
# =============================================================================

import random
import string

COMMENT_POOL = [
    "Ótimo vídeo! Continue postando.",
    "Adorei o conteúdo, muito esclarecedor!",
    "Muito informativo, obrigado!",
    "Excelente trabalho, parabéns!",
    "Continue assim, sempre bom conteúdo!",
    "Conteúdo de qualidade, gostei muito!",
    "Incrível! Aprendi bastante com esse vídeo.",
    "Muito bom! Já compartilhei com meus amigos.",
    "Parabéns pelo trabalho, sempre agregando valor.",
    "Vídeo excelente, direto ao ponto!",
    "Que conteúdo bacana! Valeu pela dica.",
    "Simplesmente fantástico. Inscreve no canal de quem vê! 👏",
    "Muito bom mesmo! Esperando o próximo.",
    "Gostei muito! O tema foi abordado perfeitamente.",
    "Top demais! 🔥",
    "Sensacional! Continua com esse conteúdo.",
    "Muito bom, sempre aprendo algo novo aqui.",
    "Excelente vídeo, produção de qualidade.",
    "Conteúdo incrível! Obrigado por compartilhar.",
    "Muito relevante, parabéns pela dedicação!",
]

# Variadores de sufixo para diferenciar mensagens repetidas
SUFFIXES = [
    "", "!", " 👍", " 🎉", " 🙌", " 🔥", " ✅",
    " Valeu!", " Obrigado!", " Abraço!",
]


def get_random_comment() -> str:
    """Retorna um comentário aleatório com sufixo variado."""
    base = random.choice(COMMENT_POOL)
    suffix = random.choice(SUFFIXES)
    # Adiciona 1-2 letras aleatórias ao final para diferenciar ainda mais
    salt = "".join(random.choices(string.ascii_lowercase, k=random.randint(0, 2)))
    return f"{base}{suffix} {salt}".strip()
