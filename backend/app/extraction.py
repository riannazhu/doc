from openai import OpenAI
from .config import settings

client = OpenAI(api_key=settings.openai_api_key)

EXTRACTION_SYSTEM_PROMPT = """You extract fields from bills/leases.
Return ONLY valid JSON with these keys:
{
  "amount_due_cents": <int or null>,
  "due_date_iso": "<YYYY-MM-DD or null>",
  "counterparty_name": "<string or null>",
  "late_fee_rule": {
    "is_present": <true|false>,
    "source_quote": "<short quote or ''>",
    "page_guess": <int or null>
  },
  "citations": [
    {"field": "amount_due_cents", "source_quote": "...", "page_guess": 1},
    {"field": "due_date_iso", "source_quote": "...", "page_guess": 1}
  ]
}"""

def extract_structured_fields(pages_text: list[str]) -> dict:
    limited = pages_text[:3]
    joined = "\n\n".join([f"<<PAGE {i+1}>>\n{t}" for i, t in enumerate(limited)])
    user_prompt = f"Document text (first pages):\n{joined}\n\nReturn JSON only."
    
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role":"system","content": EXTRACTION_SYSTEM_PROMPT},
                {"role":"user","content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        content = resp.choices[0].message.content.strip()
        import json
        result = json.loads(content)
        return result
    except Exception as e:
        print(f"Extraction error: {e}")
        print(f"Response content: {content if 'content' in locals() else 'No response'}")
        # Return empty result if extraction fails
        return {
            "amount_due_cents": None,
            "due_date_iso": None,
            "counterparty_name": None,
            "late_fee_rule": {"is_present": False, "source_quote": "", "page_guess": None},
            "citations": []
        }

