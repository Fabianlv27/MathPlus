import React, { useEffect, useRef } from 'react';
import 'mathlive';

const MathInput = ({ value, onChange }) => {
  const mfRef = useRef(null);
useEffect(() => {
    // 🔴 AGREGA ESTA LÍNEA AQUÍ DENTRO:
    // Le dice a MathLive que cargue sus fuentes y sonidos desde el CDN oficial
    window.MathfieldElement.fontsDirectory = 
      "https://unpkg.com/mathlive@0.98.0/dist/fonts";
      
    // (Opcional) También los sonidos para que no den error 404
    window.MathfieldElement.soundsDirectory = 
      "https://unpkg.com/mathlive@0.98.0/dist/sounds";

    const mf = mfRef.current;
    if (mf) {
      mf.value = value;
      mf.addEventListener('input', (evt) => {
        onChange(evt.target.value);
      });
    }
  }, []);

  return (
    <div className="border-2 border-blue-200 rounded-lg p-2 bg-white shadow-sm">
      <label className="text-sm text-gray-500 font-bold mb-1 block">Escribe tu ecuación:</label>
      {/* Elemento personalizado de MathLive */}
      <math-field 
        ref={mfRef} 
        style={{ width: '100%', fontSize: '1.2rem', padding: '10px' }}
      >
        {value}
      </math-field>
    </div>
  );
};

export default MathInput;