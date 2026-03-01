from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from lief import Header
from app.models.schemas import DetectedProblemsResponse, ExplainRequest, SolucionMath
from app.agents.graph import app_graph
from app.services.ocr import extract_text_from_pdf
from app.services.pdf_gen import generate_solution_pdf
from app.data.default import default,default4
from app.services.sanitazer import sanitize_latex_highlights
from app.services.JsonParser import parse_text_to_json
from app.services.ProblemSplitterAI import split_problems_with_ai

router = APIRouter()

@router.post("/scan_problems", response_model=DetectedProblemsResponse)
async def scan_problems_from_file(file: UploadFile = File(...),x_gemini_key:Optional[str]=Header(None,alias="x-gemini-key")):
    """
    Recibe PDF o Imagen y usa IA Vision para detectar ejercicios.
    """
    if not x_gemini_key:
        raise HTTPException(400, "Falta la API Key de Gemini. Configúrala en Ajustes.")
    try:
        content = await file.read()
        mime_type = file.content_type

        # Validamos formatos soportados por Gemini
        if mime_type not in ["application/pdf", "image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(400, "Formato no soportado. Usa PDF, JPG o PNG.")

        detected_problems = split_problems_with_ai(content, mime_type,api_key=x_gemini_key)
        
        if not detected_problems:
            return {"problems": ["No pudimos detectar ejercicios claros. Intenta recortar la imagen."]}

        return {"problems": detected_problems}

    except Exception as e:
        print(f"Error procesando archivo: {e}")
        raise HTTPException(500, "Error interno al procesar el documento con IA.")



async def default_json_problem():
    json_res=parse_text_to_json(default4)
    return json_res

@router.post("/explain_step")
async def explain_step_deeply(req: ExplainRequest,x_gemini_key:Optional[str]=Header(None,alias="x-gemini-key"),x_groq_key:Optional[str]=Header(None,alias="x-groq-key")):
    
    api_keys={"gemini":x_gemini_key,"groq":x_groq_key}
    
    initial_state = {
        "user_input": "", 
        "is_valid_math": False,
        "solution_raw": "", 
        "structured_solution": "",
        "final_json": {},
        "api_keys": api_keys,
        "req": req,
        "explain": True
    }
    result = await app_graph.ainvoke(initial_state)
    return result["final_json"]

async def defoult_solve_problem():
    return {"escenas":[sanitize_latex_highlights(default4)]}

@router.post("/solve",response_model=SolucionMath)
async def solve_problem(
    query: str = Form(None), 
    file: UploadFile = File(None),
    x_gemini_key: Optional[str] = Header(None, alias="x-gemini-key"),
    x_groq_key: Optional[str] = Header(None, alias="x-groq-key")
):
    user_input = ""
    
    # 1. Prioridad al archivo si existe
    if file:
        if file.content_type == "application/pdf":
            content = await file.read()
            user_input = extract_text_from_pdf(content)
        else:
            raise HTTPException(400, "Solo se aceptan PDFs por ahora")
    elif query:
        user_input = query
    else:
        raise HTTPException(400, "Debes enviar texto o un archivo PDF")

    # 2. Ejecutar Grafo (LangGraph)
    initial_state = {
        "user_input": user_input, 
        "is_valid_math": False,
        "solution_raw": "", 
        "structured_solution": "",
        "final_json": {},
        "api_keys": {
            "gemini": x_gemini_key,
            "groq": x_groq_key
        },
        "req": None,
        "explain": False
    }
    result = await app_graph.ainvoke(initial_state)

    if not result["is_valid_math"]:
        raise HTTPException(400, "El contenido no parece ser un problema matemático válido.")
    print("Resultado del Grafo:", result["final_json"])
    return result["final_json"]

@router.post("/download-pdf")
async def download_solution(solucion_raw: str = Form(...)):
    """Genera y descarga el PDF bajo demanda basado en la solución"""
    path = generate_solution_pdf(solucion_raw)
    return FileResponse(path, filename="mi_tarea_resuelta.pdf", media_type='application/pdf')


