# app/services/vision.py (Nuevo archivo)
import base64
from langchain_groq import ChatGroq

def analizar_imagen_geometria(image_bytes):
    """Convierte imagen a descripción textual geométrica"""
    llm_vision = ChatGroq(model="llama-3.2-11b-vision-preview", temperature=0)
    
    # Codificar imagen en base64
    encoded_image = base64.b64encode(image_bytes).decode('utf-8')
    image_url = f"data:image/jpeg;base64,{encoded_image}"

    msg = llm_vision.invoke(
        [
            {"role": "user", "content": [
                {"type": "text", "text": "Describe este problema geométrico en detalle. Menciona formas, etiquetas, valores numéricos y qué se pide calcular."},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]}
        ]
    )
    return msg.content