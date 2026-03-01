import time
from app.models.schemas import AgentState
from app.agents.prompts import VALIDATOR_PROMPT
from app.services.Models_Keys import use_llm_fast

async def validator_node(state: AgentState):
    """Verifica si el input es matemáticas."""
    print("🕵️ Iniciando Validator (Groq 8B)...")
    start_time = time.time()
    
    response = await use_llm_fast(state,f"{VALIDATOR_PROMPT}\nLo que el usuario a escrito es: {state['user_input']}")

    is_valid = "YES" in response.upper()
    
    print(f"✅ Validator terminado en {time.time() - start_time:.2f}s.")
    return {"is_valid_math": is_valid}