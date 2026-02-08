// src/utils/layoutEngine.js

// TUS CONSTANTES DEFINIDAS
const CHAR_W = 18;      // Ancho por caracter
const BASE_PADDING = 20; // Padding estándar (x1, y1)
const HEIGHT_BASE = 20;  // Altura base del elemento

/**
 * Cuenta cuántas fracciones hay en un string LaTeX para ajustar la altura.
 */
const contarFracciones = (latexStr) => {
    if (!latexStr) return 0;
    // Busca todas las ocurrencias de "\frac"
    const matches = latexStr.match(/\\frac/g);
    return matches ? matches.length : 0;
};

/**
 * Recalcula las posiciones de los marcos basándose en sus objetivos (targets).
 */
export const calculateFramePositions = (scene) => {
    // 1. Crear un Mapa de Elementos para buscarlos rápido por ID
    // Esto nos permite encontrar "t1" instantáneamente sin recorrer el array mil veces.


    const elementMap = {};
    scene.cont.forEach(el => {
        if (el.id) {
            elementMap[el.id] = el;
        }
    });

    

    // 2. Recorrer y transformar solo los Marcos
    const newCont = scene.cont.map(el => {
        
        // Solo actuamos si es un Marco Y tiene un targetId definido
        if (el.type === 'Marco' && el.targetId) {
            console.log("marco")
            const target = elementMap[el.targetId];

            // Si el objetivo existe y tiene coordenadas, aplicamos TU FÓRMULA
            if (target && target.x !== undefined && target.y !== undefined) {
                
                const contenido = target.cont || "";
                const cantidadCaracteres = contenido.length;
                const numFracciones = contarFracciones(contenido);

                // --- TUS FÓRMULAS EXACTAS ---

                // x1 = (x del elemento) - 20
                const x1 = target.x - BASE_PADDING;

                // x2 = (x del elemento) + (caracteres * 18) + 20
                const x2 = target.x + (cantidadCaracteres * CHAR_W) + BASE_PADDING;

                // y1 = (y del elemento) - 20
                const y1 = target.y - BASE_PADDING;

                // y2 calculation:
                // Si no hay fracciones: y + 20 + 20
                // Si hay fracciones: y + (numFracciones * 20) + 20 + 20
                const alturaExtra = numFracciones * 20;
                const y2 = target.y + alturaExtra + HEIGHT_BASE + BASE_PADDING+40;

                console.log(`📐 Marco ajustado para ${el.targetId}:`, { x1, x2, y1, y2 });

                // Retornamos el marco con las nuevas coordenadas, borrando las viejas
                return {
                    ...el,
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2
                };
            }
        }

        // Si no es un marco o no tiene target, lo dejamos igual
        return el;
    });

    return {
        ...scene,
        cont: newCont
    };
};