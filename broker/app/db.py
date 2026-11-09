import psycopg2
from psycopg2.extras import RealDictCursor

from app.config import config
from app.passwords import crear_password

def obtener_conexion():
    return psycopg2.connect(
        config.database_url,  # psycopg2 acepta la URI completa de conexión de Supabase
        cursor_factory=RealDictCursor  # Las filas llegan como diccionarios
    )

def crear_tablas_y_usuarios_iniciales() -> None:
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        # En PostgreSQL creamos primero los tipos ENUM si no existen
        cursor.execute(
            """
            DO $$ BEGIN
                CREATE TYPE rol_usuario AS ENUM ('admin', 'usuario');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            """
        )
        cursor.execute(
            """
            DO $$ BEGIN
                CREATE TYPE estado_usuario AS ENUM ('activo', 'baneado');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            """
        )
        # Crear la tabla de usuarios con sintaxis de Postgres
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                usuario VARCHAR(50) PRIMARY KEY,
                password_hash VARCHAR(255) NOT NULL,
                rol rol_usuario NOT NULL DEFAULT 'usuario',
                estado estado_usuario NOT NULL DEFAULT 'activo'
            )
            """
        )
        cursor.execute("SELECT COUNT(*) AS total FROM usuarios")
        resultado = cursor.fetchone()
        if resultado["total"] == 0:
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
        fila = cursor.fetchone()  # None si no existe
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