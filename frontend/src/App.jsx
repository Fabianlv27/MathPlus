// src/App.jsx
import React, { useState } from 'react';
import MathInput from './components/MathInput';
// import SolutionPlayer from './components/SolutionPlayer';  <-- COMENTA ESTE
import WhiteboardPlayer from './components/WhiteboardPlayer'; // <-- IMPORTA ESTE
import { useMathTutor } from './hooks/useMathTutor';
import { Upload, FileText } from 'lucide-react';
import {calculateFramePositions} from '../utils/layoutEngine'
import { fixLatexHighlighting } from '../utils/latexFixer';
// ... (Aquí iría el const WHITEBOARD_MOCK_DATA que te di arriba) ...

function App() {
  const [latexInput, setLatexInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  
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
    "insts": [
      {
        "msg": "Tenemos una expresión con logaritmos en base 4. Vamos a simplificar.",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Propiedad de potencia: Dividir por 2 es como elevar a 1/2 (Raíz cuadrada). √25 = 5.",
        "tgs": [
          { "tg": "0:(0-13)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "0:(0-f)", "ac": "dim" },
          { "tg": "1:(0-f)", "ac": "appear" },
          { "tg": "1:(0-6)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Reordenamos: Agrupamos los logaritmos para operarlos juntos.",
        "tgs": [
          { "tg": "1:(0-f)", "ac": "dim" },
          { "tg": "2:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Propiedad del cociente: Resta de logaritmos = Logaritmo de la división.",
        "tgs": [
          { "tg": "2:(0-6)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "2:(10-18)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "2:(0-f)", "ac": "dim" },
          { "tg": "3:(0-f)", "ac": "appear" },
          { "tg": "3:(6-11)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Simplificamos la fracción: 5/40 es igual a 1/8.",
        "tgs": [
          { "tg": "3:(0-f)", "ac": "dim" },
          { "tg": "4:(0-f)", "ac": "appear" },
          { "tg": "4:(6-10)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Evaluamos: 4^x = 1/8. Como 4=2² y 8=2³, el resultado es -3/2.",
        "tgs": [
          { "tg": "4:(0-11)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "4:(0-f)", "ac": "dim" },
          { "tg": "5:(0-f)", "ac": "appear" },
          { "tg": "5:(0-4)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Suma de fracciones negativas: -3/2 - 1/2 = -4/2, que es -2.",
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
        </div>

        {/* COLUMNA DERECHA: NUEVO REPRODUCTOR */}
        <div className="lg:col-span-8 h-[600px]"> {/* Dale altura explícita */}
            
            {/* Aquí renderizamos el nuevo componente */}
            {/* Si tienes datos del backend úsalos, si no, usa el Mock */}
            
            <WhiteboardPlayer 
                scenes={solution || perfectSolution} 
            />

        </div>

      </main>
    </div>
  );
}

export default App;