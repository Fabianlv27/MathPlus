import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RefreshCw, Video, VideoOff, SkipForward, 
  Maximize, Minimize, Sparkles, BookOpen, X,ChevronUp, ChevronDown // <--- Agregamos BookOpen y X
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import SidebarRecursos from './SidebarComponent'; // <--- Importamos el componente existente

// ... (MANTENER LA FUNCIÓN injectHighlights IGUAL QUE ANTES) ...
const injectHighlights = (latex, highlights = []) => {
    // ... tu código de injectHighlights ...
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

// ... (MANTENER ElementoLatex IGUAL QUE ANTES) ...
const ElementoLatex = ({ data, state, onClick, stepIndex, isCurrentStep }) => {
    // ... tu código de ElementoLatex ...
    const highlights = state?.highlights || [];
    const isVisible = state?.visible || false;
    const finalLatex = injectHighlights(data.cont, highlights);
    const isInteractive = isVisible && stepIndex !== undefined;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, top: data.y }}
            transition={{ duration: 0.4 }}
            onClick={(e) => {
                if (isInteractive) {
                    e.preventDefault(); e.stopPropagation(); onClick(stepIndex);
                }
            }}
            className={`absolute flex items-center rounded-xl z-10 select-none transition-all duration-300 py-2 ${isInteractive ? 'cursor-pointer hover:bg-white/5' : 'pointer-events-none'}`}
            style={{ left: `${data.x}px`, transform: 'translate(0%, -50%)', color: isCurrentStep ? '#ffffff' : '#94a3b8', minHeight: '50px' }}
            title={isInteractive ? `Ir al paso ${stepIndex + 1}` : ""}
        >
            {isCurrentStep && (
                <motion.div layoutId="active-step-circle" className="absolute -left-10 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#00ff66] rounded-full shadow-[0_0_12px_#00ff66]" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} />
            )}
            <span className={`whitespace-nowrap pointer-events-none transition-all duration-300 ${isCurrentStep ? 'font-medium' : 'font-normal'} text-lg md:text-2xl`}>
                <InlineMath math={finalLatex} />
            </span>
        </motion.div>
    );
};

const WhiteboardPlayer = ({ scenes, onStepChange, requestedStep, onToggleFullscreen, isFullscreen, onExplainRequest }) => {
    if (!scenes || scenes.length === 0) return <div className="p-10 text-center text-slate-400">Cargando cuaderno...</div>;

    const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [maxStepReached, setMaxStepReached] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [elementStates, setElementStates] = useState({});
    const [collapsedBoxes, setCollapsedBoxes] = useState({});
    const [autoPan, setAutoPan] = useState(true);
    
    // ESTADO PARA EL PANEL LATERAL
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);

    const scrollContainerRef = useRef(null);
    const synth = useRef(window.speechSynthesis);
    const isManualJump = useRef(false);

    const scene = scenes[currentSceneIdx];

    // ... (MANTENER useMemo de elementToStepMap, activeIndex y layoutData IGUALES) ...
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

    const activeIndex = useMemo(() => {
        if (currentStepIdx < 0 || !scene.insts[currentStepIdx]) return -1;
        const tgs = scene.insts[currentStepIdx].tgs;
        if (!tgs || tgs.length === 0) return -1;
        const indices = tgs.map(tg => parseInt(tg.tg.toString().split(':')[0]));
        return Math.max(...indices); 
    }, [currentStepIdx, scene]);

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
        let accumulatedYOffset = 0; const finalElements = []; const visualBoxes = []; let maxGlobalY = 0; 
        items.forEach(item => {
            if (item.type === 'single') {
                const finalY = item.element.y + accumulatedYOffset;
                finalElements[item.element.originalIdx] = { ...item.element, x: 100, shiftedY: finalY, isHiddenByBox: false };
                if (finalY > maxGlobalY) maxGlobalY = finalY;
            } else {
                const HEADER_HEIGHT = 45; const PADDING_TOP = 70; const PADDING_BOTTOM = 90; 
                if (!item.collapsed) {
                    accumulatedYOffset += PADDING_TOP;
                    item.elements.forEach(el => {
                        const finalY = el.y + accumulatedYOffset;
                        finalElements[el.originalIdx] = { ...el, x: 140, shiftedY: finalY, isHiddenByBox: false, boxId: item.id };
                        if (finalY > maxGlobalY) maxGlobalY = finalY;
                    });
                    const boxTop = (item.minY + accumulatedYOffset) - PADDING_TOP;
                    const boxHeight = (item.maxY - item.minY) + PADDING_TOP + PADDING_BOTTOM;
                    visualBoxes.push({ id: item.id, y: boxTop, x: 80, width: 'calc(100% - 160px)', maxWidth: '800px', height: boxHeight, collapsed: false, elementIndices: item.elements.map(e => e.originalIdx) });
                    accumulatedYOffset += PADDING_BOTTOM;
                } else {
                    const boxTop = item.minY + accumulatedYOffset - 20;
                    visualBoxes.push({ id: item.id, y: boxTop, x: 80, width: 'calc(100% - 160px)', maxWidth: '800px', height: HEADER_HEIGHT, collapsed: true, elementIndices: item.elements.map(e => e.originalIdx) });
                    item.elements.forEach(el => { finalElements[el.originalIdx] = { ...el, x: 140, shiftedY: boxTop, isHiddenByBox: true, boxId: item.id }; });
                    const aiAllocatedSpace = item.maxY - item.minY; accumulatedYOffset -= aiAllocatedSpace; accumulatedYOffset += HEADER_HEIGHT; 
                }
            }
        });
        return { elements: finalElements, boxes: visualBoxes, totalHeight: maxGlobalY + 300 };
    }, [scene, collapsedBoxes]);

    // ... (MANTENER TODOS LOS useEffects IGUALES) ...
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
    useEffect(() => {
        synth.current.cancel();
        if (currentStepIdx === -1 || !isPlaying) return;
        const currentInst = scene.insts[currentStepIdx];
        if (!currentInst) return;
        const textoLimpioParaVoz = currentInst.msg.replace(/\\frac/g, " fracción ").replace(/\\log/g, " logaritmo ").replace(/[\_\^\\\{\}\$]/g, " ");
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
        if (boxesChanged) { setCollapsedBoxes(newCollapsedState); return; }
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
                if (newState[idx]) { if (tg.ac === 'appear') newState[idx].visible = true; }
            });
        }
        if (currentInst.tgs) {
            currentInst.tgs.forEach(tgObj => {
                if (tgObj.ac === 'resalt') {
                    let idStr = tgObj.tg.toString(); let start = 0, end = 'f';
                    if (idStr.includes(':')) {
                        const parts = idStr.split(':'); idStr = parts[0];
                        const rangeStr = parts[1].replace(/[()]/g, '');
                        start = parseInt(rangeStr.split('-')[0]); end = rangeStr.split('-')[1] === 'f' ? 'f' : parseInt(rangeStr.split('-')[1]);
                    }
                    if (newState[parseInt(idStr)]) newState[parseInt(idStr)].highlights.push({ start, end, color: tgObj.color || '#00ff66' });
                }
            });
        }
        setElementStates(newState);
    }, [currentStepIdx, maxStepReached, autoPan, scene, layoutData, collapsedBoxes, activeIndex]); 

    // Funciones de control
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
        <div className={`flex flex-col h-full bg-[#0a0a0a] overflow-hidden shadow-2xl relative font-sans select-none ${isFullscreen ? 'rounded-none border-0' : 'rounded-xl border border-neutral-800'}`}>
            
            {/* HEADER */}
            <div className="bg-[#111] border-b border-neutral-800 px-6 py-4 flex justify-between items-center z-20 shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-[#00ff66] tracking-wide truncate pr-4">{scene.ig}</h2>
                <div className="flex gap-2">
                     <button onClick={() => setAutoPan(!autoPan)} className={`px-3 py-1.5 rounded transition flex items-center gap-2 text-xs font-bold uppercase tracking-wide border ${autoPan ? 'text-green-400 bg-green-950/30 border-green-800/50' : 'text-neutral-500 bg-neutral-900 border-neutral-800 hover:text-neutral-300'}`}>
                        {autoPan ? <Video size={16}/> : <VideoOff size={16}/>} <span className="hidden sm:inline">{autoPan ? "Auto" : "Manual"}</span>
                     </button>
                     
                     {/* BOTÓN TOGGLE RECURSOS (NUEVO) */}
                     <button 
                         onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                         className={`px-3 py-1.5 rounded transition flex items-center gap-2 text-xs font-bold uppercase tracking-wide border ${isResourcesOpen ? 'text-[#00ff66] border-[#00ff66]/50 bg-[#00ff66]/10' : 'text-neutral-500 bg-neutral-900 border-neutral-800 hover:text-white'}`}
                         title="Ver Recursos y Teoría"
                     >
                         <BookOpen size={16}/> <span className="hidden sm:inline">Recursos</span>
                     </button>

                     {onToggleFullscreen && (
                         <button onClick={onToggleFullscreen} className="px-3 py-1.5 rounded transition flex items-center gap-2 text-xs font-bold uppercase tracking-wide border text-neutral-500 bg-neutral-900 border-neutral-800 hover:text-[#00ff66] hover:border-green-900/50">
                             {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
                         </button>
                     )}
                </div>
            </div>

            {/* AREA CENTRAL (CANVAS + OVERLAY) */}
            <div className="flex-grow relative overflow-hidden flex">
                
                {/* CANVAS SCROLLABLE */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-grow bg-[#0f1115] overflow-y-auto overflow-x-hidden custom-scrollbar relative"
                >
                    <div className="relative w-full" style={{ height: `${layoutData.totalHeight}px` }}>
                        {/* Renderizado de Líneas, Cajas y Fórmulas (Igual que antes) */}
                        {layoutData.elements.map((el, idx) => {
                            if (!elementStates[idx]?.visible || el.isHiddenByBox) return null;
                            return <div key={`line-${idx}`} className="absolute w-full border-b border-dashed border-green-900/30" style={{ top: el.shiftedY + 40 }} />;
                        })}
                        {layoutData.boxes.map(box => {
                            const isVisible = box.elementIndices.some(idx => elementStates[idx]?.visible);
                            if (!isVisible) return null;
                            return (
                                <motion.div key={box.id} initial={{ opacity: 0 }} animate={{ top: box.y, opacity: 1, height: box.height }} transition={{ duration: 0.3 }} className="absolute border border-dashed border-[#3b82f6]/70 bg-[#0c1a2e]/90 rounded-xl overflow-hidden shadow-xl z-0 flex flex-col" style={{ left: box.x, width: box.width, maxWidth: box.maxWidth }}>
                                    <div onClick={() => setCollapsedBoxes(p => ({ ...p, [box.id]: !p[box.id] }))} className="h-[45px] bg-[#11243d] cursor-pointer flex items-center justify-between px-4 hover:bg-[#183152] transition-colors border-b border-[#3b82f6]/50 shrink-0">
                                        <span className="text-sm font-bold text-[#60a5fa] tracking-wider font-mono">apart</span>
                                        <span className="text-xs text-[#93c5fd] font-bold flex items-center gap-1 bg-blue-950/50 px-2 py-1 rounded">
                                            {box.collapsed ? <ChevronDown size={14}/> : <ChevronUp size={14}/>} {box.collapsed ? "Expandir" : "Ocultar"}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {scene.cont.map((el, idx) => {
                            const state = elementStates[idx];
                            const processedEl = layoutData.elements[idx];
                            if (!state || !processedEl) return null;
                            const stepIndex = elementToStepMap[idx] || 0;
                            const renderData = { ...el, x: processedEl.x, y: processedEl.shiftedY };
                            const renderState = { ...state, visible: state.visible && !processedEl.isHiddenByBox };
                            const isCurrentStep = (idx === activeIndex);
                            if (el.type === 'Latex') return <ElementoLatex key={idx} data={renderData} state={renderState} stepIndex={stepIndex} isCurrentStep={isCurrentStep} onClick={handleJumpToStep} />;
                            return null;
                        })}
                    </div>
                </div>

                {/* --- OVERLAY DESLIZANTE DE RECURSOS (NUEVO) --- */}
                <AnimatePresence>
                    {isResourcesOpen && (
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute top-0 right-0 h-full w-[350px] bg-[#0a0a0a]/95 backdrop-blur-md border-l border-neutral-800 shadow-2xl z-50 flex flex-col"
                        >
                            <div className="flex justify-between items-center p-4 border-b border-neutral-800">
                                <h3 className="text-white font-bold flex items-center gap-2"><BookOpen size={18} className="text-[#00ff66]"/> Recursos</h3>
                                <button onClick={() => setIsResourcesOpen(false)} className="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                                    <X size={18}/>
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <SidebarRecursos 
                                    resources={scene.resources}
                                    currentStepIdx={currentStepIdx}
                                    onResourceClick={(step) => {
                                        handleJumpToStep(step);
                                        // Opcional: Cerrar sidebar al hacer clic en móvil, mantener en desktop
                                        if (window.innerWidth < 768) setIsResourcesOpen(false);
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* CONTROLES Y SUBTÍTULOS (Igual que antes) */}
            <div className="bg-[#111] border-t border-neutral-800 shrink-0 relative z-20">
                <AnimatePresence mode='wait'>
                    {currentStepIdx >= 0 && scene.insts[currentStepIdx] && (
                        <motion.div key={currentStepIdx} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="px-6 py-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                                <p className="text-neutral-300 text-base md:text-lg font-medium leading-relaxed">{scene.insts[currentStepIdx].msg}</p>
                            </div>
                            {onExplainRequest && (
                                <div className="px-6 pb-3 flex justify-end">
                                    <button onClick={() => {
                                        const activeEqIdx = activeIndex !== -1 ? activeIndex : 0;
                                        const ecActual = scene.cont[activeEqIdx]?.cont || "";
                                        const ecSiguiente = scene.cont[activeEqIdx + 1]?.cont || ecActual;
                                        onExplainRequest(currentStepIdx, ecActual, ecSiguiente);
                                    }} className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-amber-500/30 text-amber-500 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-500/10 hover:border-amber-500 transition-all group">
                                        <Sparkles size={14} className="group-hover:rotate-12 transition-transform"/> Explicar paso a fondo
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="bg-[#0a0a0a] p-4 border-t border-neutral-800 flex items-center justify-center gap-6 z-20 shrink-0">
                <button onClick={() => { setIsPlaying(false); setCurrentStepIdx(-1); setMaxStepReached(-1); setCollapsedBoxes({}); if(scrollContainerRef.current) scrollContainerRef.current.scrollTop=0; }} className="p-3 text-neutral-500 hover:text-[#00ff66] rounded-full hover:bg-neutral-900 transition"><RefreshCw size={20}/></button>
                <button onClick={togglePlay} className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold text-black shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-amber-500 shadow-amber-500/30' : 'bg-[#00ff66]'}`}>{isPlaying ? <><Pause fill="black" size={20}/> Pausar</> : <><Play fill="black" size={20}/> {currentStepIdx === -1 ? 'Comenzar' : 'Continuar'}</>}</button>
                <button onClick={handleSkip} disabled={currentStepIdx >= scene.insts.length - 1} className="p-3 text-neutral-500 hover:text-[#00ff66] hover:bg-neutral-900 rounded-full transition disabled:opacity-30"><SkipForward size={24}/></button>
            </div>
        </div>
    );
};

export default WhiteboardPlayer;