from fastapi import APIRouter, Depends, HTTPException

from app.db import buscar_usuario, cambiar_estado, listar_usuarios
from app.dependencies import solo_admin

#dependencies=[...] protege TODAS las rutas de este router
router = APIRouter(
    prefix = "/admin", tags = ["Administración"], dependencies = [Depends(solo_admin)]
)

@router.get("/usuarios")
def listar():
    return listar_usuarios()

@router.post("/usuarios/{usuario}/banear")
def banear(usuario: str):
    objetivo = buscar_usuario(usuario)
    if objetivo is None:
        raise HTTPException(status_code = 404, detail = f"No existe el usuario {usuario}")
    if objetivo["rol"] == "admin":
        raise HTTPException(status_code = 400, detail = "No se puede banear a un administrador")
    cambiar_estado(usuario, "baneado")
    return {"usuario": usuario, "estado": "baneado"}

@router.post("/usuarios/{usuario}/desbanear")
def desbanear(usuario: str):
    if buscar_usuario(usuario) is None:
        raise HTTPException(status_code = 404, detail = f"No existe el usuario {usuario}")
    cambiar_estado(usuario, "activo")
    return {"usuario": usuario, "estado": "activo"}
