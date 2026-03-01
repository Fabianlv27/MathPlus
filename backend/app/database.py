from sqlmodel import SQLModel, create_engine, Session, Field
from typing import Optional
import os

sqlite_file_name = "math_tutor_local.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url)

# --- MODELO DE DATOS ---
class Ejercicio(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    contenido_json: str  # Aquí guardas el JSON completo de la escena
    tags: str # Para filtrar (ej: "algebra, derivas")
    fecha: str

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session