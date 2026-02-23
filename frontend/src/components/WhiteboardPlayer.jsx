import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, Video, VideoOff, SkipForward, MousePointerClick, ChevronDown, ChevronUp } from 'lucide-react';
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

const ElementoLatex = ({ data, state, onClick, stepIndex, isCurrentStep }) => {
    const highlights = state?.highlights || [];
    const isVisible = state?.visible || false;
    const finalLatex = injectHighlights(data.cont, highlights);
    
    const isInteractive = isVisible && stepIndex !== undefined;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
                opacity: isVisible ? 1 : 0, 
                top: data.y 
            }}
            transition={{ duration: 0.4 }}
            onClick={(e) => {
                if (isInteractive) {
                    e.preventDefault();
                    e.stopPropagation(); 
                    onClick(stepIndex);
                }
            }}
            className={`absolute flex items-center rounded-xl z-50 select-none transition-all duration-300 py-2
                ${isInteractive ? 'cursor-pointer hover:bg-white/5' : 'pointer-events-none'}
            `}
            style={{ 
                left: `${data.x}px`, 
                // TRUCO CLAVE: Transform translate(0%, -50%) fuerza la alineación a la izquierda
                transform: 'translate(0%, -50%)', 
                color: isCurrentStep ? '#ffffff' : '#94a3b8', // Blanco si está activo, gris si es historial
                minHeight: '50px'
            }}
            title={isInteractive ? `Ir al paso ${stepIndex + 1}` : ""}
        >
            {/* CÍRCULO VERDE INDICADOR (Solo en el paso actual) */}
            {isCurrentStep && (
                <motion.div 
                    layoutId="active-step-circle"
                    className="absolute -left-10 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#00ff66] rounded-full shadow-[0_0_12px_#00ff66]"
                    initial={{ opacity: 0, scale: 0 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
            )}
            
            <span className={`whitespace-nowrap pointer-events-none transition-all duration-300 ${isCurrentStep ? 'font-medium' : 'font-normal'} text-lg md:text-2xl`}>
                <InlineMath math={finalLatex} />
            </span>
        </motion.div>
    );
};

// --- 3. REPRODUCTOR PRINCIPAL ---

const WhiteboardPlayer = ({ scenes, onStepChange, requestedStep }) => {
    if (!scenes || scenes.length === 0) return <div className="p-10 text-center text-slate-400">Cargando cuaderno...</div>;

    const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [maxStepReached, setMaxStepReached] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [elementStates, setElementStates] = useState({});
    const [collapsedBoxes, setCollapsedBoxes] = useState({});
    
    const [autoPan, setAutoPan] = useState(true);
    const scrollContainerRef = useRef(null);
    const synth = useRef(window.speechSynthesis);
    const isManualJump = useRef(false);

    const scene = scenes[currentSceneIdx];

    // Mapa de navegación
    const elementToStepMap = useMemo(() => {
        const map = {};
        if (!scene) return map;
        scene.insts.forEach((inst, stepIndex) => {
            if (inst.tgs) {
                inst.tgs.forEach(tg => {
                    const idStr = tg.tg.toString().split(':')[0];
                    if (map[parseInt(idStr)] === undefined) map[parseInt(idStr)] = stepIndex;
                });
            }
        });
        return map;
    }, [scene]);

    // Calcular el ÚNICO elemento activo para ponerle la bolita verde
    const activeIndex = useMemo(() => {
        if (currentStepIdx < 0 || !scene.insts[currentStepIdx]) return -1;
        const tgs = scene.insts[currentStepIdx].tgs;
        if (!tgs || tgs.length === 0) return -1;
        const indices = tgs.map(tg => parseInt(tg.tg.toString().split(':')[0]));
        return Math.max(...indices); // Siempre selecciona la ecuación más nueva
    }, [currentStepIdx, scene]);

    // ==========================================
    // 🧠 MOTOR DE DISEÑO (ALINEACIÓN IZQUIERDA Y CAJAS PERFECTAS)
    // ==========================================
    const layoutData = useMemo(() => {
        if (!scene || !scene.cont) return { elements: [], boxes: [], totalHeight: 800 };
        
        const items = [];
        let currentBox = null;
        
        scene.cont.forEach((el, idx) => {
            const elData = { ...el, originalIdx: idx };
            if (el.apart === 'start' || el.apart === 'start-end') {
                currentBox = { id: `box-${idx}`, elements: [], minY: el.y, maxY: el.y, collapsed: !!collapsedBoxes[`box-${idx}`] };
                items.push(currentBox);
            }
            if (currentBox) {
                currentBox.elements.push(elData);
                currentBox.minY = Math.min(currentBox.minY, el.y);
                currentBox.maxY = Math.max(currentBox.maxY, el.y);
            } else {
                items.push({ type: 'single', element: elData });
            }
            if (el.apart === 'end' || el.apart === 'start-end') currentBox = null;
        });
        
        let accumulatedYOffset = 0; 
        const finalElements = [];
        const visualBoxes = [];
        let maxGlobalY = 0; 
        
        items.forEach(item => {
            if (item.type === 'single') {
                const finalY = item.element.y + accumulatedYOffset;
                finalElements[item.element.originalIdx] = { 
                    ...item.element, 
                    x: 100, // MARGEN IZQUIERDO PRINCIPAL
                    shiftedY: finalY, 
                    isHiddenByBox: false 
                };
                if (finalY > maxGlobalY) maxGlobalY = finalY;
            } else {
                const HEADER_HEIGHT = 45;
                const PADDING_TOP = 70; 
                const PADDING_BOTTOM = 90; // ¡Aumentado para que las fracciones no se salgan por abajo!
                
                if (!item.collapsed) {
                    accumulatedYOffset += PADDING_TOP;
                    item.elements.forEach(el => {
                        const finalY = el.y + accumulatedYOffset;
                        finalElements[el.originalIdx] = { 
                            ...el, 
                            x: 140, // MARGEN IZQUIERDO DENTRO DE LA CAJA (Indentado)
                            shiftedY: finalY, 
                            isHiddenByBox: false, 
                            boxId: item.id 
                        };
                        if (finalY > maxGlobalY) maxGlobalY = finalY;
                    });
                    
                    const boxTop = (item.minY + accumulatedYOffset) - PADDING_TOP;
                    const boxHeight = (item.maxY - item.minY) + PADDING_TOP + PADDING_BOTTOM;

                    visualBoxes.push({
                        id: item.id, y: boxTop, x: 80, // La caja empieza un poco antes que el texto
                        width: 'calc(100% - 160px)', maxWidth: '800px', // Ancho adaptable
                        height: boxHeight, collapsed: false, elementIndices: item.elements.map(e => e.originalIdx)
                    });
                    accumulatedYOffset += PADDING_BOTTOM;
                } else {
                    const boxTop = item.minY + accumulatedYOffset - 20;
                    visualBoxes.push({
                        id: item.id, y: boxTop, x: 80, width: 'calc(100% - 160px)', maxWidth: '800px', height: HEADER_HEIGHT,
                        collapsed: true, elementIndices: item.elements.map(e => e.originalIdx)
                    });
                    
                    item.elements.forEach(el => {
                        finalElements[el.originalIdx] = { ...el, x: 140, shiftedY: boxTop, isHiddenByBox: true, boxId: item.id };
                    });
                    
                    const aiAllocatedSpace = item.maxY - item.minY;
                    accumulatedYOffset -= aiAllocatedSpace;
                    accumulatedYOffset += HEADER_HEIGHT; 
                }
            }
        });
        
        return { elements: finalElements, boxes: visualBoxes, totalHeight: maxGlobalY + 300 };
    }, [scene, collapsedBoxes]);

    useEffect(() => { if (currentStepIdx > maxStepReached) setMaxStepReached(currentStepIdx); }, [currentStepIdx]); 
    useEffect(() => { if (requestedStep !== null && requestedStep !== undefined && requestedStep !== currentStepIdx) handleJumpToStep(requestedStep); }, [requestedStep]);
    useEffect(() => { if (onStepChange) onStepChange(currentStepIdx); }, [currentStepIdx, onStepChange]);

    useEffect(() => {
        setCurrentStepIdx(-1); setMaxStepReached(-1); setIsPlaying(false); setCollapsedBoxes({});
        synth.current.cancel(); 
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
        const initialState = {};
        scene.cont.forEach((el, idx) => initialState[idx] = { visible: el.status === 'show', highlights: [] });
        setElementStates(initialState);
    }, [currentSceneIdx, scene]);

    // Audio Sequence
    useEffect(() => {
        synth.current.cancel();
        if (currentStepIdx === -1 || !isPlaying) return;
        const currentInst = scene.insts[currentStepIdx];
        if (!currentInst) return;

        const textoLimpioParaVoz = currentInst.msg
            .replace(/\\frac/g, " fracción ")
            .replace(/\\log/g, " logaritmo ")
            .replace(/[\_\^\\\{\}\$]/g, " ");

        const utterance = new SpeechSynthesisUtterance(textoLimpioParaVoz);
        utterance.lang = 'es-ES'; utterance.rate = 1.1;
        utterance.onend = () => {
            if (isManualJump.current) { isManualJump.current = false; return; }
            if (isPlaying) {
                if (currentStepIdx < scene.insts.length - 1) setCurrentStepIdx(prev => prev + 1);
                else setIsPlaying(false);
            }
        };
        const timer = setTimeout(() => synth.current.speak(utterance), 10);
        return () => clearTimeout(timer);
    }, [currentStepIdx, isPlaying, scene]); 

    // Visibilidad, Iluminación y Auto-Scroll
    useEffect(() => {
        if (currentStepIdx === -1) {
             const initialState = {};
             scene.cont.forEach((el, idx) => initialState[idx] = { visible: el.status === 'show', highlights: [] });
             setElementStates(initialState);
             return; 
        }

        const currentInst = scene.insts[currentStepIdx];
        if (!currentInst) return;

        let boxesChanged = false;
        let newCollapsedState = { ...collapsedBoxes };
        if (currentInst.tgs) {
            currentInst.tgs.forEach(tgObj => {
                const idx = parseInt(tgObj.tg.toString().split(':')[0]);
                const boxId = layoutData.elements[idx]?.boxId;
                if (boxId && newCollapsedState[boxId]) {
                    newCollapsedState[boxId] = false;
                    boxesChanged = true;
                }
            });
        }
        if (boxesChanged) {
            setCollapsedBoxes(newCollapsedState);
            return; 
        }

        if (autoPan && activeIndex !== -1 && scrollContainerRef.current) {
            const element = layoutData.elements[activeIndex];
            if (element && element.shiftedY !== undefined) {
                scrollContainerRef.current.scrollTo({
                    top: element.shiftedY - (scrollContainerRef.current.clientHeight / 2) + 100,
                    behavior: 'smooth'
                });
            }
        }

        const newState = {};
        scene.cont.forEach((el, idx) => newState[idx] = { visible: el.status === 'show', highlights: [] });
        const visibilityLimit = Math.max(currentStepIdx, maxStepReached);

        for (let i = 0; i <= visibilityLimit; i++) {
            const step = scene.insts[i];
            if (step && step.tgs) step.tgs.forEach(tg => {
                const idx = parseInt(tg.tg.toString().split(':')[0]);
                if (newState[idx]) {
                    if (tg.ac === 'appear') newState[idx].visible = true;
                    // Ya no ocultamos el historial, todo persiste.
                }
            });
        }

        if (currentInst.tgs) {
            currentInst.tgs.forEach(tgObj => {
                if (tgObj.ac === 'resalt') {
                    let idStr = tgObj.tg.toString();
                    let start = 0, end = 'f';
                    if (idStr.includes(':')) {
                        const parts = idStr.split(':');
                        idStr = parts[0];
                        const rangeStr = parts[1].replace(/[()]/g, '');
                        start = parseInt(rangeStr.split('-')[0]);
                        end = rangeStr.split('-')[1] === 'f' ? 'f' : parseInt(rangeStr.split('-')[1]);
                    }
                    if (newState[parseInt(idStr)]) newState[parseInt(idStr)].highlights.push({ start, end, color: tgObj.color || '#00ff66' });
                }
            });
        }
        setElementStates(newState);
    }, [currentStepIdx, maxStepReached, autoPan, scene, layoutData, collapsedBoxes, activeIndex]); 

    const handleJumpToStep = (step) => { isManualJump.current = true; synth.current.cancel(); setCurrentStepIdx(step); setIsPlaying(false); };
    const handleSkip = () => { if (currentStepIdx < scene.insts.length - 1) { isManualJump.current = true; synth.current.cancel(); setCurrentStepIdx(prev => prev + 1); setIsPlaying(true); } };
    const togglePlay = () => {
        if (currentStepIdx >= scene.insts.length - 1) { setCurrentStepIdx(0); setIsPlaying(true); } 
        else {
            if (currentStepIdx === -1) setCurrentStepIdx(0);
            if (isPlaying) { isManualJump.current = true; synth.current.cancel(); setIsPlaying(false); } 
            else setIsPlaying(true);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl border border-neutral-800 relative font-sans select-none">
            {/* HEADER */}
            <div className="bg-[#111] border-b border-neutral-800 px-6 py-4 flex justify-between items-center z-20 shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-[#00ff66] tracking-wide">{scene.ig}</h2>
                <div className="flex gap-2">
                     <button onClick={() => setAutoPan(!autoPan)} className={`px-3 py-1.5 rounded transition flex items-center gap-2 text-xs font-bold uppercase tracking-wide border ${autoPan ? 'text-green-400 bg-green-950/30 border-green-800/50' : 'text-neutral-500 bg-neutral-900 border-neutral-800 hover:text-neutral-300'}`}>
                        {autoPan ? <Video size={16}/> : <VideoOff size={16}/>} {autoPan ? "Auto-Scroll" : "Manual"}
                     </button>
                </div>
            </div>

            {/* CANVAS CUADERNO */}
            <div 
                ref={scrollContainerRef}
                className="relative flex-grow bg-[#0f1115] overflow-y-auto overflow-x-hidden custom-scrollbar"
            >
                <div className="relative w-full" style={{ height: `${layoutData.totalHeight}px` }}>
                    
                    {/* LÍNEAS GUÍA (CUADERNO) */}
                    {layoutData.elements.map((el, idx) => {
                        if (!elementStates[idx]?.visible || el.isHiddenByBox) return null;
                        return (
                            <div key={`line-${idx}`} className="absolute w-full border-b border-dashed border-green-900/30" style={{ top: el.shiftedY + 40 }} />
                        );
                    })}

                    {/* CAJAS APART (AZUL OSCURO PUNTEADO) */}
                    {layoutData.boxes.map(box => {
                        const isVisible = box.elementIndices.some(idx => elementStates[idx]?.visible);
                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={box.id} initial={{ opacity: 0 }}
                                animate={{ top: box.y, opacity: 1, height: box.height }}
                                transition={{ duration: 0.3 }}
                                className="absolute border border-dashed border-[#3b82f6]/70 bg-[#0c1a2e]/90 rounded-xl overflow-hidden shadow-xl z-0 flex flex-col"
                                style={{ left: box.x, width: box.width, maxWidth: box.maxWidth }}
                            >
                                <div 
                                    onClick={() => setCollapsedBoxes(p => ({ ...p, [box.id]: !p[box.id] }))}
                                    className="h-[45px] bg-[#11243d] cursor-pointer flex items-center justify-between px-4 hover:bg-[#183152] transition-colors border-b border-[#3b82f6]/50 shrink-0"
                                >
                                    <span className="text-sm font-bold text-[#60a5fa] tracking-wider font-mono">apart</span>
                                    <span className="text-xs text-[#93c5fd] font-bold flex items-center gap-1 bg-blue-950/50 px-2 py-1 rounded">
                                        {box.collapsed ? <><ChevronDown size={14}/> Expandir</> : <><ChevronUp size={14}/> Ocultar</>}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* FÓRMULAS MATEMÁTICAS */}
                    {scene.cont.map((el, idx) => {
                        const state = elementStates[idx];
                        const processedEl = layoutData.elements[idx];
                        if (!state || !processedEl) return null;
                        
                        const stepIndex = elementToStepMap[idx] || 0;
                        const renderData = { ...el, x: processedEl.x, y: processedEl.shiftedY };
                        const renderState = { ...state, visible: state.visible && !processedEl.isHiddenByBox };
                        
                        const isCurrentStep = (idx === activeIndex);

                        if (el.type === 'Latex') return (
                            <ElementoLatex 
                                key={idx} data={renderData} state={renderState} stepIndex={stepIndex} isCurrentStep={isCurrentStep} onClick={handleJumpToStep} 
                            />
                        );
                        return null;
                    })}
                </div>
            </div>

            {/* SUBTÍTULOS CON SCROLL */}
            <div className="h-32 bg-[#111] border-t border-neutral-800 overflow-y-auto px-6 py-4 shrink-0 relative z-20 custom-scrollbar">
                <AnimatePresence mode='wait'>
                    {currentStepIdx >= 0 && scene.insts[currentStepIdx] && (
                        <motion.div key={currentStepIdx} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
                            <p className="text-neutral-300 text-base md:text-lg font-medium leading-relaxed">
                                {scene.insts[currentStepIdx].msg}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CONTROLES */}
            <div className="bg-[#0a0a0a] p-4 border-t border-neutral-800 flex items-center justify-center gap-6 z-20 shrink-0">
                <button onClick={() => { setIsPlaying(false); setCurrentStepIdx(-1); setMaxStepReached(-1); setCollapsedBoxes({}); if(scrollContainerRef.current) scrollContainerRef.current.scrollTop=0; }} className="p-3 text-neutral-500 hover:text-[#00ff66] rounded-full hover:bg-neutral-900 transition" title="Reiniciar"><RefreshCw size={20}/></button>
                <button onClick={togglePlay} className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold text-black shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-amber-500 shadow-amber-500/30' : 'bg-[#00ff66]'}`}>
                    {isPlaying ? <><Pause fill="black" size={20}/> Pausar</> : <><Play fill="black" size={20}/> {currentStepIdx === -1 ? 'Comenzar' : 'Continuar'}</>}
                </button>
                <button onClick={handleSkip} disabled={currentStepIdx >= scene.insts.length - 1} className="p-3 text-neutral-500 hover:text-[#00ff66] hover:bg-neutral-900 rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent" title="Siguiente Paso">
                    <SkipForward size={24}/>
                </button>
            </div>
        </div>
    );
};

export default WhiteboardPlayer;