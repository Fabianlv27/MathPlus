import React from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { BookOpen, Lightbulb, MousePointerClick } from 'lucide-react';

const SidebarRecursos = ({ resources, currentStepIdx, onResourceClick }) => {
  if (!resources || resources.length === 0) return null;

  let activeResourceIndex = -1;
  resources.forEach((res, index) => {
    if (res.step <= currentStepIdx) activeResourceIndex = index;
  });

  return (
    <div className="bg-[#111] p-5 rounded-xl border border-neutral-800 transition-all duration-300">
      
      <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
        <div className="p-2 bg-green-950/30 text-[#00ff66] rounded-lg border border-green-900/30">
          <BookOpen size={20} />
        </div>
        <h3 className="text-lg font-bold text-neutral-200 tracking-wide">Recursos Teóricos</h3>
      </div>

      <div className="space-y-4 max-h-[500px] md:max-h-[calc(100vh-150px)] overflow-y-auto pr-2 custom-scrollbar">
        {resources.map((res, idx) => {
          const isActive = idx === activeResourceIndex;
          
          return (
            <div 
              key={idx} 
              onClick={() => onResourceClick(res.step)}
              className={`
                relative p-4 rounded-lg border-l-4 transition-all duration-300 ease-in-out cursor-pointer group
                ${isActive 
                  ? 'bg-green-950/20 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.1)] translate-x-1' 
                  : 'bg-[#0a0a0a] border-neutral-800 hover:border-green-900/50 hover:bg-[#151515]'
                }
              `}
            >
              {/* Icono indicador activo */}
              {isActive && (
                <div className="absolute top-2 right-2 text-[#00ff66] animate-pulse">
                  <Lightbulb size={16} />
                </div>
              )}
              
              {/* Icono hint al hacer hover en inactivos */}
              {!isActive && (
                <div className="absolute top-2 right-2 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MousePointerClick size={16} />
                </div>
              )}

              <h4 className={`
                text-xs font-bold uppercase tracking-wider mb-2
                ${isActive ? 'text-[#00ff66]' : 'text-neutral-500 group-hover:text-green-400'}
              `}>
                {res.title}
              </h4>

              {/* Contenedor de la fórmula */}
              <div className={`
                font-serif text-center py-3 px-3 rounded-md border
                ${isActive 
                    ? 'bg-[#050505] border-green-900/40 text-neutral-200 shadow-inner' 
                    : 'bg-[#050505] border-transparent text-neutral-500 group-hover:bg-[#0a0a0a] group-hover:border-neutral-800'
                }
              `}>
                <div className="overflow-x-auto text-sm md:text-base pointer-events-none">
                  <Latex>{`$${res.tex}$`}</Latex>
                </div>
              </div>

            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-neutral-600 mt-5 font-medium">Haz clic en una tarjeta para ir a ese paso.</p>
    </div>
  );
};

export default SidebarRecursos;