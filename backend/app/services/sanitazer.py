import re

def sanitize_latex_highlights(scene_dict: dict) -> dict:
    """
    Verifica todos los rangos de resaltado en la escena.
    Si un rango (inicio o fin) corta un comando LaTeX por la mitad 
    (ej: \quad, \text, \frac, \log), la animación se descarta para evitar crasheos.
    """
    # Regex para encontrar cualquier comando LaTeX (barra invertida + letras)
    # Ejemplo: \quad, \text, \frac, \sqrt, \log
    latex_cmd_pattern = re.compile(r'\\[a-zA-Z]+')

    # Obtenemos la lista de fórmulas para consultar el string original
    conts = scene_dict.get("cont", [])
    
    for inst in scene_dict.get("insts", []):
        valid_tgs = []
        
        for tg_obj in inst.get("tgs", []):
            tg_str = str(tg_obj.get("tg", ""))
            
            # Si no tiene el formato correcto (ej. "10:(0-17)"), lo dejamos pasar por si es 0:(0-f)
            if ":" not in tg_str or "-" not in tg_str:
                valid_tgs.append(tg_obj)
                continue
                
            try:
                idx_part, range_part = tg_str.split(":")
                idx = int(idx_part)
                range_part = range_part.strip("() ")
                start_str, end_str = range_part.split("-")
                
                # Si es un target general (0-f), nunca rompe comandos a la mitad
                if start_str == '0' and end_str == 'f':
                    valid_tgs.append(tg_obj)
                    continue
                
                # Si el índice no existe en el array de contenidos, lo descartamos
                if idx >= len(conts):
                    continue
                
                latex_str = conts[idx].get("cont", "")
                
                # Convertimos 'f' al largo total del string, o leemos el entero
                start_idx = 0 if start_str == 'f' else int(start_str)
                end_idx = len(latex_str) if end_str == 'f' else int(end_str)

                # BANDERA DE SEGURIDAD
                cuts_macro = False
                
                # Buscamos todos los comandos LaTeX en el string
                for match in latex_cmd_pattern.finditer(latex_str):
                    cmd_start = match.start()
                    cmd_end = match.end()

                    # Comprobamos si el INICIO del resaltado cae a la mitad de la palabra
                    if cmd_start < start_idx < cmd_end:
                        cuts_macro = True
                        break
                        
                    # Comprobamos si el FIN del resaltado cae a la mitad de la palabra
                    if cmd_start < end_idx < cmd_end:
                        cuts_macro = True
                        break

                if not cuts_macro:
                    valid_tgs.append(tg_obj)
                else:
                    print(f" SEGURIDAD: Se descartó el resaltado '{tg_str}' porque cortaba un comando en: '{latex_str}'")

            except ValueError:
                # Si hubo un error parseando los números, ante la duda, lo descartamos
                print(f" Error parseando tg: {tg_str}")
                continue
                
        # Actualizamos la instrucción solo con los resaltados que pasaron la prueba
        inst["tgs"] = valid_tgs

    return scene_dict