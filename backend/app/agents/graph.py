
from langgraph.graph import StateGraph, END
from app.models.schemas import AgentState
from app.agents.nodes.route import route_node
from app.agents.nodes.corrector import corrector_node
from app.agents.nodes.explainer import explainer_node
from app.agents.nodes.scripter import ux_scripter_node
from app.agents.nodes.solver import solver_node
from app.agents.nodes.validator import validator_node

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