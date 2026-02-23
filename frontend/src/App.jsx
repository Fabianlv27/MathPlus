// src/App.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import MathInput from './components/MathInput';
import WhiteboardPlayer from './components/WhiteboardPlayer';
import { useMathTutor } from './hooks/useMathTutor';
import { FileText } from 'lucide-react';

// Utilidades del motor de renderizado
import { calculateFramePositions } from '../utils/layoutEngine';
import { fixLatexHighlighting, preventCollisions, calculateArrowPositions } from '../utils/latexFixer';
import SidebarRecursos from './components/SidebarComponent';

function App() {
  const [latexInput, setLatexInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetStep, setTargetStep] = useState(null);

  const playerContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const { solveProblem, loading, solution } = useMathTutor();

  const perfectSolution = useMemo(() => {
      if (!solution || solution.length === 0) return null;
      return solution.escenas.map(scene => {
          let processed = fixLatexHighlighting(scene);
          processed = preventCollisions(processed);
          processed = calculateArrowPositions(processed);
          return calculateFramePositions(processed);
      });
  }, [solution]);

  const handleSubmit = () => {
    solveProblem(latexInput, instructions, file);
  };

  const handleResourceClick = (stepIndex) => {
      setTargetStep(stepIndex);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-8 font-sans selection:bg-[#00ff66] selection:text-black">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          MathPlus <span className="text-[#00ff66] drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">Whiteboard</span>
        </h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          {/* TARJETA DE INPUT OSCURA */}
          <div className="bg-[#111] border border-neutral-800 p-6 rounded-xl shadow-2xl space-y-4">
             <MathInput value={latexInput} onChange={setLatexInput} />
             
             {/* BOTÓN NEÓN */}
             <button 
                onClick={handleSubmit}
                disabled={loading || (!latexInput && !file)}
                className="w-full bg-[#00ff66] text-black font-extrabold py-3 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none hover:bg-[#33ff88] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:scale-[1.02] active:scale-95"
             >
                {loading ? 'Calculando y Animando...' : 'Explicar en Pizarra'}
             </button>
          </div>

          {/* SIDEBAR */}
          {perfectSolution && perfectSolution[0]?.resources && !isFullscreen && (
             <SidebarRecursos 
               resources={perfectSolution[0].resources} 
               currentStepIdx={currentStep}    
               onResourceClick={handleResourceClick}
             />
          )}
        </div>

        {/* COLUMNA DERECHA: REPRODUCTOR O PANTALLA DE CARGA */}
        <div className="lg:col-span-8 h-[600px] flex flex-col">
            {!perfectSolution ? (
                /* ESTADOS VACÍOS / LOADING EN MODO OSCURO */
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
                            <p className="text-sm mt-1">Escribe una ecuación a la izquierda para empezar.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* CONTENEDOR FULLSCREEN */
                <div 
                    ref={playerContainerRef}
                    className={isFullscreen ? "fixed inset-0 z-[100] bg-[#0a0a0a] flex w-screen h-screen" : "h-full w-full relative"}
                >
                    {isFullscreen && (
                        <div className="w-[320px] shrink-0 h-full overflow-y-auto border-r border-neutral-800 bg-[#0f1115] p-6 hidden md:block custom-scrollbar">
                            <SidebarRecursos 
                                resources={perfectSolution[0].resources} 
                                currentStepIdx={currentStep}    
                                onResourceClick={handleResourceClick}
                            />
                        </div>
                    )}

                    <div className="flex-grow h-full w-full relative">
                        <WhiteboardPlayer 
                            scenes={perfectSolution}
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
    </div>
  )
}

export default App;