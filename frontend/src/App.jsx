// src/App.jsx
import React, { useState, useMemo } from 'react';
import MathInput from './components/MathInput';
import WhiteboardPlayer from './components/WhiteboardPlayer';
import { useMathTutor } from './hooks/useMathTutor';
import { Upload, FileText } from 'lucide-react';

// Utilidades del motor de renderizado
import { calculateFramePositions } from '../utils/layoutEngine';
import { fixLatexHighlighting, preventCollisions, calculateArrowPositions } from '../utils/latexFixer';
import SidebarRecursos from './components/SidebarComponent';

function App() {
  const [latexInput, setLatexInput] = useState('');
  const [instructions, setInstructions] = useState(''); // Opcional
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetStep, setTargetStep] = useState(null);

  // 1. Hook de conexión al backend (FastAPI)
  const { 
    solveProblem, 
    loading, 
    solution 
  } = useMathTutor();

  // 2. Procesamiento en cadena reactivo (Se ejecuta SOLO cuando llega la "solution" del backend)
  const perfectSolution = useMemo(() => {
      // Si la IA aún no ha respondido o no hay datos, no hacemos nada
      if (!solution || solution.length === 0) return null;
      
      console.log("Calculando solución geométrica y verificando colisiones..."); 
      console.log(solution)
      // Asumimos que solution es un array [ { ig: "...", cont: [...], insts: [...] } ]
      return solution.escenas.map(scene => {
          let processed = fixLatexHighlighting(scene);
          processed = preventCollisions(processed);
          processed = calculateArrowPositions(processed);
          return calculateFramePositions(processed);
      });
  }, [solution]); // <--- Dependencia CRÍTICA: se recalcula al llegar la solución

  // 3. Manejador del botón
  const handleSubmit = () => {
    // Si tienes un archivo, pásalo. Si no, pasa el latexInput. 
    // Asegúrate de que tu hook arme el FormData con 'query' como pide FastAPI.
    solveProblem(latexInput, instructions, file);
  };

  const handleResourceClick = (stepIndex) => {
      setTargetStep(stepIndex);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-900">
          MathPlus <span className="text-amber-500">Whiteboard</span>
        </h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
             <MathInput value={latexInput} onChange={setLatexInput} />
             
             {/* Desactivar botón mientras carga o si está vacío */}
             <button 
                onClick={handleSubmit}
                disabled={loading || (!latexInput && !file)}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
             >
                {loading ? 'Calculando y Animando...' : 'Explicar en Pizarra'}
             </button>
          </div>

          {/* Mostrar Sidebar SOLO si tenemos una solución procesada y tiene recursos */}
          {perfectSolution && perfectSolution[0]?.resources && (
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
                /* ESTADOS VACÍOS / LOADING */
                <div className="flex-grow flex items-center justify-center bg-white rounded-xl shadow-md border border-slate-200">
                    {loading ? (
                        <div className="text-center text-slate-500">
                            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <h3 className="text-lg font-bold text-slate-700">Resolviendo problema...</h3>
                            <p className="text-sm">Generando gráficos y explicaciones de IA</p>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400">
                            <FileText size={64} className="mx-auto mb-4 opacity-30" />
                            <h3 className="text-lg font-medium">Lienzo en blanco</h3>
                            <p>Escribe una ecuación a la izquierda para empezar.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* REPRODUCTOR LISTO */
                <WhiteboardPlayer 
                    scenes={perfectSolution}
                    onStepChange={setCurrentStep}
                    requestedStep={targetStep}
                />
            )}

        </div>

      </main>
    </div>
  );
}

export default App;