# backend/app/core/config.py
import os
from dotenv import load_dotenv

# Esto busca el archivo .env y carga las variables
load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GROQ_API_KEY:
        raise ValueError("❌ No se encontró la variable GROQ_API_KEY en el archivo .env")
    if not GEMINI_API_KEY:
        raise ValueError("❌ No se encontró la variable GEMINI_API_KEY en el archivo .env")

settings = Settings()