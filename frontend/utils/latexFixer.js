// src/utils/latexFixer.js

/**
 * Encuentra la llave de cierre correspondiente a una de apertura.
 * Maneja anidamiento: \frac{\frac{a}{b}}{c}
 */
const findClosingBrace = (str, startIdx) => {
    let balance = 1;
    for (let i = startIdx + 1; i < str.length; i++) {
        if (str[i] === '{') balance++;
        if (str[i] === '}') balance--;
        if (balance === 0) return i;
    }
    return -1; // Error en LaTeX
};

/**
 * Identifica los rangos [inicio, fin] de todas las fracciones en el string.
 */
const getAllFractionRanges = (latex) => {
    const ranges = [];
    const regex = /\\frac/g;
    let match;

    while ((match = regex.exec(latex)) !== null) {
        const start = match.index; // Donde empieza \frac
        
        // 1. Buscar inicio del numerador '{'
        const numStart = latex.indexOf('{', start);
        if (numStart === -1) continue;
        
        // 2. Buscar fin del numerador '}'
        const numEnd = findClosingBrace(latex, numStart);
        if (numEnd === -1) continue;

        // 3. Buscar inicio del denominador '{' (debe estar después del numerador)
        const denStart = latex.indexOf('{', numEnd);
        if (denStart === -1) continue;

        // 4. Buscar fin del denominador '}'
        const denEnd = findClosingBrace(latex, denStart);
        if (denEnd === -1) continue;

        // El rango total de la fracción es desde '\' hasta el último '}'
        ranges.push({ start: start, end: denEnd + 1 });
    }
    return ranges;
};

/**
 * Función Principal: Corrige los targets de la IA
 */
export const fixLatexHighlighting = (scene) => {
    // Hacemos una copia profunda para no mutar el original
    const newScene = JSON.parse(JSON.stringify(scene));

    // Mapeo rápido de contenidos por ID o Índice
    const contents = {};
    newScene.cont.forEach((el, idx) => {
        contents[idx] = el.cont; // Guardamos el string LaTeX
        if (el.id) contents[el.id] = el.cont;
    });

    // Recorremos las instrucciones
    newScene.insts.forEach(inst => {
        if (!inst.tgs) return;

        inst.tgs.forEach(tgObj => {
            // Solo nos interesan los resaltados con rango específico
            if (tgObj.ac === 'resalt' && tgObj.tg.includes(':')) {
                
                // Parsear: "1:(5-10)" -> id="1", range="5-10"
                const [idStr, rangeStr] = tgObj.tg.split(':');
                const rangeClean = rangeStr.replace('(', '').replace(')', '');
                
                // Si es 'f' (final), no necesitamos corregir nada, selecciona todo
                if (rangeClean.includes('f')) return;

                const [reqStart, reqEndRaw] = rangeClean.split('-').map(Number);
                const latex = contents[idStr];

                if (!latex) return; // No encontramos el elemento

                // Obtener límites reales de todas las fracciones en este LaTeX
                const fracRanges = getAllFractionRanges(latex);

                let finalStart = reqStart;
                let finalEnd = reqEndRaw;

                // Verificamos si nuestra selección choca con alguna fracción
                let corrected = false;
                
                fracRanges.forEach(frac => {
                    // Lógica de intersección:
                    // Si el rango pedido empieza dentro de la fracción O termina dentro de ella
                    // O si la fracción está totalmente dentro del rango pedido.
                    
                    // Simplificado: Si se solapan
                    const overlap = (finalStart < frac.end) && (finalEnd > frac.start);

                    if (overlap) {
                        // ¡DETECTADO! La IA seleccionó mal (ej: solo el numerador).
                        // Expandimos la selección para incluir TODA la fracción.
                        finalStart = Math.min(finalStart, frac.start);
                        finalEnd = Math.max(finalEnd, frac.end); // Aseguramos cubrir hasta el final
                        corrected = true;
                    }
                });

                if (corrected) {
                    // Reescribimos el target con los nuevos índices
                    // Nota: Restamos 1 al final porque tu lógica de slice suele ser exclusiva o basada en longitud
                    // Ajusta según tu lógica de injectHighlights. Si es substring(start, end), usa finalEnd tal cual.
                    tgObj.tg = `${idStr}:(${finalStart}-${finalEnd - 1})`; 
                    
                    console.log(`🔧 Auto-fix aplicado en fracción: ${reqStart}-${reqEndRaw} -> ${finalStart}-${finalEnd-1}`);
                }
            }
        });
    });

    return newScene;
};