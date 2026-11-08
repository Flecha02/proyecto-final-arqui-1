from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db import buscar_usuario
from app.tokens import leer_token

esquema_bearer = HTTPBearer(auto_error = False)

def usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(esquema_bearer)
):
    if credenciales is None:
        raise HTTPException(status_code = 401, detail = "Falta el token")

    datos = leer_token(credenciales.credentials)
    if datos is None:
        raise HTTPException(status_code = 401, detail = "Token inválido o vencido")

    #El estado se consulta en la base EN CADA petición: así el baneo
    #surte efecto de inmediato aunque el token siga vigente.
    usuario = buscar_usuario(datos["sub"])
    if usuario is None:
        raise HTTPException(status_code = 401, detail = "El usuario ya no existe")
    if usuario["estado"] == "baneado":
        raise HTTPException(status_code = 403, detail = "Usuario baneado")

    return usuario

def solo_admin(usuario = Depends(usuario_actual)):
    if usuario["rol"] != "admin":
        raise HTTPException(status_code = 403, detail = "Solo un administrador puede hacer esto")
    return usuario
