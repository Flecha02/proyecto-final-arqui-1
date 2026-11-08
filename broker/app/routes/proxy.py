import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from app.config import config
from app.dependencies import usuario_actual

router = APIRouter(tags=["Proxy / Gateway"])

METODOS = ["GET", "POST", "PUT", "PATCH", "DELETE"]

# --- Proxy para el Microservicio de Productos ---
@router.api_route("/productos", methods=METODOS)
@router.api_route("/productos/{ruta:path}", methods=METODOS)
async def reenviar_a_productos(
    request: Request, ruta: str = "", usuario = Depends(usuario_actual)
):
    # El usuario pasó el filtro de autenticación
    destino = f"{config.url_ms_productos}/api/productos"
    if ruta:
        destino += f"/{ruta}"

    cabeceras = {"X-Usuario": usuario["usuario"]}
    if "content-type" in request.headers:
        cabeceras["Content-Type"] = request.headers["content-type"]

    try:
        async with httpx.AsyncClient(timeout=10) as cliente:
            respuesta = await cliente.request(
                request.method,
                destino,
                params=request.query_params,
                content=await request.body(),
                headers=cabeceras
            )
    except httpx.ConnectError:
        raise HTTPException(status_code=502, detail="El Servicio de Productos no está disponible")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="El Servicio de Productos tardó demasiado en responder")

    return Response(
        content=respuesta.content,
        status_code=respuesta.status_code,
        media_type=respuesta.headers.get("content-type")
    )


# --- Proxy para el Microservicio de Pedidos ---
@router.api_route("/pedidos", methods=METODOS)
@router.api_route("/pedidos/{ruta:path}", methods=METODOS)
async def reenviar_a_pedidos(
    request: Request, ruta: str = "", usuario = Depends(usuario_actual)
):
    # El usuario pasó el filtro de autenticación
    destino = f"{config.url_ms_pedidos}/pedidos"
    if ruta:
        destino += f"/{ruta}"

    cabeceras = {"X-Usuario": usuario["usuario"]}
    if "content-type" in request.headers:
        cabeceras["Content-Type"] = request.headers["content-type"]

    try:
        async with httpx.AsyncClient(timeout=10) as cliente:
            respuesta = await cliente.request(
                request.method,
                destino,
                params=request.query_params,
                content=await request.body(),
                headers=cabeceras
            )
    except httpx.ConnectError:
        raise HTTPException(status_code=502, detail="El Servicio de Pedidos no está disponible")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="El Servicio de Pedidos tardó demasiado en responder")

    return Response(
        content=respuesta.content,
        status_code=respuesta.status_code,
        media_type=respuesta.headers.get("content-type")
    )