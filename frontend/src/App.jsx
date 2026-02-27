// src/App.jsx
import React, { useState, useRef, useEffect } from "react";
import MathInput from "./components/MathInput";
import MathBrowser from "./components/MathBrowser"; // <--- CAMBIO PRINCIPAL: Usamos el Navegador
import SidebarRecursos from "./components/SidebarComponent";
import SceneVisualEditor from "./components/SceneVisualEditor";
import { useMathTutor } from "./hooks/useMathTutor";
import { FileText, Edit3, ClipboardPaste } from "lucide-react";
import { parseTextToJSON } from "../utils/textParser";

// Utilidades del motor de renderizado
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

  // Nota: currentStep ahora es gestionado principalmente por cada pestaña del MathBrowser,
  // pero lo mantenemos aquí para sincronizar el Sidebar externo con la pestaña Principal.
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
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current)
        playerContainerRef.current
          .requestFullscreen()
          .catch((err) => console.log(err));
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

    // Procesamos layout y física de las flechas
    const processed = solution.escenas.map((scene) => {
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
    // Reiniciamos estados de navegación al pedir nuevo problema
    setTargetStep(null);
    setCurrentStep(0);
  };

  const handleResourceClick = (stepIndex) => {
    // Al hacer clic en el sidebar externo, queremos mover la pestaña "Principal"
    setTargetStep(stepIndex);
  };

  const handleSaveEdits = (editedScene) => {
    const newSolution = [...editableSolution];
    newSolution[0] = calculateFramePositions(editedScene);
    setEditableSolution(newSolution);
    setIsEditorOpen(false);
    // Forzar reinicio de vista
    setCurrentStep(0);
  };

  // --- IMPORTAR JSON DESDE EL PORTAPAPELES ---
  const handleImportJSON = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = JSON.parse(clipboardText);
      let sceneToProcess = null;

      if (parsedData.escenas && Array.isArray(parsedData.escenas)) {
        sceneToProcess = parsedData.escenas[0];
      } else if (
        Array.isArray(parsedData.cont) &&
        Array.isArray(parsedData.insts)
      ) {
        sceneToProcess = parsedData;
      } else {
        throw new Error("El JSON no tiene el formato de MathPlus.");
      }

      let p = fixLatexHighlighting(sceneToProcess);
      p = preventCollisions(p);
      p = calculateArrowPositions(p);
      p = calculateFramePositions(p);

      setEditableSolution([p]);
      setCurrentStep(0);
      setTargetStep(null);
    } catch (err) {
      alert("⚠️ Error al importar JSON:\n\n" + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-8 font-sans selection:bg-[#00ff66] selection:text-black relative">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          MathPlus{" "}
          <span className="text-[#00ff66] drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">
            Tutor
          </span>
        </h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* =========================================
            COLUMNA IZQUIERDA: INPUTS Y SIDEBAR 
            ========================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111] border border-neutral-800 p-6 rounded-xl shadow-2xl space-y-4">
            <MathInput value={latexInput} onChange={setLatexInput} />

            <button
              onClick={handleSubmit}
              disabled={loading || (!latexInput && !file)}
              className="w-full bg-[#00ff66] text-black font-extrabold py-3 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:bg-neutral-800 disabled:text-neutral-500 hover:bg-[#33ff88] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:scale-[1.02] active:scale-95"
            >
              {loading ? "Analizando..." : "Explicar Paso a Paso"}
            </button>

            <button
              onClick={handleImportJSON}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-dashed border-neutral-700 text-neutral-400 font-bold py-3 rounded-lg transition-all hover:border-[#00ff66] hover:text-[#00ff66] disabled:opacity-30"
            >
              <ClipboardPaste size={18} /> Importar JSON
            </button>
          </div>

          {/* SIDEBAR DE RECURSOS (Solo para el problema principal) */}
          {editableSolution &&
            editableSolution[0]?.resources &&
            !isFullscreen && (
              <SidebarRecursos
                resources={editableSolution[0].resources}
                currentStepIdx={currentStep}
                onResourceClick={handleResourceClick}
              />
            )}
        </div>

        {/* =========================================
            COLUMNA DERECHA: MATH BROWSER (NAVEGADOR)
            ========================================= */}
        <div className="lg:col-span-8 h-[650px] flex flex-col relative">
          {/* BOTÓN EDITAR (MODO PROFESOR) */}
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
            /* ESTADO: CARGANDO O VACÍO */
            <div className="flex-grow flex items-center justify-center bg-[#111] rounded-xl shadow-2xl border border-neutral-800">
              {loading ? (
                <div className="text-center text-neutral-400">
                  <div className="animate-spin w-12 h-12 border-4 border-[#00ff66] border-t-transparent rounded-full mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Generando Pizarra...
                  </h3>
                  <p className="text-sm mt-2 text-neutral-500">
                    La IA está estructurando la explicación visual
                  </p>
                </div>
              ) : (
                <div className="text-center text-neutral-600">
                  <FileText size={64} className="mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-neutral-400">
                    Tutor Virtual Listo
                  </h3>
                  <p className="text-sm mt-1">
                    Sube una foto o escribe una ecuación para empezar.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ESTADO: NAVEGADOR DE MATEMÁTICAS */
            <div
              ref={playerContainerRef}
              className={
                isFullscreen
                  ? "fixed inset-0 z-[100] bg-[#0a0a0a] flex w-screen h-screen"
                  : "h-full w-full relative flex flex-col rounded-xl overflow-hidden border border-neutral-800 shadow-2xl"
              }
            >
              <div className="flex-grow h-full w-full relative">
                <MathBrowser
                  key={editableSolution[0].ig || Date.now()}
                  initialScene={editableSolution[0]}
                  // AGREGAR ESTAS DOS LÍNEAS:
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
