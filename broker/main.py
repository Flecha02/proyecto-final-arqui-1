from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import crear_tablas_y_usuarios_iniciales
from app.routes import admin, auth, proxy

@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    crear_tablas_y_usuarios_iniciales()  #se ejecuta una vez al arrancar
    yield

app = FastAPI(title = "Broker", lifespan = ciclo_de_vida)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(proxy.router)

@app.get("/")
def root():
    return {
        "mensaje": "Broker iniciado"
    }
