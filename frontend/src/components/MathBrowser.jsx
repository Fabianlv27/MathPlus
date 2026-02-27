import React, { useState } from 'react';
import { X, Sparkles, Layout } from 'lucide-react'; // Quitamos Plus y ChevronRight si no se usan
import WhiteboardPlayer from './WhiteboardPlayer';

// 1. AÑADIMOS onToggleFullscreen e isFullscreen A LOS PROPS
const MathBrowser = ({ initialScene, onToggleFullscreen, isFullscreen }) => {
  const [tabs, setTabs] = useState([
    { id: 'main', title: 'Problema Principal', data: initialScene, activeStep: 0 }
  ]);
  const [activeTabId, setActiveTabId] = useState('main');
  const [loading, setLoading] = useState(false);

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    if (tabId === 'main') return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) setActiveTabId('main');
  };

  const handleAskForExplanation = async (stepIndex, currentEquation, nextEquation) => {
    setLoading(true);
    try {
        // Ajusta la URL si tu backend corre en otro puerto
        const response = await fetch('http://localhost:8000/explain_step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                step_index: stepIndex,
                before_tex: currentEquation,
                after_tex: nextEquation,
                context: "Solicitud del usuario"
            })
        });
        
        const newSceneData = await response.json();
        const newTabId = `expl-${Date.now()}`;
        const newTab = {
            id: newTabId,
            title: `Explicación Paso ${stepIndex}`,
            data: newSceneData.escenas[0],
            activeStep: 0,
            isExplanation: true
        };

        setTabs([...tabs, newTab]);
        setActiveTabId(newTabId);

    } catch (error) {
        alert("Error generando la explicación. Asegúrate de que el backend esté corriendo y soporte '/explain_step'.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    // 2. CAMBIO CRÍTICO: 'h-full' EN LUGAR DE 'h-screen'
    // Esto asegura que los controles de abajo no se salgan del contenedor de 650px
    <div className="flex flex-col h-full bg-[#050505] overflow-hidden">
      
      {/* BARRA DE PESTAÑAS */}
      <div className="flex items-center bg-[#111] border-b border-neutral-800 px-2 pt-2 gap-2 overflow-x-auto shrink-0">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`
                group relative px-4 py-2 rounded-t-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 min-w-[150px] max-w-[200px] border-t border-x select-none
                ${activeTabId === tab.id 
                    ? 'bg-[#050505] border-neutral-700 text-white border-b-[#050505] z-10' 
                    : 'bg-[#1a1a1a] border-transparent text-neutral-500 hover:bg-[#222] hover:text-neutral-300'
                }
            `}
          >
            {tab.isExplanation ? <Sparkles size={14} className="text-amber-400" /> : <Layout size={14} />}
            <span className="truncate flex-1">{tab.title}</span>
            
            {tab.id !== 'main' && (
                <button 
                    onClick={(e) => closeTab(e, tab.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all"
                >
                    <X size={12} />
                </button>
            )}
            
            {activeTabId === tab.id && (
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00ff66]" />
            )}
          </div>
        ))}
      </div>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {loading && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff66]"></div>
                <p className="text-[#00ff66] mt-4 font-mono text-sm animate-pulse">Generando explicación rigurosa...</p>
            </div>
        )}

        {activeTab && (
            <WhiteboardPlayer 
                key={activeTab.id} 
                scenes={[activeTab.data]} 
                onExplainRequest={!activeTab.isExplanation ? handleAskForExplanation : null}
                
                // 3. PASAMOS LOS PROPS DE FULLSCREEN HACIA ABAJO
                onToggleFullscreen={onToggleFullscreen}
                isFullscreen={isFullscreen}
            />
        )}
      </div>
    </div>
  );
};

export default MathBrowser;