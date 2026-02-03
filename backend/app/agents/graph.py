import os
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from app.core.config import settings
from langchain_groq import ChatGroq
from app.models.schemas import SolucionMath
from app.agents.prompts import VALIDATOR_PROMPT, SOLVER_PROMPT, UX_PROMPT

# 1. Definir el Estado del Grafo (La memoria compartida entre agentes)
class AgentState(TypedDict):
    user_input: str
    is_valid_math: bool
    solution_raw: str
    final_json: dict


# Para validación rápida
llm_fast = ChatGroq(
    api_key=settings.GROQ_API_KEY,  # <--- AQUÍ ESTÁ LA SOLUCIÓN
    model="llama-3.1-8b-instant", 
    temperature=0
)
 # Para resolver

llm_smart = ChatGroq(
    api_key=settings.GROQ_API_KEY,  # <--- AQUÍ TAMBIÉN
    model="llama-3.3-70b-versatile", 
    temperature=0.2
)
# 3. Definir Nodos (Las funciones de cada agente)

def validator_node(state: AgentState):
    """Verifica si el input es matemáticas."""
    response = llm_fast.invoke(f"{VALIDATOR_PROMPT}\nInput: {state['user_input']}")
    # Asumimos que el prompt fuerza una respuesta "YES" o "NO" o un JSON simple
    is_valid = "YES" in response.content.upper()
    return {"is_valid_math": is_valid}

def solver_node(state: AgentState):
    """Resuelve el problema matemáticamente."""
    response = llm_smart.invoke(f"{SOLVER_PROMPT}\nProblema: {state['user_input']}")
    return {"solution_raw": response.content}

def ux_scripter_node(state: AgentState):
    """Convierte la solución en pasos JSON para el Frontend."""
    # Usamos .with_structured_output para forzar el esquema Pydantic (genial en Groq)
    structured_llm = llm_smart.with_structured_output(SolucionMath)
    
    json_result = structured_llm.invoke(
        f"{UX_PROMPT}\nSolución Base: {state['solution_raw']}"
    )
    return {"final_json": json_result.dict()}

# 4. Construir el Grafo
workflow = StateGraph(AgentState)

workflow.add_node("validator", validator_node)
workflow.add_node("solver", solver_node)
workflow.add_node("ux_scripter", ux_scripter_node)

# 5. Definir el flujo (Aristas)
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

workflow.add_edge("solver", "ux_scripter")
workflow.add_edge("ux_scripter", END)

# 6. Compilar
app_graph = workflow.compile()