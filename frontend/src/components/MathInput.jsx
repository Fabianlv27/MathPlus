import React, { useEffect, useRef } from 'react';
import 'mathlive';

const MathInput = ({ value, onChange }) => {
  const mfRef = useRef(null);

  useEffect(() => {
    // Le dice a MathLive que cargue sus fuentes y sonidos desde el CDN oficial
    window.MathfieldElement.fontsDirectory = 
      "https://unpkg.com/mathlive@0.98.0/dist/fonts";
      
    // (Opcional) También los sonidos para que no den error 404
    window.MathfieldElement.soundsDirectory = 
      "https://unpkg.com/mathlive@0.98.0/dist/sounds";

    const mf = mfRef.current;
    if (mf) {
      mf.value = value;
      
      // Usamos una función nombrada para poder limpiar el event listener después
      const handleInput = (evt) => {
        onChange(evt.target.value);
      };
      
      mf.addEventListener('input', handleInput);

      // Limpieza del event listener cuando el componente se desmonta
      return () => {
        mf.removeEventListener('input', handleInput);
      };
    }
  }, []); // Se ejecuta solo al montar

  return (
    <div className="border border-neutral-800 rounded-xl p-4 bg-[#050505] shadow-inner transition-all duration-300 focus-within:border-[#00ff66] focus-within:shadow-[0_0_15px_rgba(0,255,102,0.2)]">
      <label className="text-xs text-[#00ff66] font-bold mb-3 block uppercase tracking-wider">
        Escribe tu ecuación:
      </label>
      
      {/* Elemento personalizado de MathLive adaptado al Modo Oscuro */}
      <math-field 
        ref={mfRef} 
        style={{ 
          width: '100%', 
          fontSize: '1.4rem', 
          padding: '8px',
          color: '#ffffff', // Texto de la fórmula en blanco puro
          backgroundColor: 'transparent', // Fondo transparente para heredar el #050505
          outline: 'none', // Quita el borde azul por defecto de los navegadores al hacer focus
          
          // Inyectamos variables CSS nativas de MathLive para personalizar su interior
          '--caret-color': '#00ff66', // El cursor parpadeante en verde
          '--selection-background-color': 'rgba(0, 255, 102, 0.25)', // Selección de texto
          '--selection-color': '#ffffff',
          '--keyboard-zindex': '9999',
        }}
      >
        {value}
      </math-field>
    </div>
  );
};

export default MathInput;