import json
import time
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from app.core.config import settings
from langchain_groq import ChatGroq
from app.models.schemas import SolucionMath
from app.agents.prompts import VALIDATOR_PROMPT, SOLVER_PROMPT, UX_PROMPT, corrector_prompt, get_explainer_prompt

from google import genai
from google.genai import types

from app.services.JsonParser import parse_text_to_json
from app.services.sanitazer import sanitize_latex_highlights

class AgentState(TypedDict):
    user_input: str
    is_valid_math: bool
    solution_raw: str
    structured_solution: str
    final_json: dict
    req:dict
    explain:bool
    
client = genai.Client(api_key=settings.GEMINI_API_KEY)

llm_fast = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model="llama-3.1-8b-instant", 
    temperature=0
)

llm_resolver = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model="llama-3.3-70b-versatile", 
    temperature=0.1
)

async def route_node(state: AgentState):
    return

async def validator_node(state: AgentState):
    """Verifica si el input es matemáticas."""
    print("🕵️ Iniciando Validator (Groq 8B)...")
    start_time = time.time()
    
    response = await llm_fast.ainvoke(f"{VALIDATOR_PROMPT}\nLo que el usuario a escrito es: {state['user_input']}")
    is_valid = "YES" in response.content.upper()
    
    print(f"✅ Validator terminado en {time.time() - start_time:.2f}s.")
    return {"is_valid_math": is_valid}

async def explainer_node(state: AgentState):
    prompt=get_explainer_prompt(state["req"])
    try:
        response =await llm_resolver.ainvoke(prompt) 
        return {"solution_raw": response.content}
        
    except Exception as e:
        print(f"❌ Error al generar explicaciones con Groq: {e}")
        return {"final_json": {}}

async def solver_node(state: AgentState):
    """Resuelve el problema matemático muy rápido y guarda la solución cruda."""
    print("🧠 Iniciando Solver (Groq 70B)...")
    start_time = time.time()
    
    prompt = f"{SOLVER_PROMPT}\nProblema: {state['user_input']}"
    response = await llm_resolver.ainvoke(prompt)
    
    print(f"✅ Solver terminado en {time.time() - start_time:.2f}s.")
    return {"solution_raw": response.content}

async def ux_scripter_node(state: AgentState):
    """Convierte la solución en pasos JSON estructurados usando Gemini."""
    print("🎨 Iniciando UX Scripter (Gemini 1.5 Pro)...")
    
    prompt = f"{UX_PROMPT}\nSolución Base (Básate en esto para crear los pasos) ten en cuenta que tambien se puede tratar de una explicacion de una parte de un problema , si es asi ,no saludes y sigue al pie de la letra los pasos dados: \n{state['solution_raw']}"
    
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
            )
        )
        return{"structured_solution": response.text}
        
        
    except Exception as e:
        print(f"❌ Error al generar estructura  con Gemini: {e}")
        
    return {"structured_solution": ""}
 
async def corrector_node(state: AgentState):
    """Corrige la solución si es necesario (opcional)."""
    prompt=f"{corrector_prompt}\nSolución Actual:\n{state['structured_solution']}"
    try:
        response =await llm_resolver.ainvoke(prompt)
        raw_text = response.text
        raw_scene_dict=parse_text_to_json(raw_text)
        if raw_scene_dict["escenas"]:
            safe_text=sanitize_latex_highlights(raw_scene_dict["escenas"][0])
            final_json={"escenas":[safe_text]}
        else:
            final_json=raw_scene_dict
        return {"final_json": final_json}
    except Exception as e:
        print(f"❌ Error en el corrector: {e}")
        return {"final_json": {}}

workflow = StateGraph(AgentState)

workflow.add_node("route", route_node)
workflow.add_node("validator", validator_node)
workflow.add_node("solver", solver_node)
workflow.add_node("ux_scripter", ux_scripter_node)
workflow.add_node("explainer", explainer_node)
workflow.add_node("corrector",corrector_node)

workflow.set_entry_point("route")

def check_validity(state: AgentState):
       
    if state["is_valid_math"]:
        return "solver"
    return END

def check_explainer(state: AgentState):
    if state["explain"]:
        return "explainer"
    return "validator"

workflow.add_conditional_edges(
    "route",
    check_explainer,
    {
        "explainer": "explainer",
        "validator": "validator"
    }
)
workflow.add_conditional_edges(
    "validator",
    check_validity,
    {
        "solver": "solver",
        END: END
    }
)

workflow.add_edge("solver","ux_scripter")
workflow.add_edge("explainer","ux_scripter")
workflow.add_edge("ux_scripter", "corrector")
workflow.add_edge("corrector", END)

app_graph = workflow.compile()