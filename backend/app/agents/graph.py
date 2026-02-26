import json
import time
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from app.core.config import settings
from langchain_groq import ChatGroq
from app.models.schemas import SolucionMath
from app.agents.prompts import VALIDATOR_PROMPT, SOLVER_PROMPT, UX_PROMPT

# Importaciones del nuevo SDK de Google
from google import genai
from google.genai import types

from app.services.JsonParser import parse_text_to_json

class AgentState(TypedDict):
    user_input: str
    is_valid_math: bool
    solution_raw: str
    final_json: dict
    
# 1. CLIENTE GEMINI (El Arquitecto del JSON)
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# 2. CLIENTE GROQ RÁPIDO (El Portero)
llm_fast = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model="llama-3.1-8b-instant", 
    temperature=0
)

# 3. CLIENTE GROQ INTELIGENTE (El Matemático)
llm_resolver = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model="llama-3.3-70b-versatile", 
    temperature=0.1
)

# NODO 1: VALIDACIÓN (Groq 8B)
async def validator_node(state: AgentState):
    """Verifica si el input es matemáticas."""
    print("🕵️ Iniciando Validator (Groq 8B)...")
    start_time = time.time()
    
    response = await llm_fast.ainvoke(f"{VALIDATOR_PROMPT}\nInput: {state['user_input']}")
    is_valid = "YES" in response.content.upper()
    
    print(f"✅ Validator terminado en {time.time() - start_time:.2f}s.")
    return {"is_valid_math": is_valid}

# NODO 2: RESOLUCIÓN (Groq 70B)
async def solver_node(state: AgentState):
    """Resuelve el problema matemático muy rápido y guarda la solución cruda."""
    print("🧠 Iniciando Solver (Groq 70B)...")
    start_time = time.time()
    
    prompt = f"{SOLVER_PROMPT}\nProblema: {state['user_input']}"
    response = await llm_resolver.ainvoke(prompt)
    
    print(f"✅ Solver terminado en {time.time() - start_time:.2f}s.")
    return {"solution_raw": response.content}

# NODO 3: MAQUETACIÓN (Gemini 1.5 Pro)
async def ux_scripter_node(state: AgentState):
    """Convierte la solución en pasos JSON estructurados usando Gemini."""
    print("🎨 Iniciando UX Scripter (Gemini 1.5 Pro)...")
    start_time = time.time()
    
    prompt = f"{UX_PROMPT}\nSolución Base (Básate en esto para crear los pasos):\n{state['solution_raw']}"
    
    try:
        # Usamos el modelo estable 1.5-pro, que es el rey contando caracteres y JSON
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
            )
        )
        raw_text = response.text
        final_json=parse_text_to_json(raw_text)
        print(f"✅ UX Scripter terminado en {time.time() - start_time:.2f}s ⚡")
        
    except Exception as e:
        print(f"❌ Error al parsear JSON con Gemini: {e}")
        final_json = {"escenas": []}
        
    return {"final_json": final_json}
    
# ==========================================
# CONSTRUCCIÓN DEL GRAFO
# ==========================================
workflow = StateGraph(AgentState)

workflow.add_node("validator", validator_node)
workflow.add_node("solver", solver_node)
workflow.add_node("ux_scripter", ux_scripter_node)

workflow.set_entry_point("validator")

def check_validity(state: AgentState):
    if state["is_valid_math"]:
        return "solver"
    return END

workflow.add_conditional_edges(
    "validator",
    check_validity,
    {
        "solver": "solver",
        END: END
    }
)

workflow.add_edge("solver","ux_scripter")
workflow.add_edge("ux_scripter", END)

app_graph = workflow.compile()