from fpdf import FPDF
import os

class PDFSolution(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Solución Generada por AI Math Tutor', 0, 1, 'C')

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        # Nota: FPDF básico no renderiza LaTeX complejo. 
        # Para el MVP, guardamos el texto plano explicativo.
        self.multi_cell(0, 10, body)
        self.ln()

def generate_solution_pdf(solucion_texto: str, filename: str = "solucion.pdf") -> str:
    pdf = PDFSolution()
    pdf.add_page()
    
    # Limpieza básica de caracteres no compatibles con latin-1 si es necesario
    text_safe = solucion_texto.encode('latin-1', 'replace').decode('latin-1')
    
    pdf.chapter_body(text_safe)
    
    output_path = f"/tmp/{filename}" # Usar directorios temporales adecuados en prod
    pdf.output(output_path)
    return output_path