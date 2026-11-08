from datetime import datetime, timedelta, timezone

import jwt

from app.config import config

def crear_token(usuario: str, rol: str) -> str:
    datos = {
        "sub": usuario,
        "rol": rol,
        "exp": datetime.now(timezone.utc) + timedelta(minutes = config.minutos_expiracion)
    }
    return jwt.encode(datos, config.secret_key, algorithm = config.algoritmo)

def leer_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, config.secret_key, algorithms = [config.algoritmo])
    except jwt.PyJWTError:
        #Token alterado, mal formado o vencido
        return None
