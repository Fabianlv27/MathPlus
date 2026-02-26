export const parseTextToJSON = (rawText) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
    let currentSection = null;
    let result = { ig: "", cont: [], resources: [], insts: [] };
    let currentInst = null;

    for (let line of lines) {
        if (line.startsWith('IG:')) {
            result.ig = line.replace('IG:', '').trim();
        } else if (line === '=== CONT ===') {
            currentSection = 'CONT';
        } else if (line === '=== RES ===') {
            currentSection = 'RES';
        } else if (line === '=== INSTS ===') {
            currentSection = 'INSTS';
        } else {
            if (currentSection === 'CONT') {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length >= 6) {
                    result.cont.push({
                        type: parts[0],
                        status: parts[1],
                        apart: parts[2] === 'null' ? null : parts[2],
                        x: parseInt(parts[3]),
                        y: parseInt(parts[4]),
                        cont: parts.slice(5).join('|') // Por si el LaTeX tiene un símbolo |
                    });
                }
            } else if (currentSection === 'RES') {
                // Formato: Pasos | Título | Latex
                const parts = line.split('|').map(p => p.trim());
                if (parts.length >= 3) {
                    result.resources.push({
                        step: parts[0].split(',').map(n => parseInt(n.trim())),
                        title: parts[1],
                        tex: parts.slice(2).join('|')
                    });
                }
            } else if (currentSection === 'INSTS') {
                if (line.startsWith('>')) {
                    // Es una animación: > tg | ac | color
                    const parts = line.replace('>', '').split('|').map(p => p.trim());
                    if (currentInst) {
                        currentInst.tgs.push({
                            tg: parts[0],
                            ac: parts[1],
                            color: (parts[2] === 'null' || !parts[2]) ? undefined : parts[2]
                        });
                    }
                } else {
                    currentInst = { msg: line, tgs: [], fin: [] };
                    result.insts.push(currentInst);
                }
            }
        }
    }
    
    return result;
};