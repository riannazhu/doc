import psycopg
from contextlib import asynccontextmanager
from .config import settings

@asynccontextmanager
async def get_db():
    async with await psycopg.AsyncConnection.connect(settings.postgres_connection_url) as conn:
        async with conn.cursor() as cur:
            yield conn, cur

