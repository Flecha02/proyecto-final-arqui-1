import pymysql
from pymysql.cursors import DictCursor

from app.config import config
from app.passwords import crear_password

def obtener_conexion():
    return pymysql.connect(
        host = config.db_host,
        port = config.db_port,
        user = config.db_usuario,
        password = config.db_password,
        database = config.db_name,
        cursorclass = DictCursor  #las filas llegan como diccionarios
    )

def crear_tablas_y_usuarios_iniciales() -> None:
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                usuario VARCHAR(50) PRIMARY KEY,
                password_hash VARCHAR(255) NOT NULL,
                rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
                estado ENUM('activo', 'baneado') NOT NULL DEFAULT 'activo'
            )
            """
        )
        cursor.execute("SELECT COUNT(*) AS total FROM usuarios")
        if cursor.fetchone()["total"] == 0:
            iniciales = [
                ("admin", "admin123", "admin"),
                ("maria", "maria123", "usuario"),
                ("carlos", "carlos123", "usuario"),
            ]
            for usuario, password, rol in iniciales:
                cursor.execute(
                    "INSERT INTO usuarios (usuario, password_hash, rol) VALUES (%s, %s, %s)",
                    (usuario, crear_password(password), rol)
                )
    conexion.commit()
    conexion.close()

def buscar_usuario(usuario: str):
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute("SELECT * FROM usuarios WHERE usuario = %s", (usuario,))
        fila = cursor.fetchone()  #None si no existe
    conexion.close()
    return fila

def listar_usuarios():
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute("SELECT usuario, rol, estado FROM usuarios ORDER BY usuario")
        filas = cursor.fetchall()
    conexion.close()
    return filas

def cambiar_estado(usuario: str, estado: str) -> None:
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute(
            "UPDATE usuarios SET estado = %s WHERE usuario = %s", (estado, usuario)
        )
    conexion.commit()
    conexion.close()
