from openai import OpenAI
from .config import settings

client = OpenAI(api_key=settings.openai_api_key)

def embed_text_list(text_list: list[str]) -> list[list[float]]:
    # Using text-embedding-3-small (1536 dims)
    resp = client.embeddings.create(
        model="text-embedding-3-small",
        input=text_list
    )
    return [d.embedding for d in resp.data]

