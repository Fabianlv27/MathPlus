from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from app.models.schemas import ExplainRequest, SolucionMath
from app.agents.graph import app_graph
from app.services.ocr import extract_text_from_pdf
from app.services.pdf_gen import generate_solution_pdf
from app.data.default import default,default4
from app.services.sanitazer import sanitize_latex_highlights
from app.services.JsonParser import parse_text_to_json
from app.agents.Explainator import Explainer
router = APIRouter()



@router.post("/solve",response_model=SolucionMath)
async def default_json_problem():
    json_res=parse_text_to_json(default4)
    return json_res

@router.post("/explain_step")
async def explain_step_deeply(req: ExplainRequest):
    return await Explainer(req)
async def defoult_solve_problem():
    return {"escenas":[sanitize_latex_highlights(default4)]}


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
        "structured_solution": "",
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


