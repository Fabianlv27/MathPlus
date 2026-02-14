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

// --- 1. ESTIMADOR DE DIMENSIONES ---
// Calcula el ancho y alto aproximado de una fórmula LaTeX
const estimateDimensions = (latex) => {
    if (!latex) return { w: 0, h: 0 };
    
    // Limpiamos los comandos largos (ej: \log, \frac, \sqrt) reemplazándolos por una sola letra 'X'
    // Esto evita que comandos invisibles sumen ancho ficticio
    const cleanLatex = latex.replace(/\\[a-zA-Z]+/g, 'X'); 
    
    // Asignamos ~14px de ancho por cada carácter visible, más 40px de padding base
    const w = (cleanLatex.length * 14) + 40; 
    
    // Asignamos 50px de altura base, y añadimos 45px extra por cada fracción que encontremos
    const fracCount = (latex.match(/\\frac/g) || []).length;
    const h = 50 + (fracCount * 45); 
    
    return { w, h };
};

// --- 2. PREVENTOR DE COLISIONES (MOTOR) ---
export const preventCollisions = (scene) => {
    // Clonamos la escena para no mutar el estado original
    const newScene = JSON.parse(JSON.stringify(scene));

    // A) Enriquecer elementos con "Cajas de Colisión" y agruparlos por columna (X)
    const columns = {};
    
    newScene.cont.forEach((el) => {
        if (el.type !== 'Latex') return;
        
        const { w, h } = estimateDimensions(el.cont);
        
        // Guardamos las cajas temporales (recordando que 'x' e 'y' son el centro)
        el._left = el.x - (w / 2);
        el._right = el.x + (w / 2);
        el._top = el.y - (h / 2);
        el._bottom = el.y + (h / 2);

        // Agrupamos por coordenada X (Los que tienen la misma X están "relacionados")
        if (!columns[el.x]) columns[el.x] = [];
        columns[el.x].push(el);
    });

    // B) Ordenar las columnas de izquierda a derecha (ej: [350, 650])
    const sortedX = Object.keys(columns).map(Number).sort((a, b) => a - b);

    // C) Revisar colisiones de izquierda a derecha
    for (let i = 1; i < sortedX.length; i++) {
        const currentX = sortedX[i];
        const currentColumn = columns[currentX];
        let maxShift = 0; // Cuánto necesitamos empujar esta columna

        // Comparamos esta columna contra todas las que están a su izquierda
        for (let j = 0; j < i; j++) {
            const prevX = sortedX[j];
            const prevColumn = columns[prevX];

            currentColumn.forEach(currEl => {
                prevColumn.forEach(prevEl => {
                    // ¿Se superponen verticalmente (Y)? Si no están en la misma línea, no chocan
                    const overlapY = (currEl._top < prevEl._bottom) && (currEl._bottom > prevEl._top);

                    if (overlapY) {
                        // Queremos un margen seguro de 40px entre ecuaciones
                        const safeMargin = 40; 
                        const requiredLeft = prevEl._right + safeMargin;

                        // Si el lado izquierdo de nuestro elemento actual está pisando el derecho del anterior
                        if (currEl._left < requiredLeft) {
                            const shift = requiredLeft - currEl._left;
                            if (shift > maxShift) {
                                maxShift = shift; // Guardamos el empuje más grande necesario
                            }
                        }
                    }
                });
            });
        }

        // D) Si hubo colisión, empujamos a TODOS los elementos relacionados (toda su columna)
        if (maxShift > 0) {
            currentColumn.forEach(el => {
                el.x += maxShift;       // Movemos el centro real
                el._left += maxShift;   // Actualizamos su caja temporal
                el._right += maxShift;
            });
            console.log(`Colisión detectada. Columna en X=${currentX} fue empujada ${maxShift}px a la derecha.`);
        }
    }

    // E) Limpiar propiedades temporales para no ensuciar el JSON final
    newScene.cont.forEach(el => {
        delete el._left;
        delete el._right;
        delete el._top;
        delete el._bottom;
    });

    return newScene;
};