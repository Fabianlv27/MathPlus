from app.models.schemas import AgentState
from app.agents.prompts import get_explainer_prompt
from app.services.Models_Keys import use_llm_versatile

async def explainer_node(state: AgentState):
    prompt=get_explainer_prompt(state["req"])
    try:
        response =await use_llm_versatile(state,prompt)
        return {"solution_raw": response}
        
    except Exception as e:
        print(f"❌ Error al generar explicaciones con Groq: {e}")
        return {"final_json": {}}