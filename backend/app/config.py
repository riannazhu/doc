from pydantic import BaseModel
import os

class Settings(BaseModel):
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    postgres_connection_url: str = os.getenv("POSTGRES_CONNECTION_URL", "")
    supabase_storage_bucket: str = os.getenv("SUPABASE_STORAGE_BUCKET", "private-user-docs")
    file_chunk_page_limit: int = int(os.getenv("FILE_CHUNK_PAGE_LIMIT", "3"))

settings = Settings()

