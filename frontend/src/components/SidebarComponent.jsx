import React from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { BookOpen, Lightbulb, MousePointerClick } from 'lucide-react';

const SidebarRecursos = ({ resources, currentStepIdx, onResourceClick }) => {
  if (!resources || resources.length === 0) return null;

  return (
    <div className="bg-[#111] p-5 rounded-xl border border-neutral-800 transition-all duration-300">
      
      <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
        <div className="p-2 bg-green-950/30 text-[#00ff66] rounded-lg border border-green-900/30">
          <BookOpen size={20} />
        </div>
        <h3 className="text-lg font-bold text-neutral-200 tracking-wide">Recursos Teóricos</h3>
      </div>

      <div className="space-y-5 max-h-[500px] md:max-h-[calc(100vh-150px)] overflow-y-auto pr-2 pt-2 custom-scrollbar">
        {resources.map((res, idx) => {
          const stepArray = Array.isArray(res.step) ? res.step : [res.step];
          const isActive = stepArray.includes(currentStepIdx);
          
          return (
            <div 
              key={idx} 
              onClick={() => onResourceClick(stepArray[0])}
              className={`
                relative p-4 rounded-xl transition-all duration-300 ease-out cursor-pointer group
                ${isActive 
                  ? 'bg-gradient-to-b from-[#0f1f14] to-[#0a140d] border border-[#00ff66]/80 border-b-[4px] border-b-[#00aa44] shadow-[0_10px_25px_rgba(0,255,102,0.25),inset_0_2px_4px_rgba(0,255,102,0.15)] -translate-y-1 scale-[1.02] z-10' 
                  : 'bg-[#0a0a0a] border border-neutral-800 border-b-[4px] border-b-neutral-900 shadow-md hover:bg-[#111] hover:border-neutral-700 hover:-translate-y-0.5 hover:shadow-lg'
                }
              `}
            >
              {isActive && (
                <div className="absolute top-3 right-3 text-[#00ff66] animate-pulse drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]">
                  <Lightbulb size={18} />
                </div>
              )}
              
              {!isActive && (
                <div className="absolute top-3 right-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MousePointerClick size={16} />
                </div>
              )}

              <h4 className={`
                text-xs font-extrabold uppercase tracking-wider mb-3
                ${isActive ? 'text-[#00ff66] drop-shadow-[0_0_5px_rgba(0,255,102,0.3)]' : 'text-neutral-500 group-hover:text-neutral-300'}
              `}>
                {res.title}
              </h4>

              <div className={`
                font-serif text-center py-3 px-3 rounded-lg border
                ${isActive 
                    ? 'bg-[#050505]/80 border-[#00ff66]/30 text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' 
                    : 'bg-[#050505] border-transparent text-neutral-500 group-hover:bg-[#080808] group-hover:border-neutral-800 shadow-inner'
                }
              `}>
                {/* CAMBIO AQUI:
                   1. Eliminado 'pointer-events-none'
                   2. Agregado 'pointer-events-auto' (opcional, es el default)
                   3. Agregado stopPropagation para que hacer click en el scroll no active la tarjeta
                */}
                <div 
                    className="overflow-x-auto text-sm md:text-sm w-full custom-scrollbar pb-1 cursor-text"
                    onClick={(e) => e.stopPropagation()} 
                >
                  <Latex>{`$${res.tex}$`}</Latex>
                </div>
              </div>

            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-neutral-600 mt-5 font-medium">Haz clic en una tarjeta para ir a su explicación.</p>
    </div>
  );
};

export default SidebarRecursos;