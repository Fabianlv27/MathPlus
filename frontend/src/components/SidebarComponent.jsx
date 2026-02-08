// SidebarComponent.jsx
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
const SidebarRecursos = ({ resources, currentStepIdx }) => {
  // Opcional: Mostrar solo los recursos que ya han aparecido hasta el paso actual
  // const visibleResources = resources.filter(res => res.step <= currentStepIdx);

  // Opcional: Resaltar el recurso activo del paso actual
  return (
    <div className="sidebar">
      <h3>📚 Recursos Teóricos</h3>
      {resources.map((res, idx) => (
        <div 
           key={idx} 
           className={`card ${res.step === currentStepIdx ? 'active-card' : ''}`}
        >
          <h4>{res.title}</h4>
          <div className="latex-container">
             {/* Tu componente LaTeX aquí */}
             <Latex>{`$${res.tex}$`}</Latex>
          </div>
        </div>
      ))}
    </div>
  );
};
export default SidebarRecursos