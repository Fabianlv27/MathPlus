import React, { useState, useEffect } from 'react';
import { Settings, Save, Lock } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const [keys, setKeys] = useState({ gemini: '', groq: '' });

    useEffect(() => {
        // Cargar keys guardadas (localStorage es seguro si es app de escritorio local)
        const saved = localStorage.getItem('math_app_keys');
        if (saved) setKeys(JSON.parse(saved));
    }, []);

    const handleSave = () => {
        localStorage.setItem('math_app_keys', JSON.stringify(keys));
        onClose();
        alert("Claves guardadas localmente.");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4">
            <div className="bg-[#111] border border-neutral-800 p-6 rounded-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Settings className="text-[#00ff66]"/> Configuración de API
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-neutral-400 text-sm block mb-1">Gemini API Key</label>
                        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-neutral-800 rounded px-3 py-2">
                            <Lock size={14} className="text-neutral-500"/>
                            <input 
                                type="password" 
                                value={keys.gemini}
                                onChange={e => setKeys({...keys, gemini: e.target.value})}
                                className="bg-transparent border-none focus:outline-none text-white w-full text-sm"
                                placeholder="AIzaSy..."
                            />
                        </div>
                    </div>
                    {/* Repetir para Groq */}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-neutral-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} className="bg-[#00ff66] text-black px-4 py-2 rounded font-bold flex items-center gap-2">
                        <Save size={16}/> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};
export default SettingsModal;