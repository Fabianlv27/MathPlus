import React, { useState } from 'react';
import MathInput from './components/MathInput';
import SolutionPlayer from './components/SolutionPlayer';
import { useMathTutor } from './hooks/useMathTutor';
import { Upload, FileText } from 'lucide-react';

function App() {
  const [latexInput, setLatexInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState(null);
  
const MOCK_DATA = {
  "es_matematico": true,
  "explicacion_general": "Simplificación de la fracción dada",
  "pasos": [
    {
      "texto_voz": "Para simplificar la fracción dada, necesitamos encontrar y sacar el factor común tanto del numerador como del denominador.",
      "latex_visible": "\\frac{2x^3+4x^2}{x^2+4x+4}",
      "elementos_foco": ["numerador", "denominador"],
      "accion_dom": "aparecer"
    },
    {
      "texto_voz": "El numerador es $2x^3 + 4x^2$. Podemos factorizar $2x^2$ de ambos términos.",
      "latex_visible": "2x^3 + 4x^2 = 2x^2(x + 2)",
      "elementos_foco": ["2x^2"],
      "accion_dom": "aparecer"
    },
    {
      "texto_voz": "El denominador es $x^2 + 4x + 4$. Esto se puede factorizar como:",
      "latex_visible": "x^2 + 4x + 4 = (x + 2)(x + 2) = (x + 2)^2",
      "elementos_foco": ["(x + 2)"],
      "accion_dom": "aparecer"
    },
    {
      "texto_voz": "Ahora, reescribimos la fracción con los factores encontrados:",
      "latex_visible": "\\frac{2x^3 + 4x^2}{x^2 + 4x + 4} = \\frac{2x^2(x + 2)}{(x + 2)^2}",
      "elementos_foco": ["2x^2(x + 2)", "(x + 2)^2"],
      "accion_dom": "aparecer"
    },
    {
      "texto_voz": "Vemos que tanto el numerador como el denominador tienen el factor $(x + 2)$. Sin embargo, para cancelar factores comunes, debemos asegurarnos de que la cancelación sea válida.",
      "latex_visible": "\\frac{2x^2(x + 2)}{(x + 2)^2} = \\frac{2x^2}{x + 2}",
      "elementos_foco": ["(x + 2)"],
      "accion_dom": "desaparecer"
    }
  ]
};

  const { 
    solveProblem, 
    loading, 
    solution, 
    currentStep, 
    isPlaying, 
    togglePlay, 
    setCurrentStep 
  } = useMathTutor();

  const handleSubmit = () => {
    if (!latexInput && !file && !instructions) return;
    solveProblem(latexInput, instructions, file);
  
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-900">AI Math Tutor <span className="text-blue-500">.mvp</span></h1>
        <p className="text-slate-500">Tu profesor particular interactivo potenciado por Groq</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: INPUTS */}
        <div className="lg:col-span-4 space-y-6">
            
          {/* Tarjeta de Input */}
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                <FileText size={20}/> Entrada del Problema
            </h3>
            
            {/* Input GeoGebra Style */}
            <MathInput value={latexInput} onChange={setLatexInput} />
            
            {/* Instrucciones extra */}
            <div>
                <label className="text-sm text-gray-500 font-bold">Instrucciones extra:</label>
                <textarea 
                    className="w-full border rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej: Explícamelo como si tuviera 10 años..."
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                />
            </div>

            {/* Subida de Archivo */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center text-slate-500">
                    <Upload size={24} className="mb-2"/>
                    <span className="text-sm">{file ? file.name : "Sube una foto o PDF de tu tarea"}</span>
                </div>
            </div>

            <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
                {loading ? 'Analizando...' : 'Resolver Problema'}
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADO INTERACTIVO */}
        <div className="lg:col-span-8">
            {solution ? (
                <SolutionPlayer 
                    solution={solution}
                    currentStep={currentStep}
                    isPlaying={isPlaying}
                    togglePlay={togglePlay}
                    setStep={setCurrentStep}
                />
            ) : (
                <div className="h-full min-h-[400px] flex items-center justify-center bg-white/50 border-2 border-dashed border-slate-300 rounded-xl">
                    <p className="text-slate-400">La solución interactiva aparecerá aquí</p>
                </div>
            )}
        </div>

      </main>
    </div>
  );
}

export default App;