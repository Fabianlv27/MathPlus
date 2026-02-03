import React from 'react';
import { BlockMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronRight, ChevronLeft, Download, RefreshCw } from 'lucide-react';

// Componente para dibujar las anotaciones (Flechas, Círculos, Tachones)
const AnnotationLayer = ({ type, zone }) => {
  // Definimos coordenadas aproximadas para las zonas (Porcentajes: top, left, width, height)
  const getZone = () => {
    switch (zone) {
      case 'numerador': return { t: 10, l: 20, w: 60, h: 30 }; // Parte de arriba
      case 'denominador': return { t: 60, l: 20, w: 60, h: 30 }; // Parte de abajo
      case 'izquierda': return { t: 10, l: 0, w: 45, h: 80 }; // Lado izquierdo del =
      case 'derecha': return { t: 10, l: 55, w: 45, h: 80 }; // Lado derecho del =
      case 'todo': return { t: 5, l: 5, w: 90, h: 90 };
      case 'termino_final': return { t: 20, l: 60, w: 30, h: 60 };
      default: return null;
    }
  };

  const cords = getZone();
  if (!cords) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      {/* ANIMACIÓN DE CÍRCULO (RESALTAR) */}
      {type === 'resaltar' && (
        <motion.rect
          x={`${cords.l}%`}
          y={`${cords.t}%`}
          width={`${cords.w}%`}
          height={`${cords.h}%`}
          rx="15"
          fill="none"
          stroke="#2563EB" // Azul
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      )}

      {/* ANIMACIÓN DE TACHADO (DESAPARECER/CANCELAR) */}
      {type === 'desaparecer' && (
        <motion.path
          d={`M ${cords.l}% ${cords.t}% L ${cords.l + cords.w}% ${cords.t + cords.h}%`}
          stroke="#EF4444" // Rojo
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* ANIMACIÓN DE FLECHA (MOVER) */}
      {/* Dibuja una flecha curva desde la izquierda hacia la zona indicada */}
      {type === 'mover' && (
        <motion.path
          d={`M 10% 50% Q 50% 10%, ${cords.l}% ${cords.t + 20}%`} // Curva Bezier simple
          fill="none"
          stroke="#F59E0B" // Naranja
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
      )}

      {/* Definición de la punta de flecha */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#F59E0B" />
        </marker>
      </defs>
    </svg>
  );
};

const SolutionPlayer = ({ solution, currentStep, isPlaying, togglePlay, setStep }) => {
 if (!solution || !solution.pasos || !solution.pasos[currentStep]) {
    return null; 
  }
  const paso = solution.pasos[currentStep];

  // Identificamos qué zona lógica queremos resaltar basándonos en 'elementos_foco'
  // El backend debería mandar cosas como ["numerador"], ["denominador"], etc.
  const activeZone = paso.elementos_foco && paso.elementos_foco.length > 0 
    ? paso.elementos_foco[0] 
    : null;

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl p-6 shadow-lg border border-slate-200">
      
      {/* Header simple */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">AI TUTOR</span>
           Pizarra Interactiva
        </h2>
        <button className="text-slate-400 hover:text-slate-600"><Download size={18}/></button>
      </div>

      {/* ÁREA DE PIZARRA (Canvas) */}
      <div className="flex-grow flex flex-col items-center justify-center relative bg-white rounded-xl shadow-inner border border-slate-100 p-8 overflow-hidden min-h-[350px]">
        
        {/* Renderizado Matemático */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={paso.latex_visible + currentStep} // Clave única para transiciones
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, position: 'absolute' }} // Absolute evita saltos de layout
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl text-slate-800 z-0 relative"
          >
            <BlockMath math={paso.latex_visible} />
          </motion.div>
        </AnimatePresence>

        {/* CAPA DE ANOTACIONES (Dibuja encima de la matemática) */}
        <AnnotationLayer type={paso.accion_dom} zone={activeZone} />

        {/* Texto Explicativo (Subtítulos) */}
        <div className="absolute bottom-6 left-6 right-6 text-center">
            <motion.p 
                key={paso.texto_voz}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-medium text-slate-600 bg-white/90 p-2 rounded-lg backdrop-blur-sm"
            >
                {paso.texto_voz}
            </motion.p>
        </div>
      </div>

      {/* Controles de Reproducción */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button onClick={() => setStep(Math.max(0, currentStep - 1))} className="p-3 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-slate-200 text-slate-600">
            <ChevronLeft />
        </button>
        
        <button 
            onClick={togglePlay}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isPlaying ? <><Pause size={20}/> Pausar Explicación</> : <><Play size={20}/> Reproducir Clase</>}
        </button>

        <button onClick={() => setStep(Math.min(solution.pasos.length - 1, currentStep + 1))} className="p-3 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-slate-200 text-slate-600">
            <ChevronRight />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-6 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
        {solution.pasos.map((_, idx) => (
            <div 
                key={idx} 
                className={`h-full transition-all duration-500 ${idx <= currentStep ? 'bg-indigo-500 flex-1' : 'bg-transparent w-0'}`}
            />
        ))}
      </div>
      <div className="text-center text-xs text-slate-400 mt-2">Paso {currentStep + 1} de {solution.pasos.length}</div>

    </div>
  );
};

export default SolutionPlayer;