from time import time
from app.models.schemas import AgentState
from app.agents.prompts import SOLVER_PROMPT
from app.services.Models_Keys import use_llm_versatile

async def solver_node(state: AgentState):
    """Resuelve el problema matemático muy rápido y guarda la solución cruda."""
    print("🧠 Iniciando Solver (Groq 70B)...")
    start_time = time.time()
    
    prompt = f"{SOLVER_PROMPT}\nProblema: {state['user_input']}"
    response = await use_llm_versatile(state,prompt)
    
    print(f"✅ Solver terminado en {time.time() - start_time:.2f}s.")
    return {"solution_raw":response }