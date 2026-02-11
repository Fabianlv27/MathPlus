import React from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { BookOpen, Lightbulb, MousePointerClick } from 'lucide-react';

const SidebarRecursos = ({ resources, currentStepIdx, onResourceClick }) => {
  if (!resources || resources.length === 0) return null;

  // Lógica de "Resaltado hasta el siguiente"
  let activeResourceIndex = -1;
  resources.forEach((res, index) => {
    if (res.step <= currentStepIdx) {
      activeResourceIndex = index;
    }
  });

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 transition-all duration-300">
      
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <BookOpen size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Recursos Teóricos</h3>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {resources.map((res, idx) => {
          const isActive = idx === activeResourceIndex;
          
          return (
            <div 
              key={idx} 
              onClick={() => onResourceClick(res.step)} // <--- CLICK PARA NAVEGAR
              className={`
                relative p-4 rounded-lg border-l-4 transition-all duration-300 ease-in-out cursor-pointer group
                ${isActive 
                  ? 'bg-indigo-50 border-indigo-500 shadow-md translate-x-1 scale-100' 
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50' // Estilo "Normal" pero interactivo
                }
              `}
            >
              {/* Icono indicador activo */}
              {isActive && (
                <div className="absolute top-2 right-2 text-amber-500 animate-pulse">
                  <Lightbulb size={16} />
                </div>
              )}
              
              {/* Icono hint al hacer hover en inactivos */}
              {!isActive && (
                <div className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MousePointerClick size={16} />
                </div>
              )}

              <h4 className={`
                text-xs font-bold uppercase tracking-wider mb-2
                ${isActive ? 'text-indigo-700' : 'text-slate-500 group-hover:text-indigo-600'}
              `}>
                {res.title}
              </h4>

              <div className={`
                font-serif text-center py-2 px-3 rounded border
                ${isActive 
                    ? 'bg-white border-indigo-100 shadow-sm text-slate-800' 
                    : 'bg-slate-50 border-transparent text-slate-600 group-hover:bg-white group-hover:border-slate-200'
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
      <p className="text-center text-xs text-slate-400 mt-4">Haz clic en una tarjeta para ir a ese paso.</p>
    </div>
  );
};

export default SidebarRecursos;