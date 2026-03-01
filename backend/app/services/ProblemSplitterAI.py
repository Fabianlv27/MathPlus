import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List

from app.models.schemas import ProblemList

def split_problems_with_ai(file_content: bytes, mime_type: str,api_key:str) -> List[str]:
 
    if not api_key:
        print("Error: GEMINI_API_KEY no encontrada.")
        return []

    client = genai.Client(api_key=api_key)

    prompt_text = """
    Analiza esta imagen/documento de una tarea de matemáticas.
    Tu objetivo es IDENTIFICAR y EXTRAER cada problema individualmente.
    
    INSTRUCCIONES:
    1. Si hay varios ejercicios numerados (1, 2, 3...), separa cada uno.
    2. Si un ejercicio tiene incisos (a, b, c), MANTENLOS JUNTOS en el mismo bloque del problema principal.
    3. Ignora encabezados, pies de página o instrucciones generales.
    4. Devuelve el texto exacto. Si hay fórmulas, transcríbelas a LaTeX.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_text(text=prompt_text),
                        types.Part.from_bytes(data=file_content, mime_type=mime_type)
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=ProblemList, # Pasamos la clase Pydantic directo
                temperature=0.1
            )
        )
        if response.parsed:
            return response.parsed.problems
        
        return []

    except Exception as e:
        print(f"Error en AI Splitter (google-genai): {e}")
        return []