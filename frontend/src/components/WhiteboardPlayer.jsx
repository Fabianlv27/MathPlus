import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InlineMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, LocateFixed, Video, VideoOff, SkipForward, MousePointerClick, ChevronDown, ChevronUp } from 'lucide-react';
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

const ElementoLatex = ({ data, state, onClick, stepIndex, currentStepIdx }) => {
    const highlights = state?.highlights || [];
    const isVisible = state?.visible || false;
    const finalLatex = injectHighlights(data.cont, highlights);
    
    const isInteractive = isVisible && stepIndex !== undefined;
    const isCurrentStep = stepIndex === currentStepIdx;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
                opacity: isVisible ? 1 : 0, 
                scale: isVisible ? (isCurrentStep ? 1.02 : 1) : 0.8,
                top: data.y // ¡Animación fluida en Y al colapsar cajas!
            }}
            transition={{ duration: 0.4, top: { type: "spring", stiffness: 60, damping: 15 } }}
            onClick={(e) => {
                if (isInteractive) {
                    e.preventDefault();
                    e.stopPropagation(); 
                    onClick(stepIndex);
                }
            }}
            className={`absolute flex items-center justify-center rounded-xl z-50 select-none
                ${isInteractive ? 'cursor-pointer' : 'pointer-events-none'}
                ${isCurrentStep 
                    ? 'bg-white shadow-md ring-1 ring-slate-200/60 z-[60]' 
                    : 'hover:bg-indigo-50/50 hover:scale-105 transition-colors' 
                }
            `}
            style={{ 
                left: `${data.x}px`, 
                transform: 'translate(-50%, -50%)', 
                color: isCurrentStep ? '#0f172a' : '#475569', 
                padding: '20px',
                minWidth: '80px',
                minHeight: '60px'
            }}
            title={isInteractive ? `Ir al paso ${stepIndex + 1}` : ""}
        >
            {isCurrentStep && (
                <motion.div 
                    layoutId="active-step-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-500 rounded-r-full"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                />
            )}
            <span className={`whitespace-nowrap pointer-events-none transition-all duration-300 ${isCurrentStep ? 'font-medium' : 'font-normal'} text-lg md:text-2xl`}>
                <InlineMath math={finalLatex} />
            </span>
        </motion.div>
    );
};

// --- 3. REPRODUCTOR PRINCIPAL ---
// --- CALCULADORA DE ANCHOS DINÁMICOS ---
const estimateBoxWidth = (elements) => {
    let maxWidth = 300; // Ancho mínimo de la caja por estética (el tamaño del encabezado)
    
    elements.forEach(el => {
        if (!el.cont) return;
        // 1. Limpiamos comandos que no ocupan ancho real horizontalmente
        const cleanStr = el.cont.replace(/\\[a-zA-Z]+/g, 'X');
        
        // 2. Asignamos ~16px por carácter (para texto text-lg/2xl) + 120px de padding (60px a cada lado)
        const estimatedWidth = (cleanStr.length * 16) + 120;
        
        if (estimatedWidth > maxWidth) maxWidth = estimatedWidth;
    });
    
    // Limitamos el ancho máximo a 900px para que no se salga de pantallas normales
    return Math.min(maxWidth, 900); 
};
const WhiteboardPlayer = ({ scenes, onStepChange, requestedStep }) => {
    if (!scenes || scenes.length === 0) return <div className="p-10 text-center text-slate-400">Cargando pizarra...</div>;

    const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [maxStepReached, setMaxStepReached] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [elementStates, setElementStates] = useState({});
    
    // NUEVO: Estado de las cajas colapsables
    const [collapsedBoxes, setCollapsedBoxes] = useState({});
    
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [autoPan, setAutoPan] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);
    
    const synth = useRef(window.speechSynthesis);
    const isManualJump = useRef(false);

    const scene = scenes[currentSceneIdx];
    const { width, height, isMobile } = useContainerDimensions(containerRef);

    // Mapa de navegación
    const elementToStepMap = useMemo(() => {
        const map = {};
        if (!scene) return map;
        scene.insts.forEach((inst, stepIndex) => {
            if (inst.tgs) {
                inst.tgs.forEach(tg => {
                    const idStr = tg.tg.toString().split(':')[0];
                    map[parseInt(idStr)] = stepIndex;
                });
            }
        });
        return map;
    }, [scene]);

// ==========================================
    // 🧠 MOTOR DE DISEÑO: CAJAS Y COORDENADAS DINÁMICAS
    // ==========================================
  // ==========================================
    // 🧠 MOTOR DE DISEÑO: CAJAS Y COORDENADAS DINÁMICAS
    // ==========================================
    const layoutData = useMemo(() => {
        if (!scene || !scene.cont) return { elements: [], boxes: [] };
        
        const items = [];
        let currentBox = null;
        
        // 1. Agrupar elementos según el atributo "apart"
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
        
        // 2. Calcular desplazamientos y Geometría Dinámica
        let accumulatedYOffset = 0; // Positivo = empujar ABAJO, Negativo = tirar ARRIBA
        const finalElements = [];
        const visualBoxes = [];
        
        items.forEach(item => {
            if (item.type === 'single') {
                finalElements[item.element.originalIdx] = { 
                    ...item.element, 
                    shiftedY: item.element.y + accumulatedYOffset, 
                    isHiddenByBox: false 
                };
            } else {
                // Constantes de diseño de la caja
                const HEADER_HEIGHT = 45;
                const PADDING_TOP = 60; // Hueco interior superior (debajo del header)
                const PADDING_BOTTOM = 40; // Hueco interior inferior
                
                // Cálculo dinámico de ancho y centro
                const dynamicWidth = Math.max(estimateBoxWidth(item.elements), 450);
                let sumX = 0;
                item.elements.forEach(el => sumX += el.x);
                const boxCenterX = sumX / item.elements.length ; // Centro exacto sin +120

                if (!item.collapsed) {
                    // --- CAJA ABIERTA ---
                    // 1. Empujamos el interior hacia abajo para no pisar el Header
                    accumulatedYOffset += PADDING_TOP;

                    item.elements.forEach(el => {
                        finalElements[el.originalIdx] = { 
                            ...el, 
                            shiftedY: el.y + accumulatedYOffset, 
                            isHiddenByBox: false, 
                            boxId: item.id 
                        };
                    });
                    
                    // 2. Dibujamos la caja rodeando los elementos
                    const boxTop = (item.minY + accumulatedYOffset) - PADDING_TOP;
                    const boxHeight = (item.maxY - item.minY) + PADDING_TOP + PADDING_BOTTOM;

                    visualBoxes.push({
                        id: item.id,
                        y: boxTop,
                        x: boxCenterX+120,
                        width: dynamicWidth,
                        height: boxHeight+50,
                        collapsed: false,
                        elementIndices: item.elements.map(e => e.originalIdx)
                    });
                    
                    // 3. Empujamos todo lo que viene DESPUÉS de la caja hacia abajo
                    accumulatedYOffset += PADDING_BOTTOM;

                } else {
                    // --- CAJA COLAPSADA ---
                    const boxTop = item.minY + accumulatedYOffset - 20;

                    visualBoxes.push({
                        id: item.id,
                        y: boxTop,
                        x: boxCenterX,
                        width: dynamicWidth,
                        height: HEADER_HEIGHT,
                        collapsed: true,
                        elementIndices: item.elements.map(e => e.originalIdx)
                    });
                    
                    item.elements.forEach(el => {
                        finalElements[el.originalIdx] = { 
                            ...el, 
                            shiftedY: boxTop, // Lo escondemos arriba
                            isHiddenByBox: true, 
                            boxId: item.id 
                        };
                    });
                    
                    // Si está colapsada, recuperamos el espacio que la IA había gastado
                    const aiAllocatedSpace = item.maxY - item.minY;
                    accumulatedYOffset -= aiAllocatedSpace;
                    accumulatedYOffset += HEADER_HEIGHT; // Y le sumamos lo que mide el header
                }
            }
        });
        
        return { elements: finalElements, boxes: visualBoxes };
    }, [scene, collapsedBoxes]);

    useEffect(() => { if (currentStepIdx > maxStepReached) setMaxStepReached(currentStepIdx); }, [currentStepIdx]); 
    useEffect(() => { if (requestedStep !== null && requestedStep !== undefined && requestedStep !== currentStepIdx) handleJumpToStep(requestedStep); }, [requestedStep]);
    useEffect(() => { if (onStepChange) onStepChange(currentStepIdx); }, [currentStepIdx, onStepChange]);

    useEffect(() => {
        setCurrentStepIdx(-1); setMaxStepReached(-1); setIsPlaying(false); setCollapsedBoxes({});
        synth.current.cancel(); setPan({ x: 0, y: 0 });
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

        const utterance = new SpeechSynthesisUtterance(currentInst.msg);
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

    // Cámara y Estados Visuales
    useEffect(() => {
        if (currentStepIdx === -1) {
             const initialState = {};
             scene.cont.forEach((el, idx) => initialState[idx] = { visible: el.status === 'show', highlights: [] });
             setElementStates(initialState);
             return; 
        }

        const currentInst = scene.insts[currentStepIdx];
        if (!currentInst) return;

        // AUTO-ABRIR CAJAS COLAPSADAS SI EL PASO ESTÁ DENTRO DE ELLAS
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
            return; // Pausamos este render; el cambio de estado volverá a lanzar el useEffect con la caja abierta
        }

        // CÁMARA CENTROIDE USANDO COORDENADAS DINÁMICAS (shiftedY)
        if (autoPan && currentInst.tgs && currentInst.tgs.length > 0 && containerRef.current) {
            let sumX = 0, sumY = 0, count = 0;
            currentInst.tgs.forEach(tgObj => {
                const idx = parseInt(tgObj.tg.toString().split(':')[0]);
                const element = layoutData.elements[idx]; // Usamos la posición corregida por el acordeón
                if (element && element.x !== undefined && element.shiftedY !== undefined) {
                    sumX += element.x; sumY += element.shiftedY; count++;
                }
            });
            if (count > 0) {
                const targetX = sumX / count;
                const targetY = sumY / count;
                const newPanX = (containerRef.current.clientWidth / 2) - targetX - 150;
                const newPanY = (containerRef.current.clientHeight / 2) - targetY - 50;
                setPan({ x: newPanX, y: newPanY });
            }
        }

        // VISIBILIDAD E ILUMINACIÓN
        const newState = {};
        scene.cont.forEach((el, idx) => newState[idx] = { visible: el.status === 'show', highlights: [] });
        const visibilityLimit = Math.max(currentStepIdx, maxStepReached);

        for (let i = 0; i <= visibilityLimit; i++) {
            const step = scene.insts[i];
            if (step.tgs) step.tgs.forEach(tg => {
                const idx = parseInt(tg.tg.toString().split(':')[0]);
                if (newState[idx]) {
                    if (tg.ac === 'appear') newState[idx].visible = true;
                    if (tg.ac === 'hide') newState[idx].visible = false;
                }
            });
            if (step.fin) step.fin.forEach(idx => { if (newState[idx]) newState[idx].visible = false; });
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
                    if (newState[parseInt(idStr)]) newState[parseInt(idStr)].highlights.push({ start, end, color: tgObj.color || '#F59E0B' });
                }
            });
        }
        setElementStates(newState);
    }, [currentStepIdx, maxStepReached, autoPan, scene, layoutData, collapsedBoxes]); 

    // Manejadores de Controles
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

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden shadow-xl border border-slate-200 relative font-sans select-none">
            {/* HEADER */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center z-20 shadow-sm shrink-0">
                <h2 className="text-xl font-bold text-slate-800">{scene.ig}</h2>
                <div className="flex gap-2">
                     <button onClick={() => setAutoPan(!autoPan)} className={`p-2 rounded transition flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${autoPan ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 bg-slate-100'}`}>
                        {autoPan ? <Video size={18}/> : <VideoOff size={18}/>} {autoPan ? "Auto" : "Manual"}
                     </button>
                     <button onClick={() => setPan({x:0, y:0})} className="p-2 text-slate-500 hover:bg-slate-100 rounded"><LocateFixed size={18}/></button>
                </div>
            </div>

            {/* CANVAS */}
            <div 
                ref={containerRef}
                className={`relative flex-grow bg-white overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={(e) => { setIsDragging(true); dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }} 
                onMouseMove={(e) => { if (!isDragging) return; setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y }); }} 
                onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            >
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/graphy.png")', backgroundPosition: `${pan.x}px ${pan.y}px` }}></div>
                
                <motion.div className="absolute top-0 left-0 w-full h-full" animate={{ x: pan.x, y: pan.y }} transition={{ type: "spring", stiffness: 50, damping: 20 }}>
                    
                    {/* FONDOS DE CAJA (Acordeón) */}
                    {layoutData.boxes.map(box => {
                        const isVisible = box.elementIndices.some(idx => elementStates[idx]?.visible);
                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={box.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ top: box.y, opacity: 1, height: box.height }}
                                transition={{ duration: 0.4, type: "spring", stiffness: 60, damping: 15 }}
                                className="absolute border border-indigo-200 bg-indigo-50/50 rounded-xl overflow-hidden shadow-sm z-0 flex flex-col"
                                style={{ left: box.x - box.width/2, width: box.width }}
                            >
                                <div 
                                    onClick={() => setCollapsedBoxes(p => ({ ...p, [box.id]: !p[box.id] }))}
                                    className="h-[45px] bg-indigo-100/70 cursor-pointer flex items-center justify-between px-4 hover:bg-indigo-200 transition-colors border-b border-indigo-200/50 shrink-0"
                                >
                                    <span className="text-sm font-bold text-indigo-700 tracking-wider">Desglose Auxiliar</span>
                                    <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 bg-white/50 px-2 py-1 rounded">
                                        {box.collapsed ? <><ChevronDown size={14}/> Mostrar</> : <><ChevronUp size={14}/> Ocultar</>}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* ELEMENTOS MATEMÁTICOS */}
                    {scene.cont.map((el, idx) => {
                        const state = elementStates[idx];
                        const processedEl = layoutData.elements[idx];
                        if (!state || !processedEl) return null;
                        
                        const stepIndex = elementToStepMap[idx] || 0;
                        const renderData = { ...el, y: processedEl.shiftedY };
                        // Si la caja está colapsada, se ocultan los elementos internos
                        const renderState = { ...state, visible: state.visible && !processedEl.isHiddenByBox };

                        if (el.type === 'Latex') return (
                            <ElementoLatex 
                                key={idx} data={renderData} state={renderState} stepIndex={stepIndex} currentStepIdx={currentStepIdx} onClick={handleJumpToStep} 
                            />
                        );
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
                <button onClick={() => { setIsPlaying(false); setCurrentStepIdx(-1); setMaxStepReached(-1); setPan({x:0, y:0}); setCollapsedBoxes({}); }} className="p-3 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-50 transition" title="Reiniciar"><RefreshCw size={20}/></button>
                <button onClick={togglePlay} className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                    {isPlaying ? <><Pause fill="white" size={20}/> Pausar</> : <><Play fill="white" size={20}/> {currentStepIdx === -1 ? 'Comenzar' : 'Continuar'}</>}
                </button>
                <button onClick={handleSkip} disabled={currentStepIdx >= scene.insts.length - 1} className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent" title="Siguiente Paso">
                    <SkipForward size={24}/>
                </button>
            </div>
        </div>
    );
};

export default WhiteboardPlayer;