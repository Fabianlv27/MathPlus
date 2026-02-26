def parse_text_to_json(raw_text: str) -> dict:
    """Convierte el formato de texto plano con | al JSON esperado por el Frontend, calculando subcadenas"""
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
                    # FORMATO NUEVO: > INDICE | ACCION | VALOR | COLOR
                    # Quitamos el ">" inicial
                    clean_line = line.replace(">", "", 1).strip()
                    parts = [p.strip() for p in clean_line.split("|")]
                    
                    if current_inst is not None and len(parts) >= 4:
                        idx_str = parts[0]
                        action = parts[1]
                        color_str = parts[-1] # El color siempre es el último elemento
                        
                        # Reconstruimos el valor por si la subcadena tenía barras '|' adentro (ej. valor absoluto |x|)
                        value = "|".join(parts[2:-1]).strip()
                        
                        # Limpiamos las comillas que la IA le haya puesto a la subcadena ("x^2" -> x^2)
                        if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                            value = value[1:-1]

                        color = None if color_str == 'null' or not color_str else color_str
                        
                        try:
                            idx = int(idx_str)
                            
                            # 1. ACCIONES GLOBALES (appear, dim, o si el valor es "all")
                            if action in ["appear", "dim"] or value.lower() == "all":
                                tg_str = f"{idx}:(0-f)"
                                current_inst["tgs"].append({
                                    "tg": tg_str,
                                    "ac": action,
                                    "color": color
                                })
                                
                            # 2. BÚSQUEDA DE SUBCADENAS (resalt)
                            elif action == "resalt":
                                if idx < len(scene["cont"]):
                                    latex_original = scene["cont"][idx]["cont"]
                                    
                                    # Python busca la palabra exacta dentro del string y nos da dónde empieza
                                    inicio = latex_original.find(value)
                                    
                                    if inicio != -1: # Si lo encontró
                                        fin = inicio + len(value)
                                        tg_str = f"{idx}:({inicio}-{fin})"
                                        
                                        current_inst["tgs"].append({
                                            "tg": tg_str,
                                            "ac": action,
                                            "color": color
                                        })
                                    else:
                                        # FILTRO DE SEGURIDAD: Si la IA inventó texto que no existe, se descarta.
                                        print(f"⚠️ DESCARTADO: La subcadena '{value}' no existe en la ecuación {idx}: '{latex_original}'")
                                        
                        except ValueError:
                            print(f"⚠️ Error parseando el índice de la animación: {idx_str}")
                else:
                    # Nueva instrucción / mensaje de voz
                    current_inst = {"msg": line, "tgs": [], "fin": []}
                    scene["insts"].append(current_inst)
    
    # El frontend espera que la escena esté dentro de un array "escenas"
    return {"escenas": [scene]}