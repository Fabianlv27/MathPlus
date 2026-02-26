// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import MathInput from './components/MathInput';
import WhiteboardPlayer from './components/WhiteboardPlayer';
import SidebarRecursos from './components/SidebarComponent';
import SceneVisualEditor from './components/SceneVisualEditor';
import { useMathTutor } from './hooks/useMathTutor';
import { FileText, Edit3, ClipboardPaste } from 'lucide-react'; // <-- Importamos ClipboardPaste
import { parseTextToJSON}from '../utils/textParser';
// Utilidades del motor de renderizado
import { calculateFramePositions } from '../utils/layoutEngine';
import { fixLatexHighlighting, preventCollisions, calculateArrowPositions } from '../utils/latexFixer';

function App() {
  // --- ESTADOS PRINCIPALES ---
  const [latexInput, setLatexInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetStep, setTargetStep] = useState(null);

  // --- ESTADOS DE PANTALLA COMPLETA ---
  const playerContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- ESTADOS DEL EDITOR VISUAL ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editableSolution, setEditableSolution] = useState(null);

  // Hook del backend
  const { solveProblem, loading, solution } = useMathTutor();

  // --- EFECTO: PANTALLA COMPLETA ---
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        if (playerContainerRef.current) playerContainerRef.current.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
  };

  // --- EFECTO: PROCESAR SOLUCIÓN DEL BACKEND ---
  useEffect(() => {
    if (!solution || solution.length === 0) {
      setEditableSolution(null);
      return;
    }
    
    const processed = solution.escenas.map(scene => {
        let p = fixLatexHighlighting(scene);
        p = preventCollisions(p);
        p = calculateArrowPositions(p);
        return calculateFramePositions(p);
    });
    
    setEditableSolution(processed);
  }, [solution]);

  // --- MANEJADORES ---
  const handleSubmit = () => {
    solveProblem(latexInput, instructions, file);
  };

  const handleResourceClick = (stepIndex) => {
      setTargetStep(stepIndex);
  };

  const handleSaveEdits = (editedScene) => {
      const newSolution = [...editableSolution];
      newSolution[0] = calculateFramePositions(editedScene); 
      setEditableSolution(newSolution);
      setIsEditorOpen(false);
      setCurrentStep(0);
  };

  // --- NUEVO: IMPORTAR JSON DESDE EL PORTAPAPELES ---
  const handleImportJSON = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = JSON.parse(clipboardText);

      let sceneToProcess = null;

      // Detectamos si el JSON pegado es un objeto de backend completo o una sola escena copiada del editor
      if (parsedData.escenas && Array.isArray(parsedData.escenas)) {
        sceneToProcess = parsedData.escenas[0];
      } else if (Array.isArray(parsedData.cont) && Array.isArray(parsedData.insts)) {
        sceneToProcess = parsedData;
      } else {
        throw new Error("El JSON no tiene el formato de MathPlus (faltan 'cont' e 'insts').");
      }

      // Procesamos las coordenadas y layouts tal como lo haríamos si viniera del backend
      let p = fixLatexHighlighting(sceneToProcess);
      p = preventCollisions(p);
      p = calculateArrowPositions(p);
      p = calculateFramePositions(p);

      // Lo inyectamos directamente en el estado de la pizarra
      setEditableSolution([p]);
      setCurrentStep(0);
      setTargetStep(null);
      
    } catch (err) {
      alert("⚠️ Error al importar JSON:\n\n" + err.message + "\n\nAsegúrate de tener un JSON válido copiado en el portapapeles.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-8 font-sans selection:bg-[#00ff66] selection:text-black relative">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          MathPlus <span className="text-[#00ff66] drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">Whiteboard</span>
        </h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* =========================================
            COLUMNA IZQUIERDA: INPUTS Y SIDEBAR 
            ========================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111] border border-neutral-800 p-6 rounded-xl shadow-2xl space-y-4">
             <MathInput value={latexInput} onChange={setLatexInput} />
             
             {/* BOTÓN PRINCIPAL (LLAMADA AL BACKEND) */}
             <button 
                onClick={handleSubmit}
                disabled={loading || (!latexInput && !file)}
                className="w-full bg-[#00ff66] text-black font-extrabold py-3 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none hover:bg-[#33ff88] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:scale-[1.02] active:scale-95"
             >
                {loading ? 'Calculando y Animando...' : 'Explicar en Pizarra'}
             </button>

             {/* NUEVO BOTÓN: IMPORTAR JSON (BYPASS) */}
             <button 
                onClick={handleImportJSON}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-dashed border-neutral-700 text-neutral-400 font-bold py-3 rounded-lg transition-all hover:border-[#00ff66] hover:text-[#00ff66] disabled:opacity-30 disabled:cursor-not-allowed"
             >
                <ClipboardPaste size={18} /> Importar JSON Directo
             </button>
          </div>

          {/* SIDEBAR DE RECURSOS */}
          {editableSolution && editableSolution[0]?.resources && !isFullscreen && (
             <SidebarRecursos 
               resources={editableSolution[0].resources} 
               currentStepIdx={currentStep}    
               onResourceClick={handleResourceClick}
             />
          )}
        </div>

        {/* =========================================
            COLUMNA DERECHA: PIZARRA / LOADER 
            ========================================= */}
        <div className="lg:col-span-8 h-[600px] flex flex-col relative">
            
            {/* BOTÓN MODO DESARROLLADOR (Editar JSON) */}
            {editableSolution && !isFullscreen && (
                <div className="absolute -top-12 right-0 z-10">
                    <button 
                        onClick={() => setIsEditorOpen(true)}
                        className="flex items-center gap-2 bg-[#111] hover:bg-neutral-800 text-neutral-300 hover:text-[#00ff66] border border-neutral-800 hover:border-[#00ff66]/50 px-4 py-2 rounded-lg text-sm font-bold transition shadow-md"
                    >
                        <Edit3 size={16} /> Editar JSON
                    </button>
                </div>
            )}

            {!editableSolution ? (
                /* ESTADO: CARGANDO O VACÍO */
                <div className="flex-grow flex items-center justify-center bg-[#111] rounded-xl shadow-2xl border border-neutral-800">
                    {loading ? (
                        <div className="text-center text-neutral-400">
                            <div className="animate-spin w-12 h-12 border-4 border-[#00ff66] border-t-transparent rounded-full mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
                            <h3 className="text-lg font-bold text-white tracking-wide">Resolviendo problema...</h3>
                            <p className="text-sm mt-2 text-neutral-500">Generando gráficos y explicaciones de IA</p>
                        </div>
                    ) : (
                        <div className="text-center text-neutral-600">
                            <FileText size={64} className="mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-neutral-400">Lienzo en blanco</h3>
                            <p className="text-sm mt-1">Escribe una ecuación y presiona "Explicar", o importa un JSON.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* ESTADO: REPRODUCTOR LISTO (CON FULLSCREEN WRAPPER) */
                <div 
                    ref={playerContainerRef}
                    className={isFullscreen ? "fixed inset-0 z-[100] bg-[#0a0a0a] flex w-screen h-screen" : "h-full w-full relative flex flex-col"}
                >
                    {/* Sidebar inyectado a la izquierda si estamos en Fullscreen */}
                    {isFullscreen && (
                        <div className="w-[320px] shrink-0 h-full overflow-y-auto border-r border-neutral-800 bg-[#0f1115] p-6 hidden md:block custom-scrollbar">
                            <SidebarRecursos 
                                resources={editableSolution[0].resources} 
                                currentStepIdx={currentStep}    
                                onResourceClick={handleResourceClick}
                            />
                        </div>
                    )}

                    <div className="flex-grow h-full w-full relative">
                        <WhiteboardPlayer 
                            scenes={editableSolution}
                            onStepChange={setCurrentStep}
                            requestedStep={targetStep}
                            onToggleFullscreen={toggleFullscreen}
                            isFullscreen={isFullscreen}
                        />
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* =========================================
          MODAL: EDITOR VISUAL DEL JSON
          ========================================= */}
      {isEditorOpen && editableSolution && (
          <SceneVisualEditor 
              sceneData={editableSolution[0]} 
              onSave={handleSaveEdits} 
              onCancel={() => setIsEditorOpen(false)} 
          />
      )}
      
    </div>
  );
}

export default App;