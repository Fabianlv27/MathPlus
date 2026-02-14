// src/App.jsx
import React, { useState,useMemo } from 'react';
import MathInput from './components/MathInput';
// import SolutionPlayer from './components/SolutionPlayer';  <-- COMENTA ESTE
import WhiteboardPlayer from './components/WhiteboardPlayer'; // <-- IMPORTA ESTE
import { useMathTutor } from './hooks/useMathTutor';
import { Upload, FileText } from 'lucide-react';
import {calculateFramePositions} from '../utils/layoutEngine'
import { fixLatexHighlighting,preventCollisions } from '../utils/latexFixer';
import SidebarRecursos from './components/SidebarComponent'
// ... (Aquí iría el const WHITEBOARD_MOCK_DATA que te di arriba) ...

function App() {
  const [latexInput, setLatexInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  // Estado para decirle al reproductor a dónde ir (Output App -> Player)
  const [targetStep, setTargetStep] = useState(null);
// src/App.jsx

const WHITEBOARD_MOCK_DATA =[
  {
    "ig": "Ecuación con Radicales: \\sqrt{2x + 7} - x = 2",
    "cont": [
      { "type": "Latex", "cont": "\\sqrt{2x + 7} - x = 2", "x": 350, "y": 100, "status": "show" },
      { "type": "Latex", "cont": "\\sqrt{2x + 7} = x + 2", "x": 350, "y": 200, "status": "hide" },
      { "type": "Latex", "cont": "2x + 7 = (x + 2)^2", "x": 350, "y": 300, "status": "hide" },
      
      { "type": "Flecha", "x": 550, "y": 300, "toX": 700, "toY": 300, "status": "hide" },
      { "type": "Latex", "cont": "(x+2)^2 = x^2 + 4x + 4", "x": 750, "y": 300, "status": "hide" },
      { "type": "Flecha", "x": 700, "y": 300, "toX": 550, "toY": 380, "status": "hide" },
      
      { "type": "Latex", "cont": "2x + 7 = x^2 + 4x + 4", "x": 350, "y": 380, "status": "hide" },
      { "type": "Latex", "cont": "x^2 + 2x - 3 = 0", "x": 350, "y": 460, "status": "hide" },
      
      { "type": "Flecha", "x": 550, "y": 460, "toX": 700, "toY": 460, "status": "hide" },
      { "type": "Latex", "cont": "3 \\cdot (-1) = -3 \\text{ y } 3 + (-1) = 2", "x": 750, "y": 460, "status": "hide" },
      { "type": "Flecha", "x": 700, "y": 460, "toX": 550, "toY": 540, "status": "hide" },
      
      { "type": "Latex", "cont": "(x+3)(x-1) = 0", "x": 350, "y": 540, "status": "hide" },
      { "type": "Latex", "cont": "x = -3 \\quad \\lor \\quad x = 1", "x": 350, "y": 620, "status": "hide" },
      
      { "type": "Flecha", "x": 600, "y": 620, "toX": 720, "toY": 620, "status": "hide" },
      { "type": "Latex", "cont": "x=-3 \\Rightarrow \\sqrt{1} - (-3) = 4 \\neq 2", "x": 780, "y": 620, "status": "hide" },
      { "type": "Flecha", "x": 720, "y": 620, "toX": 550, "toY": 720, "status": "hide" },
      
      { "type": "Latex", "cont": "x = 1", "x": 350, "y": 720, "status": "hide" }
    ],
    "resources": [
      { "step": 2, "title": "Potencia de una Raíz", "tex": "(\\sqrt{a})^2 = a" },
      { "step": 3, "title": "Binomio al Cuadrado", "tex": "(a+b)^2 = a^2 + 2ab + b^2" },
      { "step": 9, "title": "Soluciones Extrañas", "tex": "\\text{Al elevar al cuadrado, verificar raíces.}" }
    ],
    "insts": [
      {
        "msg": "Iniciamos con nuestra ecuación con radical. El primer paso siempre es aislar la raíz.",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Sumamos 'x' a ambos lados para dejar la raíz cuadrada completamente sola a la izquierda.",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "dim" },
          { "tg": "1:(0-f)", "ac": "appear" },
          { "tg": "1:(0-f)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Elevamos ambos lados de la ecuación al cuadrado para eliminar la raíz cuadrada.",
        "tgs": [
          { "tg": "1:(0-f)", "ac": "dim" },
          { "tg": "2:(0-f)", "ac": "appear" },
          { "tg": "2:(0-f)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Desarrollamos el binomio al cuadrado en nuestra pizarra auxiliar.",
        "tgs": [
          { "tg": "2:(0-f)", "ac": "dim" },
          { "tg": "3:(0-f)", "ac": "appear" },
          { "tg": "4:(0-f)", "ac": "appear" },
          { "tg": "4:(0-f)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Sustituimos el trinomio resultante de vuelta en nuestra ecuación principal.",
        "tgs": [
          { "tg": "4:(0-f)", "ac": "dim" },
          { "tg": "5:(0-f)", "ac": "appear" },
          { "tg": "6:(0-f)", "ac": "appear" },
          { "tg": "6:(0-f)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": [3]
      },
      {
        "msg": "Agrupamos todos los términos a un solo lado para formar una ecuación cuadrática igualada a cero.",
        "tgs": [
          { "tg": "6:(0-f)", "ac": "dim" },
          { "tg": "7:(0-f)", "ac": "appear" },
          { "tg": "7:(0-f)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": [5]
      },
      {
        "msg": "Buscamos dos números que multiplicados den -3 y sumados den +2 para factorizar.",
        "tgs": [
          { "tg": "7:(0-f)", "ac": "dim" },
          { "tg": "8:(0-f)", "ac": "appear" },
          { "tg": "9:(0-f)", "ac": "appear" },
          { "tg": "9:(0-f)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Escribimos la ecuación factorizada usando los números que encontramos (3 y -1).",
        "tgs": [
          { "tg": "9:(0-f)", "ac": "dim" },
          { "tg": "10:(0-f)", "ac": "appear" },
          { "tg": "11:(0-f)", "ac": "appear" },
          { "tg": "11:(0-f)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": [8]
      },
      {
        "msg": "Igualando cada factor a cero obtenemos dos posibles soluciones.",
        "tgs": [
          { "tg": "11:(0-f)", "ac": "dim" },
          { "tg": "12:(0-f)", "ac": "appear" },
          { "tg": "12:(0-f)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": [10]
      },
      {
        "msg": "¡Cuidado! Al elevar al cuadrado pudimos generar soluciones extrañas. Verificamos x = -3 y vemos que no cumple la igualdad original.",
        "tgs": [
          { "tg": "12:(0-f)", "ac": "dim" },
          { "tg": "13:(0-f)", "ac": "appear" },
          { "tg": "14:(0-f)", "ac": "appear" },
          { "tg": "14:(0-f)", "ac": "resalt", "color": "#EF4444" }
        ],
        "fin": []
      },
      {
        "msg": "Descartamos la solución extraña. Nuestra única solución real y válida es x = 1.",
        "tgs": [
          { "tg": "14:(0-f)", "ac": "dim" },
          { "tg": "15:(0-f)", "ac": "appear" },
          { "tg": "16:(0-f)", "ac": "appear" },
          { "tg": "16:(0-f)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": [13]
      }
    ]
  }
]
const perfectSolution = useMemo(() => {
      console.log("Calculando solución perfecta y verificando colisiones..."); 
      
      return WHITEBOARD_MOCK_DATA.map(scene => {
          // Paso 1: Arregla los problemas del Latex (Rangos de colores)
          const fixedColors = fixLatexHighlighting(scene);
          
          // Paso 2: VERIFICACIÓN GEOMÉTRICA (La que acabamos de crear)
          const spacedOut = preventCollisions(fixedColors);
          
          // Paso 3: Calcular coordenadas de Marcos y Flechas usando las posiciones ya corregidas
          return calculateFramePositions(spacedOut);
      });
  }, []);
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

  const handleResourceClick = (stepIndex) => {
      setTargetStep(stepIndex); // Actualizamos el objetivo, el Player lo detectará
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
               currentStepIdx={currentStep}    
               onResourceClick={handleResourceClick}    // Pasamos el paso actual para iluminar
             />
       
        </div>

        {/* COLUMNA DERECHA: NUEVO REPRODUCTOR */}
        <div className="lg:col-span-8 h-[600px]"> {/* Dale altura explícita */}
            
            {/* Aquí renderizamos el nuevo componente */}
            {/* Si tienes datos del backend úsalos, si no, usa el Mock */}
            
            <WhiteboardPlayer 
                scenes={ perfectSolution}
                onStepChange={setCurrentStep}
                requestedStep={targetStep}
            />

        </div>

      </main>
    </div>
  );
}

export default App;