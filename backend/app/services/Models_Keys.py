
from google import genai
from google.genai import types
from langchain_groq import ChatGroq

async def use_gemini(state: dict,prompt:str):
    """
    Extrae la key que viene del Frontend en cada petición
    """
    user_keys = state.get("rapi_keysq")
    
    if not user_keys or not user_keys.get("gemini"):
        raise ValueError("Falta la API Key de Gemini")
    
    client = genai.Client(api_key=user_keys)
        
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
            )
        )
        return response.text
        
        
    except Exception as e:
        print(f"❌ Error al generar estructura  con Gemini: {e}")
        return ""
    
async def use_llm_versatile(state: dict,prompt:str):
    """
    Extrae la key que viene del Frontend en cada petición
    """
    user_keys = state.get("api_keys")
    
    if not user_keys or not user_keys.get("groq"):
        raise ValueError("Falta la API Key de Groq")
    
    llm_resolver = ChatGroq(
        api_key=user_keys.get("groq"),
        model="llama-3.3-70b-versatile", 
        temperature=0.1
    )
        
    try:
        response = await llm_resolver.ainvoke(prompt) 
        return response.content
        
        
    except Exception as e:
        print(f"❌ Error al generar estructura  con Groq: {e}")
        return ""

async def use_llm_fast(state: dict,prompt:str):
    """
    Extrae la key que viene del Frontend en cada petición
    """
    user_keys = state.get("api_keys")
    
    if not user_keys or not user_keys.get("groq"):
        raise ValueError("Falta la API Key de Groq")
    
    llm_fast = ChatGroq(
        api_key=user_keys.get("groq"),
        model="llama-3.1-8b-instant", 
        temperature=0
    )
        
    try:
        response = await llm_fast.ainvoke(prompt) 
        return response.content
            
    except Exception as e:
        print(f"❌ Error al generar estructura  con Groq: {e}")
        return ""