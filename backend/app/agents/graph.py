import json
import os
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from app.core.config import settings
from langchain_groq import ChatGroq
from app.models.schemas import SolucionMath
from app.agents.prompts import VALIDATOR_PROMPT, SOLVER_PROMPT, UX_PROMPT
from google import genai
from google.genai import types
# 1. Definir el Estado del Grafo (La memoria compartida entre agentes)
class AgentState(TypedDict):
    user_input: str
    is_valid_math: bool
    solution_raw: str
    final_json: dict
    
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Para validación rápida
llm_fast = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model="llama-3.1-8b-instant", 
    temperature=0
)

llm_resolver=ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model="llama-3.3-70b-versatile", 
    temperature=0.1
)

structured_scripter = llm_resolver.with_structured_output(SolucionMath,method="json_mode")

async def validator_node(state: AgentState):
    """Verifica si el input es matemáticas."""
    response = await llm_fast.ainvoke(f"{VALIDATOR_PROMPT}\nInput: {state['user_input']}")
    print(f"Validator response: {response.content.strip()}")
    is_valid = "YES" in response.content.upper()
    return {"is_valid_math": is_valid}

async def solver_node(state: AgentState):
   """Resuelve el problema matemático y guarda la solución cruda."""
   
   prompt=f"{SOLVER_PROMPT}\nProblema: {state['user_input']}"
   response= await llm_resolver.ainvoke(prompt)
   return {"solution_raw": response.content}


async def ux_scripter_node(state: AgentState):
    """Convierte la solución en pasos JSON para el Frontend."""
    prompt = f"{UX_PROMPT}\nSolución Base (Básate en esto para crear los pasos):\n{state['solution_raw']}"
    try:
        
        response = await structured_scripter.ainvoke(prompt)
        if hasattr(response, 'model_dump'):
            final_json = response.model_dump()
        else:
            final_json = json.loads(response.content)
    except Exception as e:
        print(f"Error al parsear JSON: {e}")
        return {"final_json": {"escenas": []}}
    return {"final_json": final_json}
    
    

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