
from google import genai
from app.core.config import settings
from app.agents.prompts import get_explainer_prompt
from google.genai import types

from app.services.JsonParser import parse_text_to_json

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def Explainer(req):
    prompt=get_explainer_prompt(req)
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
            )
        )
        json_response=parse_text_to_json(response.text)
        
        return json_response
        
    except Exception as e:
        print(f"❌ Error al generar estructura  con Gemini: {e}")
        return {"final_json": {}}