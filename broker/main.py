from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.db import crear_tablas_y_usuarios_iniciales
from app.routes import admin, auth, proxy  # O importa router_productos y router_pedidos

@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    crear_tablas_y_usuarios_iniciales()
    yield

app = FastAPI(title="Broker", lifespan=ciclo_de_vida)

app.include_router(auth.router)
app.include_router(admin.router)

# Incluimos los routers de proxy separados para que Swagger los organice bien
app.include_router(proxy.router_productos)
app.include_router(proxy.router_pedidos)

@app.get("/")
def root():
    return {"mensaje": "Broker iniciado"}