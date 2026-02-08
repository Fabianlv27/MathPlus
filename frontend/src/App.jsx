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
    "ig": "Sistema de Ecuaciones (Reducción)",
    "cont": [
      { "type": "Latex", "cont": "x + y = 10", "x": 340, "y": 100, "status": "hide" },
      { "type": "Latex", "cont": "x - y = 2", "x": 350, "y": 180, "status": "hide" },
      { "type": "Latex", "cont": "2x = 12", "x": 360, "y": 260, "status": "hide" },
      { "type": "Latex", "cont": "x = \\frac{12}{2}", "x": 360, "y": 340, "status": "hide" },
      { "type": "Latex", "cont": "x = 6", "x": 370, "y": 420, "status": "hide" },
      { "type": "Latex", "cont": "6 + y = 10", "x": 340, "y": 500, "status": "hide" },
      { "type": "Latex", "cont": "y = 10 - 6", "x": 340, "y": 580, "status": "hide" },
      { "type": "Latex", "cont": "y = 4", "x": 370, "y": 660, "status": "hide" },
      { "type": "Latex", "cont": "(x, y) = (6, 4)", "x": 300, "y": 740, "status": "hide" },
      { "type": "Marco", "x1": 280, "y1": 720, "x2": 590, "y2": 800, "status": "hide" }
    ],
    "insts": [
      {
        "msg": "Tenemos la primera ecuación: x más y es igual a 10.",
        "tgs": [
          { "tg": "0", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Y la segunda ecuación: x menos y es igual a 2.",
        "tgs": [
          { "tg": "1", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Usamos reducción. Sumamos las ecuaciones verticalmente. Las 'y' se cancelan (+y -y = 0).",
        "tgs": [
          { "tg": "0:(4-5)", "ac": "resalt", "color": "#EF4444" },
          { "tg": "1:(4-5)", "ac": "resalt", "color": "#EF4444" }
        ],
        "fin": []
      },
      {
        "msg": "Sumamos el resto: x+x es 2x, y 10+2 es 12. Obtenemos 2x = 12.",
        "tgs": [
          { "tg": "2", "ac": "appear" }
        ],
        "fin": [0, 1]
      },
      {
        "msg": "Despejamos x pasando el 2 a dividir.",
        "tgs": [
          { "tg": "2:(0-1)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "3", "ac": "appear" }
        ],
        "fin": [2]
      },
      {
        "msg": "Calculamos: 12 entre 2 es 6. Ya tenemos el valor de x.",
        "tgs": [
          { "tg": "4", "ac": "appear", "color": "#4ADE80" }
        ],
        "fin": [3]
      },
      {
        "msg": "Ahora sustituimos la x por 6 en la primera ecuación original.",
        "tgs": [
          { "tg": "5", "ac": "appear" },
          { "tg": "5:(0-1)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Despejamos la y. El 6 pasa restando al otro lado.",
        "tgs": [
          { "tg": "5:(0-1)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "6", "ac": "appear" }
        ],
        "fin": [5]
      },
      {
        "msg": "Restamos: 10 menos 6 es 4. Tenemos el valor de y.",
        "tgs": [
          { "tg": "7", "ac": "appear", "color": "#4ADE80" }
        ],
        "fin": [6]
      },
      {
        "msg": "El sistema está resuelto. La solución es el punto (6, 4).",
        "tgs": [
          { "tg": "8", "ac": "appear" },
          { "tg": "9", "ac": "appear", "color": "#4ADE80" }
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