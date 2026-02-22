from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from app.models.schemas import SolucionMath
from app.agents.graph import app_graph
from app.services.ocr import extract_text_from_pdf
from app.services.pdf_gen import generate_solution_pdf
from app.data.default import default

router = APIRouter()



async def defoult_solve_problem():
    return default

@router.post("/solve", response_model=SolucionMath)
async def solve_problem(
    query: str = Form(None), 
    file: UploadFile = File(None)
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
        "final_json": {}
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


