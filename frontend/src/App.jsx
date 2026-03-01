// src/App.jsx
import React, { useState, useRef, useEffect } from "react";
import { FileText, Edit3, ClipboardPaste, ScanSearch, Upload, X } from "lucide-react"; // <--- ICONOS AGREGADOS

// --- COMPONENTES ---
import MathInput from "./components/MathInput";
import MathBrowser from "./components/MathBrowser";
import SidebarRecursos from "./components/SidebarComponent";
import SceneVisualEditor from "./components/SceneVisualEditor";
import ProblemSelectorModal from "./components/ProblemSelectorModal";

// --- HOOKS Y UTILIDADES ---
import { useMathTutor } from "./hooks/useMathTutor";
import { parseTextToJSON } from "../utils/textParser";
import { calculateFramePositions } from "../utils/layoutEngine";
import {
  fixLatexHighlighting,
  preventCollisions,
  calculateArrowPositions,
} from "../utils/latexFixer";

function App() {
  // --- ESTADOS PRINCIPALES ---
  const [latexInput, setLatexInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState(null);

  // --- ESTADOS DE SELECCIÓN DE PROBLEMAS (MODAL) ---
  const [detectedProblems, setDetectedProblems] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // --- ESTADOS DE NAVEGACIÓN ---
  const [currentStep, setCurrentStep] = useState(0);
  const [targetStep, setTargetStep] = useState(null);

  // --- ESTADOS DE PANTALLA COMPLETA ---
  const playerContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- REFERENCIA AL INPUT DE ARCHIVO ---
  const fileInputRef = useRef(null); // <--- REF PARA EL INPUT OCULTO

  // --- ESTADOS DEL EDITOR VISUAL ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editableSolution, setEditableSolution] = useState(null);

  // Hook del backend
  const { solveProblem, loading, solution } = useMathTutor();

  // --- EFECTO: PANTALLA COMPLETA ---
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current) playerContainerRef.current.requestFullscreen().catch((err) => console.log(err));
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
    // Procesamos layout y física
    const processed = solution.escenas.map((scene) => {
      let p = fixLatexHighlighting(scene);
      p = preventCollisions(p);
      p = calculateArrowPositions(p);
      return calculateFramePositions(p);
    });
    setEditableSolution(processed);
  }, [solution]);

  // --- MANEJADORES DE LÓGICA ---
  
  const resetNavigation = () => {
      setTargetStep(null);
      setCurrentStep(0);
  };

  // MANEJO DE ARCHIVOS (NUEVO)
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleScanAndSolve = async () => {
    // 1. Si es solo texto, resolvemos directo
    if (!file && latexInput) {
        solveProblem(latexInput, instructions, null);
        resetNavigation();
        return;
    }

    // 2. Si hay archivo, ESCANEAMOS primero
    if (file) {
        setIsScanning(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            // Ajusta la URL a tu backend si es necesario
            const response = await fetch("http://localhost:8000/api/v1/scan_problems", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Error al escanear el archivo");

            const data = await response.json();
            
            if (data.problems && data.problems.length > 1) {
                // Múltiples problemas -> Abrir Modal
                setDetectedProblems(data.problems);
                setShowSelector(true);
            } else if (data.problems && data.problems.length === 1) {
                // Un solo problema -> Resolver directo
                solveProblem(data.problems[0], instructions, null);
                resetNavigation();
            } else {
                // Fallback -> Enviar archivo crudo
                solveProblem(null, instructions, file);
                resetNavigation();
            }
        } catch (error) {
            console.error(error);
            alert("Error al leer el archivo. Intenta de nuevo.");
        } finally {
            setIsScanning(false);
        }
    }
  };

  const handleSelectProblem = (problemText) => {
      setShowSelector(false);
      solveProblem(problemText, instructions, null); 
      resetNavigation();
  };

  const handleResourceClick = (stepIndex) => setTargetStep(stepIndex);

  const handleSaveEdits = (editedScene) => {
    const newSolution = [...editableSolution];
    newSolution[0] = calculateFramePositions(editedScene);
    setEditableSolution(newSolution);
    setIsEditorOpen(false);
    setCurrentStep(0);
  };

  const handleImportJSON = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = JSON.parse(clipboardText);
      let sceneToProcess = parsedData.escenas ? parsedData.escenas[0] : parsedData;

      if (!sceneToProcess.cont) throw new Error("Formato inválido");

      let p = fixLatexHighlighting(sceneToProcess);
      p = preventCollisions(p);
      p = calculateArrowPositions(p);
      p = calculateFramePositions(p);

      setEditableSolution([p]);
      resetNavigation();
    } catch (err) {
      alert("⚠️ Error al importar JSON:\n\n" + err.message);
    }
  };


  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-8 font-sans selection:bg-[#00ff66] selection:text-black relative">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          MathPlus <span className="text-[#00ff66] drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">Tutor</span>
        </h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111] border border-neutral-800 p-6 rounded-xl shadow-2xl space-y-4">
            
            {/* Input de Texto Matemático */}
            <MathInput 
                value={latexInput} 
                onChange={setLatexInput} 
            />

            {/* --- ZONA DE CARGA DE ARCHIVOS (NUEVO) --- */}
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`
                border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 relative group
                ${file 
                  ? 'border-[#00ff66] bg-[#00ff66]/5' 
                  : 'border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800'
                }
              `}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,image/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
              
              {file ? (
                // Estado: Archivo Seleccionado
                <>
                  <FileText className="text-[#00ff66]" size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{file.name}</p>
                    <p className="text-xs text-[#00ff66]">Listo para escanear</p>
                  </div>
                  <button 
                    onClick={handleClearFile}
                    className="p-1 rounded-full hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                // Estado: Vacío (Prompt)
                <>
                  <Upload className="text-neutral-500 group-hover:text-neutral-300" size={20} />
                  <span className="text-sm font-medium text-neutral-500 group-hover:text-neutral-300">
                    Subir PDF o Imagen
                  </span>
                </>
              )}
            </div>

            {/* Botón Principal */}
            <button
              onClick={handleScanAndSolve}
              disabled={loading || isScanning || (!latexInput && !file)}
              className="w-full bg-[#00ff66] text-black font-extrabold py-3 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:bg-neutral-800 disabled:text-neutral-500 hover:bg-[#33ff88] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95 flex items-center justify-center gap-2"
            >
              {isScanning ? (
                  <> <ScanSearch className="animate-pulse" /> Escaneando... </>
              ) : loading ? (
                  "Resolviendo..."
              ) : file ? (
                  "Escanear y Resolver"
              ) : (
                  "Explicar Paso a Paso"
              )}
            </button>
            
            <button
              onClick={handleImportJSON}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-dashed border-neutral-700 text-neutral-400 font-bold py-3 rounded-lg transition-all hover:border-[#00ff66] hover:text-[#00ff66] disabled:opacity-30"
            >
              <ClipboardPaste size={18} /> Importar JSON
            </button>
          </div>

          {editableSolution && editableSolution[0]?.resources && !isFullscreen && (
              <SidebarRecursos
                resources={editableSolution[0].resources}
                currentStepIdx={currentStep}
                onResourceClick={handleResourceClick}
              />
          )}
        </div>

        {/* COLUMNA DERECHA: MATH BROWSER */}
        <div className="lg:col-span-8 h-[650px] flex flex-col relative">
          
          {editableSolution && !isFullscreen && (
            <div className="absolute -top-12 right-0 z-10">
              <button
                onClick={() => setIsEditorOpen(true)}
                className="flex items-center gap-2 bg-[#111] hover:bg-neutral-800 text-neutral-300 hover:text-[#00ff66] border border-neutral-800 hover:border-[#00ff66]/50 px-4 py-2 rounded-lg text-sm font-bold transition shadow-md"
              >
                <Edit3 size={16} /> Corregir IA
              </button>
            </div>
          )}

          {!editableSolution ? (
            <div className="flex-grow flex items-center justify-center bg-[#111] rounded-xl shadow-2xl border border-neutral-800">
              {loading ? (
                <div className="text-center text-neutral-400">
                  <div className="animate-spin w-12 h-12 border-4 border-[#00ff66] border-t-transparent rounded-full mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
                  <h3 className="text-lg font-bold text-white tracking-wide">Generando Pizarra...</h3>
                  <p className="text-sm mt-2 text-neutral-500">La IA está estructurando la explicación visual</p>
                </div>
              ) : (
                <div className="text-center text-neutral-600">
                  <FileText size={64} className="mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-neutral-400">Tutor Virtual Listo</h3>
                  <p className="text-sm mt-1">Sube una foto o escribe una ecuación para empezar.</p>
                </div>
              )}
            </div>
          ) : (
            <div
              ref={playerContainerRef}
              className={isFullscreen 
                  ? "fixed inset-0 z-[100] bg-[#0a0a0a] flex w-screen h-screen" 
                  : "h-full w-full relative flex flex-col rounded-xl overflow-hidden border border-neutral-800 shadow-2xl"
              }
            >
              <div className="flex-grow h-full w-full relative">
                <MathBrowser
                  key={editableSolution[0].ig || Date.now()}
                  initialScene={editableSolution[0]}
                  onToggleFullscreen={toggleFullscreen}
                  isFullscreen={isFullscreen}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALES --- */}
      
      {/* 1. Selector de Problemas */}
      <ProblemSelectorModal 
          isOpen={showSelector}
          problems={detectedProblems}
          onSelect={handleSelectProblem}
          onCancel={() => setShowSelector(false)}
      />

      {/* 2. Editor Visual */}
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