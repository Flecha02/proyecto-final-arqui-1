from pydantic_settings import BaseSettings, SettingsConfigDict

class Config(BaseSettings):
    secret_key: str
    algoritmo: str = "HS256"
    minutos_expiracion: int = 30
    
    url_ms_productos: str = "http://localhost:3001"
    url_ms_pedidos: str = "http://localhost:3002"
    
    db_host: str = "db.lngkrweebixqacagakps.supabase.co"
    db_port: int = 5432
    db_usuario: str = "postgres"
    db_password: str = "TU_CONTRASEÑA_DE_SUPABASE"
    db_name: str = "postgres"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

config = Config()