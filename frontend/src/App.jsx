// src/App.jsx
import React, { useState } from 'react';
import MathInput from './components/MathInput';
// import SolutionPlayer from './components/SolutionPlayer';  <-- COMENTA ESTE
import WhiteboardPlayer from './components/WhiteboardPlayer'; // <-- IMPORTA ESTE
import { useMathTutor } from './hooks/useMathTutor';
import { Upload, FileText } from 'lucide-react';
import {calculateFramePositions} from '../utils/layoutEngine'
import { fixLatexHighlighting } from '../utils/latexFixer';
import SidebarRecursos from './components/SidebarComponent'
// ... (Aquí iría el const WHITEBOARD_MOCK_DATA que te di arriba) ...

function App() {
  const [latexInput, setLatexInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
// src/App.jsx

const WHITEBOARD_MOCK_DATA =[
  {
    "ig": "Simplificación Logarítmica",
    "cont": [
      { "type": "Latex", "cont": "\\frac{\\log_4 25}{2} - \\frac{1}{2} - \\log_4 40", "x": 400, "y": 100, "status": "hide" },
      { "type": "Latex", "cont": "\\log_4 5 - \\frac{1}{2} - \\log_4 40", "x": 400, "y": 180, "status": "hide" },
      { "type": "Latex", "cont": "\\log_4 5 - \\log_4 40 - \\frac{1}{2}", "x": 400, "y": 260, "status": "hide" },
      { "type": "Latex", "cont": "\\log_4(\\frac{5}{40}) - \\frac{1}{2}", "x": 400, "y": 340, "status": "hide" },
      { "type": "Latex", "cont": "\\log_4(\\frac{1}{8}) - \\frac{1}{2}", "x": 400, "y": 420, "status": "hide" },
      { "type": "Latex", "cont": "-\\frac{3}{2} - \\frac{1}{2}", "x": 400, "y": 500, "status": "hide" },
      { "type": "Latex", "cont": "-2", "x": 400, "y": 580, "status": "hide" }
    ],
    "resources": [
      { 
        "step": 1, 
        "title": "Propiedad de la Potencia", 
        "tex": "n \\cdot \\log_b(x) = \\log_b(x^n)" 
      },
      { 
        "step": 3, 
        "title": "Propiedad del Cociente", 
        "tex": "\\log_b(x) - \\log_b(y) = \\log_b(\\frac{x}{y})" 
      },
      { 
        "step": 5, 
        "title": "Definición de Logaritmo", 
        "tex": "\\log_b(y) = x \\iff b^x = y" 
      }
    ],
    "insts": [
      {
        "msg": "Comenzamos con la expresión original.",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Aplicamos la regla de la potencia: dividir por 2 es raíz cuadrada (√25 = 5).",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "dim" },
          { "tg": "0:(0-18)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "1:(0-f)", "ac": "appear" },
          { "tg": "1:(0-7)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Reordenamos los términos para agrupar los logaritmos.",
        "tgs": [
          { "tg": "1:(0-f)", "ac": "dim" },
          { "tg": "2:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Restar logaritmos de la misma base equivale al logaritmo del cociente.",
        "tgs": [
          { "tg": "2:(0-f)", "ac": "dim" },
          { "tg": "2:(0-6)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "2:(10-18)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "3:(0-f)", "ac": "appear" },
          { "tg": "3:(0-16)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Simplificamos la fracción dentro del logaritmo: 5/40 = 1/8.",
        "tgs": [
          { "tg": "3:(0-f)", "ac": "dim" },
          { "tg": "4:(0-f)", "ac": "appear" },
          { "tg": "4:(6-11)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Evaluamos: 4 elevado a qué potencia da 1/8? (-3/2).",
        "tgs": [
          { "tg": "4:(0-f)", "ac": "dim" },
          { "tg": "4:(0-12)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "5:(0-f)", "ac": "appear" },
          { "tg": "5:(0-10)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Sumamos las fracciones negativas: -1.5 - 0.5 = -2.",
        "tgs": [
          { "tg": "5:(0-f)", "ac": "dim" },
          { "tg": "6:(0-f)", "ac": "appear" },
          { "tg": "6:(0-f)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      }
    ]
  }
]
        // 2. PROCESAMIENTO EN CADENA
        const perfectSolution = WHITEBOARD_MOCK_DATA.map(scene => {
            
            // Paso A: Arreglar los resaltados de fracciones rotas
            // (Esto modifica scene.insts)
            const sceneWithFixedHighlights = fixLatexHighlighting(scene);

            // Paso B: Calcular las dimensiones matemáticas de los marcos
            // (Esto modifica scene.cont usando tus fórmulas x1, x2, y1, y2)
            const sceneWithCalculatedFrames = calculateFramePositions(sceneWithFixedHighlights);

            return sceneWithCalculatedFrames;
        });

  // Usamos el hook para la lógica de API (opcional por ahora si usas Mock)
  const { 
    solveProblem, 
    loading, 
    solution 
  } = useMathTutor();

  const handleSubmit = () => {
    // Si quieres probar el backend real, descomenta esto:
    // solveProblem(latexInput, instructions, file);
    
    // Por ahora, solo simulación visual:
    console.log("Simulando resolución...");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-900">MathPlus <span className="text-amber-500">Whiteboard</span></h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
             {/* ... (Tus inputs de siempre van aquí) ... */}
             <MathInput value={latexInput} onChange={setLatexInput} />
             <button 
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg"
             >
                {loading ? 'Pensando...' : 'Explicar en Pizarra'}
             </button>
          </div>

             <SidebarRecursos 
                resources={perfectSolution[0].resources} // Pasamos los recursos de la escena
                currentStep={currentStep}         // Pasamos el paso actual para iluminar
             />
       
        </div>

        {/* COLUMNA DERECHA: NUEVO REPRODUCTOR */}
        <div className="lg:col-span-8 h-[600px]"> {/* Dale altura explícita */}
            
            {/* Aquí renderizamos el nuevo componente */}
            {/* Si tienes datos del backend úsalos, si no, usa el Mock */}
            
            <WhiteboardPlayer 
                scenes={solution || perfectSolution}
                onStepChange={(step) => setCurrentStep(step)} 
            />

        </div>

      </main>
    </div>
  );
}

export default App;