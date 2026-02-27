import re

def sanitize_latex_highlights(scene_dict: dict) -> dict:
    """
    Verifica todos los rangos de resaltado en la escena.
    Si un rango (inicio o fin) corta un comando LaTeX por la mitad 
    (ej: \quad, \text, \frac, \log), la animación se descarta para evitar crasheos.
    """
    latex_cmd_pattern = re.compile(r'\\[a-zA-Z]+')
    conts = scene_dict.get("cont", [])
    
    for inst in scene_dict.get("insts", []):
        valid_tgs = []
        
        for tg_obj in inst.get("tgs", []):
            tg_str = str(tg_obj.get("tg", ""))
            
            if ":" not in tg_str or "-" not in tg_str:
                valid_tgs.append(tg_obj)
                continue
                
            try:
                idx_part, range_part = tg_str.split(":")
                idx = int(idx_part)
                range_part = range_part.strip("() ")
                start_str, end_str = range_part.split("-")
                
                if start_str == '0' and end_str == 'f':
                    valid_tgs.append(tg_obj)
                    continue
                
                if idx >= len(conts):
                    continue
                
                latex_str = conts[idx].get("cont", "")
                
                start_idx = 0 if start_str == 'f' else int(start_str)
                end_idx = len(latex_str) if end_str == 'f' else int(end_str)

                cuts_macro = False
                
                for match in latex_cmd_pattern.finditer(latex_str):
                    cmd_start = match.start()
                    cmd_end = match.end()

                    if cmd_start < start_idx < cmd_end:
                        cuts_macro = True
                        break
                        
                    if cmd_start < end_idx < cmd_end:
                        cuts_macro = True
                        break

                if not cuts_macro:
                    valid_tgs.append(tg_obj)
                else:
                    print(f" SEGURIDAD: Se descartó el resaltado '{tg_str}' porque cortaba un comando en: '{latex_str}'")

            except ValueError:
                print(f" Error parseando tg: {tg_str}")
                continue
                
        inst["tgs"] = valid_tgs

    return scene_dict