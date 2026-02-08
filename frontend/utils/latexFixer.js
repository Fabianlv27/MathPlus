// src/utils/latexFixer.js

const findClosingBrace = (str, startIdx) => {
    let balance = 1;
    for (let i = startIdx + 1; i < str.length; i++) {
        if (str[i] === '{') balance++;
        if (str[i] === '}') balance--;
        if (balance === 0) return i;
    }
    return -1;
};

// Encuentra el cierre de un paréntesis balanceado (...)
const findClosingParen = (str, startIdx) => {
    let balance = 1;
    for (let i = startIdx + 1; i < str.length; i++) {
        if (str[i] === '(') balance++;
        if (str[i] === ')') balance--;
        if (balance === 0) return i;
    }
    return -1;
};

/**
 * Detecta rangos "Atómicos".
 * Ahora incluye: Comandos, Grupos {}, Paréntesis () y absorbe Subíndices/Potencias (_ ^)
 */
const getAtomicRanges = (latex) => {
    const ranges = [];
    const len = latex.length;

    for (let i = 0; i < len; i++) {
        let start = i;
        let end = i;

        // 1. DETECTOR DE COMANDOS (\frac, \log, etc.)
        if (latex[i] === '\\') {
            let j = i + 1;
            while (j < len && /[a-zA-Z]/.test(latex[j])) j++;
            end = j;
            
            // Caso especial: \frac{a}{b} (absorbe sus dos argumentos)
            if (latex.substring(start, end) === '\\frac') {
                let ptr = end;
                // Argumento 1
                while (ptr < len && latex[ptr] === ' ') ptr++; // saltar espacios
                if (latex[ptr] === '{') {
                    const close1 = findClosingBrace(latex, ptr);
                    if (close1 !== -1) {
                        ptr = close1 + 1;
                        // Argumento 2
                        while (ptr < len && latex[ptr] === ' ') ptr++;
                        if (latex[ptr] === '{') {
                            const close2 = findClosingBrace(latex, ptr);
                            if (close2 !== -1) {
                                end = close2 + 1;
                            }
                        }
                    }
                }
            }
        }
        // 2. DETECTOR DE GRUPOS { ... }
        else if (latex[i] === '{') {
            const close = findClosingBrace(latex, i);
            if (close !== -1) end = close + 1;
        }
        // 3. DETECTOR DE PARÉNTESIS ( ... )
        else if (latex[i] === '(') {
            const close = findClosingParen(latex, i);
            if (close !== -1) end = close + 1;
        }
        // 4. CARÁCTER NORMAL (Si no es comando ni grupo, el átomo es el carácter)
        else {
            end = i + 1;
        }

        // --- ABSORCIÓN DE SUFIJOS (_ y ^) ---
        // Si después de este átomo viene un _ o ^, el átomo debe crecer para incluirlo
        // Ejemplo: \log se convierte en \log_4 o \log_{10}
        let nextPtr = end;
        while (nextPtr < len) {
            // Saltar espacios
            if (latex[nextPtr] === ' ') {
                nextPtr++;
                continue;
            }
            
            // Si encontramos un sufijo
            if (latex[nextPtr] === '_' || latex[nextPtr] === '^') {
                let suffixStart = nextPtr;
                let suffixEnd = nextPtr + 1;
                
                // Mirar qué hay después del _ o ^
                let argPtr = suffixEnd;
                // Si es un grupo { ... }
                if (argPtr < len && latex[argPtr] === '{') {
                    const close = findClosingBrace(latex, argPtr);
                    if (close !== -1) suffixEnd = close + 1;
                } 
                // Si es un solo carácter (ej: _4)
                else if (argPtr < len) {
                    suffixEnd = argPtr + 1;
                }

                // Extendemos el átomo original para incluir el sufijo
                end = suffixEnd;
                nextPtr = end; // Continuamos buscando (ej: x_i^2 tiene dos sufijos)
            } else {
                break; // No hay más sufijos
            }
        }

        if (end > start) {
            ranges.push({ start, end });
            // Avanzamos el bucle principal para no re-procesar lo que acabamos de agrupar
            // Restamos 1 porque el for hará i++
            i = end - 1; 
        }
    }

    return ranges;
};

export const fixLatexHighlighting = (scene) => {
    const newScene = JSON.parse(JSON.stringify(scene));
    const contents = {};
    newScene.cont.forEach((el, idx) => {
        contents[idx] = el.cont;
        if (el.id) contents[el.id] = el.cont;
    });

    newScene.insts.forEach(inst => {
        if (!inst.tgs) return;
        inst.tgs.forEach(tgObj => {
            if (tgObj.ac === 'resalt' && tgObj.tg.includes(':')) {
                let [idStr, rangeStr] = tgObj.tg.split(':');
                const rangeClean = rangeStr.replace('(', '').replace(')', '');
                if (rangeClean.includes('f')) return;

                const [reqStart, reqEndRaw] = rangeClean.split('-').map(Number);
                const latex = contents[idStr];
                if (!latex) return;

                const atomicRanges = getAtomicRanges(latex);
                let finalStart = reqStart;
                let finalEnd = reqEndRaw; 
                let changed = true;
                
                while (changed) {
                    changed = false;
                    atomicRanges.forEach(atom => {
                        const overlap = (finalStart < atom.end) && (finalEnd > atom.start);
                        if (overlap) {
                            const newStart = Math.min(finalStart, atom.start);
                            const newEnd = Math.max(finalEnd, atom.end);
                            if (newStart !== finalStart || newEnd !== finalEnd) {
                                finalStart = newStart;
                                finalEnd = newEnd;
                                changed = true;
                            }
                        }
                    });
                }

                if (finalStart !== reqStart || finalEnd !== reqEndRaw) {
                    tgObj.tg = `${idStr}:(${finalStart}-${finalEnd})`;
                }
            }
        });
    });
    return newScene;
};