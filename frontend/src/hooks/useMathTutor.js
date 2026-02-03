import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export const useMathTutor = () => {
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Referencia a la síntesis de voz del navegador
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);

  const solveProblem = async (latex, instructions, file) => {
    setLoading(true);
    const formData = new FormData();
    if (file) formData.append('file', file);
    // Combinamos la ecuación con las instrucciones de texto
    const finalQuery = latex ? `Problema: ${latex}. Instrucciones: ${instructions}` : instructions;
    formData.append('query', finalQuery);

    try {
      // Ajusta la URL a tu backend FastAPI
      const res = await axios.post('http://localhost:8000/api/v1/solve', formData);
      setSolution(res.data);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error al resolver:", error);
      alert("Hubo un error conectando con la IA");
    } finally {
      setLoading(false);
    }
  };

  const cleanTextForSpeech = (text) => {
    if (!text) return "";
    return text
      .replace(/\$/g, '')          // Quita los signos de dolar
      .replace(/\\frac/g, 'fracción') // Cambia \frac por palabra
      .replace(/\\/g, '')          // Quita las barras invertidas restantes
      .replace(/\{|\}/g, '')       // Quita las llaves {}
      .replace(/\^/g, ' elevado a ') // Cambia ^ por "elevado a"
      .replace(/_/g, ' sub ');     // Cambia _ por "sub"
  };
  // Efecto: Reproducir voz cuando cambia el paso
  useEffect(() => {
    if (!solution || !isPlaying) return;
if (!solution.pasos[currentStep]) return;
    // Cancelar audio anterior
    synth.cancel();

    const pasoData = solution.pasos[currentStep];
    const textToSpeak = cleanTextForSpeech(pasoData.texto_voz);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES'; // Español
    utterance.rate = 1.0;     // Velocidad normal

    // Evento clave: Cuando termina de hablar, avanzar paso
    utterance.onend = () => {
      if (currentStep < solution.pasos.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false); // Terminó la explicación
      }
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);

    return () => synth.cancel();
  }, [currentStep, isPlaying, solution]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return {
    loading,
    solution,
    currentStep,
    isPlaying,
    solveProblem,
    togglePlay,
    setCurrentStep // Para control manual
  };
};