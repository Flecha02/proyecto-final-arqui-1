from pydantic_settings import BaseSettings, SettingsConfigDict

class Config(BaseSettings):
    secret_key: str
    algoritmo: str = "HS256"
    minutos_expiracion: int = 30
    
    url_ms_productos: str = "https://proyecto-final-arqui-1.onrender.com"
    url_ms_pedidos: str = "https://servicio-pedidos-kyr4.onrender.com"
    
    database_url: str  # URL única del Session Pooler de Supabase

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

config = Config()