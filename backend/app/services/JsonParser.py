import re

def parse_text_to_json(raw_text: str) -> dict:
    """
    Convierte el formato de texto plano (DSL) al JSON esperado por el Frontend.
    Incluye lógica avanzada (Regex + Balanceo) para evitar romper LaTeX al resaltar.
    """
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    current_section = None
    
    # Estructura base de la escena
    scene = {"ig": "", "cont": [], "resources": [], "insts": []}
    current_inst = None

    for line in lines:
        # --- DETECCIÓN DE SECCIONES ---
        if line.startswith("IG:"):
            scene["ig"] = line.replace("IG:", "").strip()
        elif line == "=== CONT ===":
            current_section = "CONT"
        elif line == "=== RES ===":
            current_section = "RES"
        elif line == "=== INSTS ===":
            current_section = "INSTS"
        
        else:
            # --- PARSING: CONT (Fórmulas) ---
            if current_section == "CONT":
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 6:
                    scene["cont"].append({
                        "type": parts[0],
                        "status": parts[1],
                        "apart": None if parts[2] == 'null' else parts[2],
                        "x": int(parts[3]),
                        "y": int(parts[4]),
                        # Join por si el LaTeX contenía barras '|' (ej: valor absoluto)
                        "cont": "|".join(parts[5:]) 
                    })
            
            # --- PARSING: RES (Recursos) ---       
            elif current_section == "RES":
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 3:
                    # Manejo robusto de índices de pasos (ej: "1, 3, 5")
                    try:
                        steps = [int(n.strip()) for n in parts[0].split(",")]
                    except ValueError:
                        steps = []
                        
                    scene["resources"].append({
                        "step": steps,
                        "title": parts[1],
                        "tex": "|".join(parts[2:])
                    })
                    
            # --- PARSING: INSTS (Instrucciones) ---
            elif current_section == "INSTS":
                if line.startswith(">"):
                    # FORMATO: > INDICE | ACCION | VALOR | COLOR
                    clean_line = line.replace(">", "", 1).strip()
                    parts = [p.strip() for p in clean_line.split("|")]
                    
                    if current_inst is not None and len(parts) >= 4:
                        idx_str = parts[0]
                        action = parts[1]
                        color_str = parts[-1]
                        
                        # Reconstruimos valor original (por si tenía | dentro)
                        value = "|".join(parts[2:-1]).strip()

                        # --- LIMPIEZA TOTAL DE DELIMITADORES (ANTI-FANTASMAS) ---
                        # 1. Quitamos comillas de string JSON si la IA las puso
                        if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                            value = value[1:-1]
                        
                        # 2. Quitamos TODA la basura de delimitadores LaTeX que la IA suele agregar por error
                        # Esto arregla: $x$, $$x$$, \(x\), \[x\]
                        value = value.replace("$$", "") # Bloque doble
                        value = value.replace("$", "")  # Inline simple
                        value = value.replace("\\[", "").replace("\\]", "") # Bloque LaTeX
                        value = value.replace("\\(", "").replace("\\)", "") # Inline LaTeX
                        
                        value = value.strip() # Quitar espacios sobrantes al final
                        # ---------------------------------------

                        color = None if color_str == 'null' or not color_str else color_str
                        
                        try:
                            idx = int(idx_str)
                            
                            # 1. ACCIONES GLOBALES (appear, dim)
                            if action in ["appear", "dim"] or value.lower() == "all":
                                tg_str = f"{idx}:(0-f)"
                                current_inst["tgs"].append({
                                    "tg": tg_str,
                                    "ac": action,
                                    "color": color
                                })
                                
                            # 2. ACCIÓN RESALTAR (Lógica Blindada)
                            elif action == "resalt":
                                if idx < len(scene["cont"]):
                                    latex_original = scene["cont"][idx]["cont"]
                                    
                                    # A. Encontrar la palabra base (Ahora limpia de $)
                                    inicio = latex_original.find(value)
                                    
                                    if inicio != -1:
                                        fin = inicio + len(value)

                                        # --- FASE 1: IMÁN HACIA ATRÁS (Regex Look-behind) ---
                                        # VERSION AJUSTADA: Atrapa comandos prefijos (\left, \big) 
                                        # PERO YA NO ATRAPA NÚMEROS NI SIGNOS (-5, 2).
                                        texto_previo = latex_original[:inicio]
                                        
                                        # Regex: Solo busca comandos de tamaño/delimitación + espacios opcionales
                                        patron_atras = r'(?:(?P<cmd>\\(?:left|big|Big|bigg|Bigg)[lr]?)\s*)?$'
                                        
                                        match_atras = re.search(patron_atras, texto_previo)
                                        if match_atras:
                                            g = match_atras.group(0)
                                            # Si atrapó algo significativo (no solo espacios vacíos)
                                            if g and g.strip():
                                                inicio -= len(g)

                                        # --- FASE 2: EL BALANCEADOR (Smart Forward Extension) ---
                                        # Corrección crítica para "Expected \right, got EOF".
                                        # Si abrimos un \left, estamos OBLIGADOS a extender hasta su \right.
                                        
                                        balance = 0
                                        i = inicio
                                        longitud_total = len(latex_original)
                                        
                                        # Recorremos hacia adelante
                                        while i < longitud_total:
                                            # Detectar apertura \left
                                            if latex_original[i:].startswith("\\left"):
                                                balance += 1
                                                i += 5 # saltar "\left"
                                                continue
                                            
                                            # Detectar cierre \right
                                            if latex_original[i:].startswith("\\right"):
                                                balance -= 1
                                                i += 6 # saltar "\right"
                                                
                                                # SI EL BALANCE ES CERO Y YA CUBRIMOS LA SELECCIÓN ORIGINAL
                                                # Entonces es seguro cortar aquí.
                                                if balance == 0 and i >= fin:
                                                    fin = i
                                                    break
                                                continue
                                            
                                            i += 1
                                            
                                            # Caso base: Si no hay \left pendientes (balance 0) y ya cubrimos el texto
                                            if i >= fin and balance == 0:
                                                fin = i
                                                break
                                        
                                        # --- FASE 3: VALIDACIÓN FINAL ---
                                        if balance != 0:
                                            print(f"🛡️ SAFETY: Resaltado descartado en ec {idx}. LaTeX desbalanceado (faltan cierres).")
                                        else:
                                            # Éxito: Agregamos la animación
                                            tg_str = f"{idx}:({inicio}-{fin})"
                                            current_inst["tgs"].append({
                                                "tg": tg_str,
                                                "ac": action,
                                                "color": color
                                            })
                                    else:
                                        # La IA alucinó un texto que no existe
                                        print(f"👻 FANTASMA: La subcadena '{value}' no existe en la ecuación {idx}")
                                        
                        except ValueError:
                            print(f"⚠️ Error parseando índice: {idx_str}")

                else:
                    # Nueva línea de voz / instrucción
                    current_inst = {"msg": line, "tgs": [], "fin": []}
                    scene["insts"].append(current_inst)
    
    return {"escenas": [scene]}