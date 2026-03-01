import { ScanSearch, CheckCircle, X } from 'lucide-react';

const ProblemSelectorModal = ({ isOpen, problems, onSelect, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#111] border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Header del Modal */}
            <div className="p-6 border-b border-neutral-800 bg-[#161616] flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ScanSearch className="text-[#00ff66]" /> Ejercicios Detectados
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">
                        Hemos encontrado <span className="text-white font-bold">{problems.length}</span> problemas en tu archivo.
                        <br/>Selecciona cuál quieres resolver ahora.
                    </p>
                </div>
                <button onClick={onCancel} className="text-neutral-500 hover:text-white transition">
                    <X size={20} />
                </button>
            </div>
            
            {/* Lista de Problemas */}
            <div className="overflow-y-auto p-6 space-y-3 custom-scrollbar flex-1">
                {problems.map((prob, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(prob)}
                        className="w-full text-left p-4 rounded-xl bg-[#0a0a0a] border border-neutral-800 hover:border-[#00ff66] hover:bg-[#00ff66]/5 transition group relative flex gap-4"
                    >
                        <div className="shrink-0">
                             <span className="bg-neutral-800 text-neutral-400 text-xs font-bold px-2 py-1 rounded group-hover:bg-[#00ff66] group-hover:text-black transition">
                                #{idx + 1}
                            </span>
                        </div>
                       
                        <p className="text-neutral-300 text-sm md:text-base line-clamp-3 font-mono leading-relaxed">
                            {prob}
                        </p>
                        
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition text-[#00ff66]">
                            <CheckCircle size={20} />
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800 bg-[#161616] flex justify-end">
                <button 
                    onClick={onCancel}
                    className="px-5 py-2 text-neutral-400 hover:text-white font-bold transition hover:bg-neutral-800 rounded-lg"
                >
                    Cancelar Operación
                </button>
            </div>
        </div>
    </div>
  );
};

export default ProblemSelectorModal;