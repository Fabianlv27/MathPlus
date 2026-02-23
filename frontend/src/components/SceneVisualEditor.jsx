import React, { useState } from 'react';
import { Save, X, Plus, Trash2, Code, MessageSquare, MousePointer2, ChevronRight, LayoutTemplate, BookOpen, Copy, ClipboardPaste } from 'lucide-react';
import WhiteboardPlayer from './WhiteboardPlayer';

const SceneVisualEditor = ({ sceneData, onSave, onCancel }) => {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(sceneData)));
  const [activeTab, setActiveTab] = useState('insts'); // 'insts', 'cont', 'resources'
  const [previewStep, setPreviewStep] = useState(0);

  // ==========================================
  // HERRAMIENTAS DE PORTAPAPELES (NUEVO)
  // ==========================================
  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
      alert("¡JSON copiado al portapapeles con éxito!");
    } catch (err) {
      alert("Error al copiar al portapapeles. Tu navegador podría estar bloqueándolo.");
    }
  };

  const handlePasteJSON = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedData = JSON.parse(clipboardText);

      // Verificación estricta de estructura
      if (!parsedData || typeof parsedData !== 'object') throw new Error("El contenido no es un objeto JSON válido.");
      if (!Array.isArray(parsedData.cont)) throw new Error("Falta el arreglo obligatorio 'cont' (Fórmulas).");
      if (!Array.isArray(parsedData.insts)) throw new Error("Falta el arreglo obligatorio 'insts' (Pasos/Animaciones).");
      
      // Auto-completado de campos opcionales por seguridad
      if (!parsedData.resources) parsedData.resources = [];
      if (!parsedData.ig) parsedData.ig = draft.ig || "Nuevo Problema Importado";

      setDraft(parsedData);
      setPreviewStep(0);
      alert("¡JSON validado e importado correctamente!");
    } catch (err) {
      alert("⚠️ Error al importar JSON:\n\n" + err.message + "\n\nAsegúrate de haber copiado el JSON correcto.");
    }
  };

  // ==========================================
  // 1. MANEJADORES DE FÓRMULAS (cont) Y BORRADO EN CASCADA
  // ==========================================
  const handleContChange = (index, field, value) => {
    const newCont = [...draft.cont];
    newCont[index][field] = value;
    if (field === 'apart' && value === 'null') newCont[index][field] = null;
    setDraft({ ...draft, cont: newCont });
  };

  const addElement = (apartType = null) => {
    const lastY = draft.cont[draft.cont.length - 1]?.y || 100;
    setDraft({
      ...draft,
      cont: [...draft.cont, { type: 'Latex', cont: '\\text{Nueva Ecuación}', x: 350, y: lastY + 130, status: 'hide', apart: apartType }]
    });
  };

  const removeElement = (indexToRemove) => {
    const newCont = draft.cont.filter((_, i) => i !== indexToRemove);

    const newInsts = draft.insts.map(inst => {
        if (!inst.tgs) return inst;
        const updatedTgs = inst.tgs.map(tgObj => {
            if (!tgObj.tg) return tgObj;
            const parts = tgObj.tg.toString().split(':');
            const eqIdx = parseInt(parts[0]);
            const range = parts[1];

            if (eqIdx === indexToRemove) return null; 
            if (eqIdx > indexToRemove) return { ...tgObj, tg: `${eqIdx - 1}:${range}` };
            return tgObj;
        }).filter(Boolean);

        return { ...inst, tgs: updatedTgs };
    });

    setDraft({ ...draft, cont: newCont, insts: newInsts });
  };

  // ==========================================
  // 2. MANEJADORES DE PASOS (insts)
  // ==========================================
  const handleInstChange = (index, field, value) => {
    const newInsts = [...draft.insts];
    newInsts[index][field] = value;
    setDraft({ ...draft, insts: newInsts });
  };

  const handleTgChange = (instIndex, tgIndex, field, value) => {
    const newInsts = [...draft.insts];
    newInsts[instIndex].tgs[tgIndex][field] = value;
    setDraft({ ...draft, insts: newInsts });
  };

  const addTg = (instIndex) => {
    const newInsts = [...draft.insts];
    if (!newInsts[instIndex].tgs) newInsts[instIndex].tgs = [];
    newInsts[instIndex].tgs.push({ tg: '0:(0-f)', ac: 'appear' });
    setDraft({ ...draft, insts: newInsts });
    setPreviewStep(instIndex);
  };

  const removeTg = (instIndex, tgIndex) => {
    const newInsts = [...draft.insts];
    newInsts[instIndex].tgs = newInsts[instIndex].tgs.filter((_, i) => i !== tgIndex);
    setDraft({ ...draft, insts: newInsts });
  };

  const addStep = () => {
    setDraft({ ...draft, insts: [...draft.insts, { msg: 'Nuevo paso...', tgs: [], fin: [] }] });
    setPreviewStep(draft.insts.length);
  };

  // ==========================================
  // 3. MANEJADORES DE RECURSOS (resources)
  // ==========================================
  const handleResourceChange = (index, field, value) => {
    const newRes = [...(draft.resources || [])];
    newRes[index][field] = field === 'step' ? parseInt(value) || 0 : value;
    setDraft({ ...draft, resources: newRes });
  };

  const addResource = () => {
    const newRes = [...(draft.resources || []), { step: previewStep, title: 'Nuevo Recurso', tex: 'a^2 + b^2 = c^2' }];
    setDraft({ ...draft, resources: newRes });
  };

  const removeResource = (index) => {
    const newRes = (draft.resources || []).filter((_, i) => i !== index);
    setDraft({ ...draft, resources: newRes });
  };

  // ==========================================
  // HERRAMIENTA DE SELECCIÓN DE TEXTO
  // ==========================================
  const SelectorDeResaltado = ({ instIndex, tgIndex, tgValue, ecuaciones }) => {
    const eqIdx = parseInt(tgValue.split(':')[0]) || 0;
    const latexString = ecuaciones[eqIdx]?.cont || '';

    const handleTextSelection = (e) => {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        if (start !== end) handleTgChange(instIndex, tgIndex, 'tg', `${eqIdx}:(${start}-${end})`);
    };

    return (
        <div className="bg-[#050505] p-3 rounded border border-[#00ff66]/30 mt-2">
            <label className="text-[10px] text-[#00ff66] uppercase font-bold mb-2 flex items-center gap-1">
                <MousePointer2 size={12} /> Selecciona texto para resaltarlo:
            </label>
            <textarea 
                readOnly value={latexString} onMouseUp={handleTextSelection}
                className="w-full bg-[#111] text-white p-2 border border-neutral-700 rounded font-mono text-base cursor-text selection:bg-[#00ff66] selection:text-black focus:outline-none"
                rows="2"
            />
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col overflow-hidden">
        
      {/* HEADER PRINCIPAL CON BOTONES DE PORTAPAPELES */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-[#111] shrink-0 shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code className="text-[#00ff66]" /> Editor Visual Multimodal
        </h2>
        
        <div className="flex items-center gap-4">
          {/* BOTONES DE IMPORTAR/EXPORTAR JSON */}
          <div className="flex gap-2 border-r border-neutral-800 pr-4">
             <button onClick={handleCopyJSON} title="Copiar JSON al portapapeles" className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#00ff66] hover:border-[#00ff66]/50 rounded-lg transition">
                 <Copy size={18}/>
             </button>
             <button onClick={handlePasteJSON} title="Pegar JSON desde el portapapeles" className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 rounded-lg transition">
                 <ClipboardPaste size={18}/>
             </button>
          </div>

          <button onClick={onCancel} className="px-5 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition font-bold">Cancelar</button>
          <button onClick={() => onSave(draft)} className="px-5 py-2 rounded-lg bg-[#00ff66] text-black font-extrabold flex items-center gap-2 hover:bg-[#33ff88] transition shadow-[0_0_15px_rgba(0,255,102,0.3)]">
            <Save size={18} /> Aplicar a la Pizarra
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL IZQUIERDO: CONTROLES DEL EDITOR (45% ancho) */}
        <div className="w-[45%] flex flex-col border-r border-neutral-800 bg-[#0f1115]">
            <div className="flex border-b border-neutral-800 bg-[#111] shrink-0">
                <button onClick={() => setActiveTab('insts')} className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-wider flex justify-center items-center gap-2 transition-colors ${activeTab === 'insts' ? 'text-[#00ff66] border-b-2 border-[#00ff66] bg-[#1a1a1a]' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <MessageSquare size={16} /> 1. Pasos
                </button>
                <button onClick={() => setActiveTab('cont')} className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-wider flex justify-center items-center gap-2 transition-colors ${activeTab === 'cont' ? 'text-[#00ff66] border-b-2 border-[#00ff66] bg-[#1a1a1a]' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <LayoutTemplate size={16} /> 2. Fórmulas
                </button>
                <button onClick={() => setActiveTab('resources')} className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-wider flex justify-center items-center gap-2 transition-colors ${activeTab === 'resources' ? 'text-[#00ff66] border-b-2 border-[#00ff66] bg-[#1a1a1a]' : 'text-neutral-500 hover:text-neutral-300'}`}>
                    <BookOpen size={16} /> 3. Recursos
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                
                {/* ---------------------------------
                    PESTAÑA 1: PASOS (insts)
                    --------------------------------- */}
                {activeTab === 'insts' && (
                    <div className="space-y-6">
                        {draft.insts.map((inst, i) => (
                            <div key={i} onClick={() => setPreviewStep(i)} className={`bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${previewStep === i ? 'border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.1)]' : 'border-neutral-800 hover:border-neutral-600'}`}>
                                <div className="bg-[#0a0a0a] px-4 py-2 border-b border-neutral-800 flex justify-between items-center">
                                    <span className="font-bold text-neutral-300 flex items-center gap-2">
                                        {previewStep === i && <ChevronRight size={16} className="text-[#00ff66]" />} Paso {i}
                                    </span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="text-[10px] text-[#00ff66] uppercase font-bold mb-1 block">Mensaje del Profesor</label>
                                        <textarea value={inst.msg} onChange={(e) => handleInstChange(i, 'msg', e.target.value)} rows="2" className="w-full bg-[#050505] border border-neutral-800 rounded p-2 text-white focus:border-[#00ff66] focus:outline-none resize-none leading-relaxed text-sm" />
                                    </div>
                                    
                                    <div className="bg-[#0a0a0a] p-3 rounded-lg border border-neutral-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-[10px] text-amber-500 uppercase font-bold">Animaciones</label>
                                            <button onClick={() => addTg(i)} className="text-xs bg-neutral-800 text-white px-2 py-1 rounded hover:bg-neutral-700 flex items-center gap-1"><Plus size={12}/> Acción</button>
                                        </div>
                                        <div className="space-y-4">
                                            {inst.tgs && inst.tgs.map((tgObj, j) => (
                                                <div key={j} className="bg-[#111] p-3 rounded border border-neutral-800 relative">
                                                    <button onClick={() => removeTg(i, j)} className="absolute top-2 right-2 text-neutral-500 hover:text-red-500"><X size={14}/></button>
                                                    <div className="flex gap-2 items-center mb-2 pr-6">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] text-neutral-500 uppercase block mb-1">Ecuación : Rango</label>
                                                            <input type="text" value={tgObj.tg} onChange={(e) => handleTgChange(i, j, 'tg', e.target.value)} className="w-full bg-[#050505] border border-neutral-700 rounded p-1.5 text-[#00ff66] font-mono text-xs focus:outline-none" />
                                                        </div>
                                                        <div className="w-28">
                                                            <label className="text-[10px] text-neutral-500 uppercase block mb-1">Acción</label>
                                                            <select value={tgObj.ac} onChange={(e) => handleTgChange(i, j, 'ac', e.target.value)} className="w-full bg-[#050505] border border-neutral-700 rounded p-1.5 text-white text-xs focus:outline-none focus:border-amber-500">
                                                                <option value="appear">Aparecer</option>
                                                                <option value="dim">Atenuar</option>
                                                                <option value="resalt">Subrayar</option>
                                                            </select>
                                                        </div>
                                                        {tgObj.ac === 'resalt' && (
                                                            <div>
                                                                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Color</label>
                                                                <input type="color" value={tgObj.color || '#00ff66'} onChange={(e) => handleTgChange(i, j, 'color', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {tgObj.ac === 'resalt' && <SelectorDeResaltado instIndex={i} tgIndex={j} tgValue={tgObj.tg} ecuaciones={draft.cont} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addStep} className="w-full py-4 border-2 border-dashed border-neutral-800 text-neutral-500 rounded-xl hover:border-[#00ff66] hover:text-[#00ff66] transition flex justify-center items-center gap-2 font-bold"><Plus size={18}/> Añadir Nuevo Paso</button>
                    </div>
                )}

                {/* ---------------------------------
                    PESTAÑA 2: FÓRMULAS (cont)
                    --------------------------------- */}
                {activeTab === 'cont' && (
                    <div className="space-y-4 relative pl-4 border-l border-neutral-800 ml-2">
                        {draft.cont.map((el, i) => {
                            const isApart = el.apart === 'start' || el.apart === 'start-end' || el.apart === 'end' || (i > 0 && draft.cont[i-1]?.apart === 'start');
                            return (
                                <div key={i} className={`relative p-4 rounded-xl border transition-all ${isApart ? 'bg-[#0c1a2e]/60 border-[#3b82f6]/50 ml-6' : 'bg-[#111] border-neutral-800'} group`}>
                                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-neutral-900 text-neutral-400 text-[10px] font-mono px-2 py-1 rounded-full border border-neutral-700">Ec.{i}</div>
                                    <button onClick={() => removeElement(i)} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                                    
                                    <div className="grid grid-cols-12 gap-4 mt-2 pr-6">
                                        <div className="col-span-12 md:col-span-8">
                                            <label className="text-[10px] text-[#00ff66] uppercase font-bold mb-1 block">Fórmula LaTeX</label>
                                            <input type="text" value={el.cont} onChange={(e) => handleContChange(i, 'cont', e.target.value)} className="w-full bg-[#050505] border border-neutral-800 rounded p-2 text-white focus:border-[#00ff66] focus:outline-none font-mono text-sm" />
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="text-[10px] text-[#3b82f6] uppercase font-bold mb-1 block">¿Caja Auxiliar?</label>
                                            <select value={el.apart || 'null'} onChange={(e) => handleContChange(i, 'apart', e.target.value)} className="w-full bg-[#050505] border border-[#3b82f6]/30 rounded p-2 text-[#93c5fd] text-xs focus:outline-none focus:border-[#3b82f6]">
                                                <option value="null">Principal</option>
                                                <option value="start">Abre Caja</option>
                                                <option value="end">Cierra Caja</option>
                                                <option value="start-end">De 1 línea</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => addElement(null)} className="flex-1 py-3 border-2 border-dashed border-neutral-800 text-neutral-400 rounded-xl hover:border-[#00ff66] hover:text-[#00ff66] transition flex justify-center items-center gap-2 text-sm font-bold"><Plus size={16}/> Normal</button>
                            <button onClick={() => addElement('start-end')} className="flex-1 py-3 border-2 border-dashed border-[#3b82f6]/30 text-[#3b82f6] rounded-xl hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition flex justify-center items-center gap-2 text-sm font-bold"><Plus size={16}/> Auxiliar (Apart)</button>
                        </div>
                    </div>
                )}

                {/* ---------------------------------
                    PESTAÑA 3: RECURSOS (resources)
                    --------------------------------- */}
                {activeTab === 'resources' && (
                    <div className="space-y-4">
                        {(draft.resources || []).map((res, i) => (
                            <div key={i} className="bg-[#111] border border-neutral-800 p-4 rounded-xl relative group">
                                <button onClick={() => removeResource(i)} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                                <div className="grid grid-cols-12 gap-4 mt-2 pr-6">
                                    <div className="col-span-12 md:col-span-3">
                                        <label className="text-[10px] text-amber-400 uppercase font-bold mb-1 block">¿En qué paso aparece?</label>
                                        <input type="number" min="0" value={res.step} onChange={(e) => handleResourceChange(i, 'step', e.target.value)} className="w-full bg-[#050505] border border-neutral-800 rounded p-2 text-white focus:border-amber-400 focus:outline-none font-mono text-sm" />
                                    </div>
                                    <div className="col-span-12 md:col-span-9">
                                        <label className="text-[10px] text-blue-400 uppercase font-bold mb-1 block">Título del Teorema / Regla</label>
                                        <input type="text" value={res.title} onChange={(e) => handleResourceChange(i, 'title', e.target.value)} className="w-full bg-[#050505] border border-neutral-800 rounded p-2 text-white focus:border-blue-400 focus:outline-none text-sm font-bold" />
                                    </div>
                                    <div className="col-span-12">
                                        <label className="text-[10px] text-[#00ff66] uppercase font-bold mb-1 block">Fórmula LaTeX</label>
                                        <input type="text" value={res.tex} onChange={(e) => handleResourceChange(i, 'tex', e.target.value)} className="w-full bg-[#050505] border border-neutral-800 rounded p-2 text-[#00ff66] focus:border-[#00ff66] focus:outline-none font-mono text-sm" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addResource} className="w-full py-4 border-2 border-dashed border-neutral-800 text-neutral-500 rounded-xl hover:border-amber-400 hover:text-amber-400 transition flex justify-center items-center gap-2 font-bold"><Plus size={18}/> Añadir Nuevo Recurso</button>
                    </div>
                )}

            </div>
        </div>

        {/* PANEL DERECHO: VISTA PREVIA EN VIVO (55% ancho) */}
        <div className="w-[55%] bg-[#050505] p-6 flex flex-col relative">
            <div className="absolute top-8 right-8 z-10 bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/50 px-3 py-1 rounded-full text-[10px] uppercase font-bold animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ff66]"></span> Preview Real (Paso {previewStep})
            </div>
            
            <div className="flex-1 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl relative">
                <WhiteboardPlayer 
                    scenes={[draft]} 
                    requestedStep={previewStep} 
                    onStepChange={(s) => {}} 
                />
            </div>
        </div>

      </div>
    </div>
  );
};

export default SceneVisualEditor;