// src/App.jsx
import React, { useState } from 'react';
import MathInput from './components/MathInput';
// import SolutionPlayer from './components/SolutionPlayer';  <-- COMENTA ESTE
import WhiteboardPlayer from './components/WhiteboardPlayer'; // <-- IMPORTA ESTE
import { useMathTutor } from './hooks/useMathTutor';
import { Upload, FileText } from 'lucide-react';

// ... (Aquí iría el const WHITEBOARD_MOCK_DATA que te di arriba) ...

function App() {
  const [latexInput, setLatexInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  
// src/App.jsx

const WHITEBOARD_MOCK_DATA = [
    {
        "ig": "primero debemos saber que es el metodo de factorizacion por termino medio",
        "cont": [
            // [0] Polinomio Objetivo (300 - 50 = 250)
            {"type": "Latex", "cont": "15x^2 + 26xy + 8y^2", "x": 250, "y": 100, "status": "show"},
            
            // [1] Factores
            {"type": "Latex", "cont": "(3x+4y)(5x+2y)", "x": 250, "y": 200, "status": "hide"},
            
            // [2] Resultados parciales (Desplazados -50 respecto al anterior)
            {"type": "Latex", "cont": "15x^2", "x": 130, "y": 300, "status": "hide"},
            {"type": "Latex", "cont": "+6xy", "x": 210, "y": 300, "status": "hide"},
            {"type": "Latex", "cont": "+20xy", "x": 290, "y": 300, "status": "hide"},
            {"type": "Latex", "cont": "+8y^2", "x": 370, "y": 300, "status": "hide"},
            
            // [3] Resultado Final Sumado
            {"type": "Latex", "cont": "= 15x^2 + 26xy + 8y^2", "x": 250, "y": 400, "status": "hide"}
        ],
        "insts": [
            { "msg": "nuestro objetivo sera pasar un polinomio de esta forma", "tgs": [] },
            { "msg": "a esta otra forma, para ello veremos como es que este valor se transforma al anterior", "tgs": [{"tg": "1:(0-f)", "ac": "appear"}] },
            { "msg": "primero debemos multiplicar este factor", "tgs": [{"tg": "1:(0-6)", "ac": "resalt", "color": "#FCD34D"}] },
            { "msg": "con este otro, aplicando la propiedad distributiva , que consiste en multiplicar cada termino de uno con el del otro", "tgs": [{"tg": "1:(7-f)", "ac": "resalt", "color": "#4ADE80"}] },
            { "msg": "asi pues 3x por 5x da 15x al cuadrado", "tgs": [{"tg": "1:(1-2)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "1:(8-9)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "2:(0-f)", "ac": "appear"}], "fin":[2,3] },
            { "msg": "3x por 2y es 6xy", "tgs": [{"tg": "1:(1-2)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "1:(11-12)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "3:(0-f)", "ac": "appear"}], "fin":[4] },
            { "msg": "4y por 5x es 20xy", "tgs": [{"tg": "1:(4-5)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "1:(8-9)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "4:(0-f)", "ac": "appear"}], "fin":[5] },
            { "msg": "4y por 2y es 8y al cuadrado", "tgs": [{"tg": "1:(4-5)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "1:(11-12)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "5:(0-f)", "ac": "appear"}], "fin":[6] },
            { "msg": "Ahora si sumamos todo eso nos da este resultado, el cual es el mismo que teniamos originalmente", "tgs": [{"tg": "3:(0-f)", "ac": "appear"},{"tg":"0:(0-f)","ac":"resalt","color":""}], "fin":[7] },
            { "msg": "Perfecto ahora sabemos que simplemente es buscar nuemeros que cumplan con este patron jugando un poco con los valores", "tgs": [] }
        ]
    },
    {
        "ig": "Ahora resolvamos nuestro problema",
        "cont": [
            // [0] Problema Desordenado (280 - 50 = 230)
            {"type": "Latex", "cont": "9y^2+\\frac{25}{4}x^2z^2+15xyz", "x": 230, "y": 100, "status": "show"},
            
            // [1] Problema Ordenado
            {"type": "Latex", "cont": "9y^2+15xyz+\\frac{25}{4}x^2z^2", "x": 230, "y": 170, "status": "hide"},

            // --- COLUMNA IZQUIERDA (180 - 50 = 130) ---
            // [2] 3y arriba
            {"type": "Latex", "cont": "3y", "x": 230, "y": 250, "status": "hide"},
            // [3] 3y abajo
            {"type": "Latex", "cont": "3y", "x": 230, "y": 330, "status": "hide"},

            // --- COLUMNA DERECHA (380 - 50 = 330) ---
            // [4] 5/2xz arriba
            {"type": "Latex", "cont": "\\frac{5}{2}xz", "x": 430, "y": 250, "status": "hide"},
            // [5] 5/2xz abajo
            {"type": "Latex", "cont": "\\frac{5}{2}xz", "x": 430, "y": 330, "status": "hide"},

            // --- FLECHAS CRUZADAS (x: 230->180, toX: 380->330) ---
            // [6] Flecha: Izq Arriba -> Der Abajo
            {"type": "Flecha", "x": 280, "y": 280, "toX": 430, "toY": 360, "status": "hide"},
            // [7] Flecha: Izq Abajo -> Der Arriba
            {"type": "Flecha", "x": 280, "y": 350, "toX": 430, "toY": 280, "status": "hide"},

            // --- RESULTADOS MULTIPLICACIÓN (480 - 50 = 430) ---
            // [8] Resultado arriba
            {"type": "Latex", "cont": "\\frac{15}{2}xyz", "x": 530, "y": 270, "status": "hide"},
            // [9] Resultado abajo
            {"type": "Latex", "cont": "\\frac{15}{2}xyz", "x": 530, "y": 310, "status": "hide"},
            
            // [10] Suma central comprobación (557 - 50 = 507)
            {"type": "Latex", "cont": "= 15xyz", "x": 607, "y": 290, "status": "hide"},

            // [11] Marco para agrupar Fila 1 (x1: 170->120, x2: 440->390)
            {"type": "Marco", "x1": 220, "x2": 490, "y1": 250, "y2": 300, "status": "hide"}, 
            // [12] Marco para agrupar Fila 2
            {"type": "Marco", "x1": 220, "x2": 490, "y1": 330, "y2": 380, "status": "hide"},
            
            // [13] Copia de factores (100 - 50 = 50)
             {"type": "Latex", "cont": "(3y+\\frac{5}{2}xz)(3y+\\frac{5}{2}xz)", "x": 150, "y": 410, "status": "hide"},
            // [14] Resultado Final (380 - 50 = 330)
            {"type": "Latex", "cont": "=(3y+\\frac{5}{2}xz)^2", "x": 430, "y": 410, "status": "hide"}
        ],
        "insts": [
            { "msg": "Si lo comparamos con el modelo anterior notaremos que no esta en orden...", "tgs": [{"tg": "0:(5-f)", "ac": "resalt", "color": "#EF4444"}] },

            { "msg": "esta es la forma correcta por la que debemos empezar", "tgs": [{"tg": "1:(0-f)", "ac": "appear"}] },

            { "msg": "descomponemos el primer termino de la forma 3y por 3y", "tgs": [{"tg": "1:(0-3)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "2:(0-f)", "ac": "appear"}, {"tg": "3:(0-f)", "ac": "appear"}] },

            { "msg": "descomponemos el segundo termino de la forma 5 medios xz por 5 medios xz...", "tgs": [{"tg": "1:(11-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "4:(0-f)", "ac": "appear"}, {"tg": "5:(0-f)", "ac": "appear"}], "fin":[2] },

            { "msg": "ahora si multiplicamos estos dos extremos nos da 15 medios xyz", "tgs": [{"tg": "2:(0-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "5:(0-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "6:(0-f)", "ac": "appear"}, {"tg": "8:(0-f)", "ac": "appear"}], "fin":[3] },

            { "msg": "y multiplicando estos dos tambien nos da 15 medios xyz", "tgs": [{"tg": "3:(0-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "4:(0-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "7:(0-f)", "ac": "appear"}, {"tg": "9:(0-f)", "ac": "appear"}],"fin":[4] },
            { "msg": "ahora si sumamos ambos productos vemos que efectivamente nos da el termino del medio", "tgs": [{"tg": "10:(0-f)", "ac": "appear"}, {"tg": "1:(5-10)", "ac": "resalt", "color": "#4ADE80"}], "fin":[5] },
            { "msg": "Bien ahora agrupamos los que seran nuestros factores , agarrando los extremos", "tgs": [{"tg": "11:(0-f)", "ac": "appear"}, {"tg": "12:(0-f)", "ac": "appear"}, {"tg": "13:(0-f)", "ac": "appear"}], "fin":[6] }, 
            { "msg": "nos damos cuenta que se trata de un binomio al cuadrado...", "tgs": [{"tg": "14:(0-f)", "ac": "appear", "color": "#4ADE80"}] }
        ]
    }
];
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
                scenes={solution || WHITEBOARD_MOCK_DATA} 
            />

        </div>

      </main>
    </div>
  );
}

export default App;