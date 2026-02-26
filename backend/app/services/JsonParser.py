def parse_text_to_json(raw_text: str) -> dict:
    """Convierte el formato de texto plano con | al JSON esperado por el Frontend"""
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    current_section = None
    scene = {"ig": "", "cont": [], "resources": [], "insts": []}
    current_inst = None

    for line in lines:
        if line.startswith("IG:"):
            scene["ig"] = line.replace("IG:", "").strip()
        elif line == "=== CONT ===":
            current_section = "CONT"
        elif line == "=== RES ===":
            current_section = "RES"
        elif line == "=== INSTS ===":
            current_section = "INSTS"
        else:
            if current_section == "CONT":
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 6:
                    scene["cont"].append({
                        "type": parts[0],
                        "status": parts[1],
                        "apart": None if parts[2] == 'null' else parts[2],
                        "x": int(parts[3]),
                        "y": int(parts[4]),
                        "cont": "|".join(parts[5:]) # Join por si el LaTeX contenía barras
                    })
            elif current_section == "RES":
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 3:
                    steps = [int(n.strip()) for n in parts[0].split(",")]
                    scene["resources"].append({
                        "step": steps,
                        "title": parts[1],
                        "tex": "|".join(parts[2:])
                    })
            elif current_section == "INSTS":
                if line.startswith(">"):
                    parts = [p.strip() for p in line.replace(">", "").split("|")]
                    if current_inst is not None and len(parts) >= 3:
                        current_inst["tgs"].append({
                            "tg": parts[0],
                            "ac": parts[1],
                            "color": None if parts[2] == 'null' or not parts[2] else parts[2]
                        })
                else:
                    # Nueva instrucción / audio
                    current_inst = {"msg": line, "tgs": [], "fin": []}
                    scene["insts"].append(current_inst)
    
    # El frontend espera que la escena esté dentro de un array "escenas"
    return {"escenas": [scene]}