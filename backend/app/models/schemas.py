from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class PasoAnimacion(BaseModel):
    texto_voz: str = Field(description="Texto narrativo para el audio")
    latex_visible: str = Field(description="Fórmula LaTeX a mostrar")
    elementos_foco: List[str] = Field(description="IDs de elementos a resaltar")
    accion_dom: Literal['aparecer', 'mover', 'resaltar', 'desaparecer', 'ninguna']

class SolucionMath(BaseModel):
    es_matematico: bool = Field(description="True si es un problema matemático válido")
    explicacion_general: str
    pasos: List[PasoAnimacion]
    
# Input que recibe tu API
class UserRequest(BaseModel):
    query: str
    file_content: Optional[str] = None # Para contenido de PDF parseado