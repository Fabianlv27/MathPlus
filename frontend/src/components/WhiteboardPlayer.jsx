import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, LocateFixed, Video, VideoOff, SkipForward, MousePointerClick } from 'lucide-react';
import { useContainerDimensions } from '../hooks/useContainerDimensions';
import 'katex/dist/katex.min.css';

// --- 1. FUNCIÓN DE INYECCIÓN DE COLORES ---
const injectHighlights = (latex, highlights = []) => {
    if (!highlights || highlights.length === 0) return latex;
    try {
        const charColors = new Array(latex.length).fill(null);
        highlights.forEach(({ start, end, color }) => {
            const safeStart = Math.max(0, start);
            const safeEnd = end === 'f' ? latex.length : Math.min(latex.length, end);
            for (let i = safeStart; i < safeEnd; i++) charColors[i] = color;
        });
        let result = "", currentColor = null, buffer = "";
        for (let i = 0; i < latex.length; i++) {
            const myColor = charColors[i];
            if (myColor !== currentColor) {
                if (buffer.length > 0) result += currentColor ? `\\textcolor{${currentColor}}{${buffer}}` : buffer;
                buffer = ""; currentColor = myColor;
            }
            buffer += latex[i];
        }
        if (buffer.length > 0) result += currentColor ? `\\textcolor{${currentColor}}{${buffer}}` : buffer;
        return result;
    } catch (e) { return latex; }
};

// --- 2. COMPONENTES VISUALES ---

const ElementoLatex = ({ data, state, onClick, stepIndex }) => {
    const highlights = state?.highlights || [];
    const isVisible = state?.visible || false;
    const finalLatex = injectHighlights(data.cont, highlights);
    
    // Verificamos si es interactivo
    const isInteractive = isVisible && stepIndex !== undefined;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 0.5 }}
            onClick={(e) => {
                if (isInteractive) {
                    e.preventDefault();
                    e.stopPropagation(); 
                    onClick(stepIndex);
                }
            }}
            className={`absolute flex items-center justify-center rounded-xl transition-all duration-200 z-50 select-none
                ${isInteractive 
                    ? 'cursor-pointer hover:bg-indigo-100/40 hover:scale-110 active:scale-95 border border-transparent hover:border-indigo-200' 
                    : 'pointer-events-none'}
            `}
            style={{ 
                left: `${data.x}px`, 
                top: `${data.y}px`, 
                transform: 'translate(-50%, -50%)', 
                color: '#1e293b',
                padding: '20px',
                minWidth: '80px',
                minHeight: '60px'
            }}
            title={isInteractive ? `Ir al paso ${stepIndex + 1}` : ""}
        >
            <span className="text-xl md:text-3xl whitespace-nowrap pointer-events-none">
                <InlineMath math={finalLatex} />
            </span>
        </motion.div>
    );
};

const ElementoFlecha = ({ data, visible }) => (
    <motion.svg 
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: visible ? 1 : 0, pathLength: visible ? 1 : 0 }}
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

const ElementoMarco = ({ data, visible }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        className="absolute border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-lg pointer-events-none z-0"
        style={{ left: data.x1, top: data.y1, width: data.x2 - data.x1, height: data.y2 - data.y1 }}
    />
);

// --- 3. REPRODUCTOR PRINCIPAL ---

const WhiteboardPlayer = ({ scenes, onStepChange, requestedStep }) => {
    if (!scenes || scenes.length === 0) return <div className="p-10 text-center text-slate-400">Cargando pizarra...</div>;

    const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [maxStepReached, setMaxStepReached] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [elementStates, setElementStates] = useState({});
    
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [autoPan, setAutoPan] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);
    
    const synth = useRef(window.speechSynthesis);
    const isManualJump = useRef(false);

    const scene = scenes[currentSceneIdx];
    
    // 2. Usas el hook pasándole la referencia del contenedor
    const { width, height, isMobile } = useContainerDimensions(containerRef);
    // Mapa de navegación
    const elementToStepMap = useMemo(() => {
        const map = {};
        if (!scene) return map;
        scene.insts.forEach((inst, stepIndex) => {
            if (inst.tgs) {
                inst.tgs.forEach(tg => {
                    const idStr = tg.tg.toString().split(':')[0];
                    const idx = parseInt(idStr);
                    if (map[idx] === undefined) {
                        map[idx] = stepIndex;
                    }
                });
            }
        });
        return map;
    }, [scene]);

    // Actualizar maxStepReached
    useEffect(() => {
        if (currentStepIdx > maxStepReached) {
            setMaxStepReached(currentStepIdx);
        }
    }, [currentStepIdx]); 

    // Salto externo (Sidebar)
    useEffect(() => {
        if (requestedStep !== null && requestedStep !== undefined && requestedStep !== currentStepIdx) {
            handleJumpToStep(requestedStep);
        }
    }, [requestedStep]);

    // Notificar cambio de paso
    useEffect(() => {
        if (onStepChange) onStepChange(currentStepIdx);
    }, [currentStepIdx, onStepChange]);

    // Reset completo al cambiar escena
    useEffect(() => {
        setCurrentStepIdx(-1);
        setMaxStepReached(-1);
        setIsPlaying(false);
        synth.current.cancel();
        setPan({ x: 0, y: 0 });
        const initialState = {};
        scene.cont.forEach((el, idx) => initialState[idx] = { visible: el.status === 'show', highlights: [] });
        setElementStates(initialState);
    }, [currentSceneIdx, scene]);


    // ==========================================
    // 🧠 EFECTO 1: LÓGICA DE AUDIO Y SECUENCIA
    // ==========================================
    // Este efecto SOLO se dispara cuando cambia el paso o el play.
    // NO depende de maxStepReached ni de autoPan.
    useEffect(() => {
        // 1. Limpieza de audio previo
        synth.current.cancel();

        // 2. Si no hay paso válido o pausa, no hacemos nada más
        if (currentStepIdx === -1 || !isPlaying) return;

        const currentInst = scene.insts[currentStepIdx];
        if (!currentInst) return;

        // 3. Configurar y lanzar audio
        const utterance = new SpeechSynthesisUtterance(currentInst.msg);
        utterance.lang = 'es-ES';
        utterance.rate = 1.1;
        
        utterance.onend = () => {
            // Si el usuario saltó manualmente, ignoramos este evento de fin
            if (isManualJump.current) {
                isManualJump.current = false;
                return;
            }

            if (isPlaying) {
                if (currentStepIdx < scene.insts.length - 1) {
                    setCurrentStepIdx(prev => prev + 1);
                } else {
                    setIsPlaying(false);
                }
            }
        };

        // Pequeño timeout para evitar conflictos de navegador
        const timer = setTimeout(() => synth.current.speak(utterance), 10);
        
        return () => clearTimeout(timer);

    }, [currentStepIdx, isPlaying, scene]); // <--- DEPENDENCIAS CRÍTICAS REDUCIDAS


    // ==========================================
    // 👁️ EFECTO 2: VISUALES Y CÁMARA
    // ==========================================
    // Este efecto maneja lo que se ve. Puede ejecutarse muchas veces 
    // sin reiniciar el audio.
    useEffect(() => {
        if (currentStepIdx === -1) {
             // Reset visual inicial
             const initialState = {};
             scene.cont.forEach((el, idx) => initialState[idx] = { visible: el.status === 'show', highlights: [] });
             setElementStates(initialState);
             return; 
        }

        const currentInst = scene.insts[currentStepIdx];
        if (!currentInst) return;

        const contarFrac=(element)=>{
            console.log(element.cont.split("frac").length)
            return element.cont.split("frac").length}
        

        // 1. AUTO-ENFOQUE (CÁMARA)
    // 1. AUTO-ENFOQUE (CÁMARA) CORREGIDO
// 1. AUTO-ENFOQUE (CÁMARA) - Lógica de Centroide
        if (autoPan && currentInst.tgs && currentInst.tgs.length > 0 && containerRef.current) {
            
            let sumX = 0;
            let sumY = 0;
            let count = 0;

            currentInst.tgs.forEach(tgObj => {
                let idStr = tgObj.tg.toString().split(':')[0];
                const idx = parseInt(idStr);
                const element = scene.cont[idx];

                if (element && element.x !== undefined && element.y !== undefined) {
                    sumX += element.x;
                    sumY += element.y;
                    count++;
                }
            });

            if (count > 0) {
                // 1. Calculamos el promedio de las posiciones (El centro del grupo)
                const targetX = sumX / count;
                const targetY = sumY / count;

                // 2. Obtenemos dimensiones reales del contenedor
                const screenW = containerRef.current.clientWidth;
                const screenH = containerRef.current.clientHeight;

                // 3. CONSTANTES DE CALIBRACIÓN (Ajusta esto si sigue mal)
                // Si se ve muy a la derecha, aumenta este valor negativo (ej: -100)
                // Si se ve muy a la izquierda, ponlo positivo (ej: 50)
                const OFFSET_X = -150; 
                
                // Ajuste vertical para dejar espacio a los subtítulos
                const OFFSET_Y = -50; 

                // 4. FÓRMULA FINAL
                // Queremos que: Pan + Target = CentroPantalla
                // Por tanto: Pan = CentroPantalla - Target
                const newPanX = (screenW / 2) - targetX + OFFSET_X;
                const newPanY = (screenH / 2) - targetY + OFFSET_Y;

                setPan({ x: newPanX, y: newPanY });
            }
        }

        // 2. ESTADOS VISUALES (ELEMENTOS)
        const newState = {};
        scene.cont.forEach((el, idx) => newState[idx] = { visible: el.status === 'show', highlights: [] });

        // A) VISIBILIDAD: Calculamos hasta maxStepReached (Memoria Visual)
        const visibilityLimit = Math.max(currentStepIdx, maxStepReached);

        for (let i = 0; i <= visibilityLimit; i++) {
            const step = scene.insts[i];
            if (step.tgs) {
                step.tgs.forEach(tgObj => {
                    let idStr = tgObj.tg.toString().split(':')[0];
                    const idx = parseInt(idStr);
                    if (newState[idx]) {
                        if (tgObj.ac === 'appear') newState[idx].visible = true;
                        if (tgObj.ac === 'hide') newState[idx].visible = false;
                    }
                });
            }
            if (step.fin) step.fin.forEach(idxToHide => { if (newState[idxToHide]) newState[idxToHide].visible = false; });
        }

        // B) HIGHLIGHTS: Solo del paso ACTUAL
        if (currentInst.tgs) {
            currentInst.tgs.forEach(tgObj => {
                if (tgObj.ac === 'resalt') {
                    let idStr = tgObj.tg.toString();
                    let start = 0, end = 'f';
                    if (idStr.includes(':')) {
                        const parts = idStr.split(':');
                        idStr = parts[0];
                        const rangeStr = parts[1].replace(/[()]/g, '');
                        const rangeParts = rangeStr.split('-');
                        start = parseInt(rangeParts[0]);
                        end = rangeParts[1] === 'f' ? 'f' : parseInt(rangeParts[1]);
                    }
                    const idx = parseInt(idStr);
                    if (newState[idx]) {
                         newState[idx].highlights.push({ start, end, color: tgObj.color || '#F59E0B' });
                    }
                }
            });
        }
        
        setElementStates(newState);

    }, [currentStepIdx, maxStepReached, autoPan, scene]); // <--- AQUÍ SÍ VAN ESTAS DEPENDENCIAS


    // --- MANEJADORES ---

    const handleJumpToStep = (stepIndex) => {
        isManualJump.current = true;
        synth.current.cancel(); 
        setCurrentStepIdx(stepIndex);
        setIsPlaying(false); 
    };

    const handleSkip = () => {
        if (currentStepIdx < scene.insts.length - 1) {
            isManualJump.current = true;
            synth.current.cancel();
            setCurrentStepIdx(prev => prev + 1);
            setIsPlaying(true);
        }
    };

    const togglePlay = () => {
        if (currentStepIdx >= scene.insts.length - 1) {
            setCurrentStepIdx(0);
            setIsPlaying(true);
        } else {
            if (currentStepIdx === -1) setCurrentStepIdx(0);
            
            if (isPlaying) {
                isManualJump.current = true;
                synth.current.cancel();
                setIsPlaying(false);
            } else {
                setIsPlaying(true);
            }
        }
    };

    // Drag handlers
    const handleMouseDown = (e) => { setIsDragging(true); dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; };
    const handleMouseMove = (e) => { if (!isDragging) return; setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }); };
    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden shadow-xl border border-slate-200 relative font-sans select-none">
            {/* HEADER */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center z-20 shadow-sm shrink-0">
                <h2 className="text-xl font-bold text-slate-800">{scene.ig}</h2>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setAutoPan(!autoPan)} 
                        className={`p-2 rounded transition flex items-center gap-2 text-xs font-bold uppercase tracking-wide
                            ${autoPan ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}
                        `}
                     >
                        {autoPan ? <Video size={18}/> : <VideoOff size={18}/>}
                        {autoPan ? "Auto" : "Manual"}
                     </button>
                     <button onClick={() => setPan({x:0, y:0})} className="p-2 text-slate-500 hover:bg-slate-100 rounded"><LocateFixed size={18}/></button>
                </div>
            </div>

            {/* CANVAS */}
            <div 
                ref={containerRef}
                className={`relative flex-grow bg-white overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            >
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/graphy.png")', backgroundPosition: `${pan.x}px ${pan.y}px` }}></div>
                <motion.div className="absolute top-0 left-0 w-full h-full" animate={{ x: pan.x, y: pan.y }} transition={{ type: "spring", stiffness: 50, damping: 20 }}>
                    {scene.cont.map((el, idx) => {
                        const state = elementStates[idx];
                        if (!state) return null;
                        
                        const stepIndex = elementToStepMap[idx] || 0;

                        if (el.type === 'Latex') return (
                            <ElementoLatex 
                                key={idx} 
                                data={el} 
                                state={state} 
                                stepIndex={stepIndex} 
                                onClick={handleJumpToStep} 
                            />
                        );
                        if (el.type === 'Flecha') return <ElementoFlecha key={idx} data={el} visible={state.visible} />;
                        if (el.type === 'Marco') return <ElementoMarco key={idx} data={el} visible={state.visible} />;
                        return null;
                    })}
                </motion.div>
                
                {!isPlaying && currentStepIdx > 0 && (
                    <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs text-slate-500 shadow-sm border flex items-center gap-2 pointer-events-none">
                        <MousePointerClick size={14}/> Haz clic en una fórmula para volver a su explicación
                    </div>
                )}
            </div>

            {/* SUBTÍTULOS */}
            <div className="h-24 bg-slate-50 border-t border-slate-200 flex items-center justify-center px-4 shrink-0 relative z-20">
                <AnimatePresence mode='wait'>
                    {currentStepIdx >= 0 && scene.insts[currentStepIdx] && (
                        <motion.div key={currentStepIdx} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="text-center max-w-3xl">
                            <p className="text-slate-700 text-lg font-medium leading-relaxed">{scene.insts[currentStepIdx].msg}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CONTROLES */}
            <div className="bg-white p-4 border-t flex items-center justify-center gap-4 z-20 shrink-0">
                <button onClick={() => { setIsPlaying(false); setCurrentStepIdx(-1); setMaxStepReached(-1); setPan({x:0, y:0}); }} className="p-3 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-50 transition" title="Reiniciar"><RefreshCw size={20}/></button>
                
                <button onClick={togglePlay} className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                    {isPlaying ? <><Pause fill="white" size={20}/> Pausar</> : <><Play fill="white" size={20}/> {currentStepIdx === -1 ? 'Comenzar' : 'Continuar'}</>}
                </button>

                <button 
                    onClick={handleSkip} 
                    disabled={currentStepIdx >= scene.insts.length - 1}
                    className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Siguiente Paso"
                >
                    <SkipForward size={24}/>
                </button>
            </div>
        </div>
    );
};

export default WhiteboardPlayer;