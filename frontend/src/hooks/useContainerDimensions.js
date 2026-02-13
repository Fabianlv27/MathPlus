import { useState, useEffect } from 'react';

export const useContainerDimensions = (myRef) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, isMobile: false });

  useEffect(() => {
    const getDimensions = () => {
      if (myRef.current) {
        const { offsetWidth, offsetHeight } = myRef.current;
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
          // Consideramos "Mobile" si el ancho es menor a 768px (standard tablet/phone)
          isMobile: offsetWidth < 768 
        });
      }
    };

    // 1. Medir al iniciar
    getDimensions();

    // 2. Medir cada vez que cambie el tamaño de la ventana
    window.addEventListener('resize', getDimensions);

    // Limpieza
    return () => {
      window.removeEventListener('resize', getDimensions);
    };
  }, [myRef]);

  return dimensions;
};