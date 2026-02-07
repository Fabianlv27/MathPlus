    import React, { useState, useEffect, useRef } from 'react';
    import { InlineMath } from 'react-katex';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Play, Pause, ChevronRight, ChevronLeft, RefreshCw, Move, LocateFixed } from 'lucide-react';
    import 'katex/dist/katex.min.css';

    // --- 1. FUNCIÓN DE INYECCIÓN DE COLORES ---
    const injectHighlights = (latex, highlights = []) => {
        if (!highlights || highlights.length === 0) return latex;
        const sortedHighlights = [...highlights].sort((a, b) => b.start - a.start);
        let result = latex;
        sortedHighlights.forEach(({ start, end, color }) => {
            const safeStart = Math.max(0, start);
            const safeEnd = end === 'f' ? result.length : Math.min(result.length, end + 1);
            if (safeStart >= safeEnd) return; 
            const before = result.substring(0, safeStart);
            const target = result.substring(safeStart, safeEnd);
            const after = result.substring(safeEnd);
            result = `${before}{\\color{${color}}${target}}${after}`;
        });
        return result;
    };

    // --- 2. COMPONENTES VISUALES ---
    const ElementoLatex = ({ data, state }) => {
        const finalLatex = injectHighlights(data.cont, state.highlights);
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: state.visible ? 1 : 0, scale: state.visible ? 1 : 0.8 }}
                transition={{ duration: 0.5 }}
                className="absolute text-xl md:text-2xl font-serif text-slate-800 p-1 whitespace-nowrap z-10 select-none"
                style={{ left: data.x, top: data.y }}
            >
                <InlineMath math={finalLatex} />
            </motion.div>
        );
    };

    const ElementoFlecha = ({ data, visible }) => {
        if (!visible) return null;
        return (
            <motion.svg 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute pointer-events-none overflow-visible z-0"
                style={{ left: 0, top: 0, width: '100%', height: '100%' }}
            >
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#F59E0B" />
                    </marker>
                </defs>
                <path d={`M ${data.x} ${data.y} L ${data.toX} ${data.toY}`} stroke="#F59E0B" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
            </motion.svg>
        );
    };

    const ElementoMarco = ({ data, visible }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0 }}
            className="absolute border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-lg pointer-events-none z-0"
            style={{ left: data.x1, top: data.y1, width: data.x2 - data.x1, height: data.y2 - data.y1 }}
        />
    );

    // --- 3. REPRODUCTOR PRINCIPAL ---

    const WhiteboardPlayer = ({ scenes }) => {
    if (!scenes || scenes.length === 0) return <div className="p-10 text-center text-slate-400">Cargando pizarra...</div>;

    const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [elementStates, setElementStates] = useState({});
    
    // Estado para Pan (Cámara)
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null); // Referencia al contenedor para saber su tamaño
    
    const synth = useRef(window.speechSynthesis);
    const scene = scenes[currentSceneIdx];

    // A. RESET AL CAMBIAR DE ESCENA
    useEffect(() => {
        setCurrentStepIdx(-1);
        setIsPlaying(false);
        synth.current.cancel();
        setPan({ x: 0, y: 0 });
        
        const initialState = {};
        scene.cont.forEach((el, idx) => {
            initialState[idx] = { visible: el.status === 'show', highlights: [] };
        });
        setElementStates(initialState);
    }, [currentSceneIdx, scene]);

    // B. MOTOR DE LÓGICA (CORE)
    useEffect(() => {
        if (!isPlaying || currentStepIdx >= scene.insts.length) {
            setIsPlaying(false);
            return;
        }
        if (currentStepIdx === -1) { setCurrentStepIdx(0); return; }

        const currentInst = scene.insts[currentStepIdx];
        
        // --- LÓGICA DE AUTO-ENFOQUE (AUTO-PAN) ---
        // Si el paso tiene targets (tgs), movemos la cámara hacia ellos
        if (currentInst.tgs && currentInst.tgs.length > 0 && containerRef.current) {
            let totalX = 0;
            let totalY = 0;
            let count = 0;

            currentInst.tgs.forEach(tgObj => {
                // Extraer ID
                let idStr = tgObj.tg.toString();
                if (idStr.includes(':')) idStr = idStr.split(':')[0];
                const idx = parseInt(idStr);
                const element = scene.cont[idx];

                if (element) {
                    // Si es Latex usamos x,y. Si es Marco usamos el centro del marco.
                    if (element.x !== undefined) {
                        totalX += element.x;
                        totalY += element.y;
                        count++;
                    } else if (element.x1 !== undefined) {
                        totalX += (element.x1 + element.x2) / 2;
                        totalY += (element.y1 + element.y2) / 2;
                        count++;
                    }
                }
            });

            if (count > 0) {
                const targetX = totalX / count;
                const targetY = totalY / count;
                
                // Dimensiones del contenedor
                const { clientWidth, clientHeight } = containerRef.current;
                
                // Calculamos el nuevo pan para centrar el objetivo
                // Objetivo: targetX + panX = centroPantalla
                // panX = centroPantalla - targetX
                // Ajuste Y: Restamos 50px extra para dejar espacio a los subtítulos abajo
                const newPanX = (clientWidth / 2) - targetX;
                const newPanY = (clientHeight / 2) - targetY - 70; 

                setPan({ x: 0.5*newPanX, y: 0.5*newPanY });
            }
        }
        // ------------------------------------------

        const cancelledSteps = new Set();
        for (let i = 0; i <= currentStepIdx; i++) {
            const s = scene.insts[i];
            if (s.fin) s.fin.forEach(idx => cancelledSteps.add(idx));
        }

        const newState = {};
        scene.cont.forEach((el, idx) => {
            newState[idx] = { visible: el.status === 'show', highlights: [] };
        });

        for (let i = 0; i <= currentStepIdx; i++) {
            const step = scene.insts[i];
            if (step.tgs) {
                step.tgs.forEach(tgObj => {
                    let idStr = tgObj.tg.toString();
                    let start = 0; let end = 'f';
                    if (idStr.includes(':')) {
                        const parts = idStr.split(':');
                        idStr = parts[0];
                        const rangeParts = parts[1].replace('(', '').replace(')', '').split('-');
                        start = parseInt(rangeParts[0]);
                        end = rangeParts[1] === 'f' ? 'f' : parseInt(rangeParts[1]);
                    }
                    const idx = parseInt(idStr);
                    if (newState[idx]) {
                        if (tgObj.ac === 'appear') newState[idx].visible = true;
                        if (tgObj.ac === 'hide') newState[idx].visible = false;
                        if (tgObj.ac === 'resalt' && !cancelledSteps.has(i)) {
                            newState[idx].highlights.push({ start, end, color: tgObj.color || '#F59E0B' });
                        }
                    }
                });
            }
        }
        setElementStates(newState);

        synth.current.cancel();
        const utterance = new SpeechSynthesisUtterance(currentInst.msg);
        utterance.lang = 'es-ES';
        utterance.rate = 1.1;
        utterance.onend = () => {
            if (isPlaying) {
                if (currentStepIdx < scene.insts.length - 1) setCurrentStepIdx(prev => prev + 1);
                else setIsPlaying(false);
            }
        };
        synth.current.speak(utterance);
        return () => synth.current.cancel();
    }, [currentStepIdx, isPlaying, scene]);

    // --- ARRASTRE MANUAL ---
    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    };
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        setPan({ x: newX, y: newY });
    };
    const handleMouseUp = () => setIsDragging(false);

    // --- HANDLERS ---
    const handleNextScene = () => { if (currentSceneIdx < scenes.length - 1) setCurrentSceneIdx(p => p + 1); };
    const handlePrevScene = () => { if (currentSceneIdx > 0) setCurrentSceneIdx(p => p - 1); };
    
    const togglePlay = () => {
        if (currentStepIdx >= scene.insts.length - 1) setCurrentStepIdx(-1);
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden shadow-xl border border-slate-200 relative font-sans select-none">
        
        {/* HEADER */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center z-20 shadow-sm shrink-0">
            <div>
                <h2 className="text-xl font-bold text-slate-800">{scene.ig}</h2>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mt-1">Escena {currentSceneIdx + 1} de {scenes.length}</p>
            </div>
            <div className="flex gap-2 items-center">
                <button onClick={() => setPan({x:0, y:0})} className="p-2 mr-2 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded transition" title="Recentrar Vista">
                    <LocateFixed size={18}/>
                </button>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    <button onClick={handlePrevScene} disabled={currentSceneIdx===0} className="p-2 text-slate-600 hover:bg-white hover:shadow rounded disabled:opacity-30 transition"><ChevronLeft/></button>
                    <button onClick={handleNextScene} disabled={currentSceneIdx===scenes.length-1} className="p-2 text-slate-600 hover:bg-white hover:shadow rounded disabled:opacity-30 transition"><ChevronRight/></button>
                </div>
            </div>
        </div>

        {/* PIZARRA (CANVAS) */}
        <div 
            ref={containerRef} // IMPORTANTE: Referencia para medir tamaño
            className={`relative flex-grow bg-white overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-700 ease-in-out" // Suaviza el movimiento del fondo
                style={{ 
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/graphy.png")',
                    backgroundPosition: `${pan.x}px ${pan.y}px` 
                }}
            ></div>

            {/* CONTENEDOR DE ELEMENTOS ANIMADO */}
            {/* Usamos 'animate' de framer-motion para que el cambio de pan.x/pan.y sea suave */}
            <motion.div 
                className="absolute top-0 left-0 w-full h-full"
                animate={{ x: pan.x, y: pan.y }} // ESTO HACE LA MAGIA DEL MOVIMIENTO SUAVE
                transition={{ type: "spring", stiffness: 50, damping: 20 }} // Configuración física del movimiento
            >
                {scene.cont.map((el, idx) => {
                    const state = elementStates[idx] || { visible: el.status === 'show', highlights: [] };
                    if (el.type === 'Latex') return <ElementoLatex key={idx} data={el} state={state} />;
                    if (el.type === 'Flecha') return <ElementoFlecha key={idx} data={el} visible={state.visible} />;
                    if (el.type === 'Marco') return <ElementoMarco key={idx} data={el} visible={state.visible} />;
                    return null;
                })}
            </motion.div>

            <div className="absolute top-4 right-4 pointer-events-none opacity-50 bg-white/80 p-2 rounded-full border shadow-sm">
                <Move size={20} className="text-slate-400" />
            </div>
        </div>

        {/* ZONA SUBTÍTULOS */}
        <div className="h-24 bg-slate-50 border-t border-slate-200 flex items-center justify-center px-4 shrink-0 relative z-20">
            <AnimatePresence mode='wait'>
                {currentStepIdx >= 0 && scene.insts[currentStepIdx] && (
                    <motion.div
                        key={currentStepIdx}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        className="text-center max-w-3xl"
                    >
                        <p className="text-slate-700 text-lg font-medium leading-relaxed">
                            {scene.insts[currentStepIdx].msg}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* CONTROLES */}
        <div className="bg-white p-4 border-t flex items-center justify-center gap-6 z-20 shrink-0">
            <button onClick={() => { setIsPlaying(false); setCurrentStepIdx(-1); setPan({x:0, y:0}); }} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition" title="Reiniciar"><RefreshCw size={22}/></button>
            <button onClick={togglePlay} className={`flex items-center gap-3 px-10 py-3 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-amber-500' : 'bg-indigo-600'}`}>{isPlaying ? <><Pause fill="white" size={24}/> Pausar</> : <><Play fill="white" size={24}/> {currentStepIdx === -1 ? 'Comenzar' : 'Continuar'}</>}</button>
        </div>
        </div>
    );
    };

    export default WhiteboardPlayer;