IG: Resolviendo una Ecuación Cuadrática Compleja

=== CONT ===
Latex | show | null | 350 | 100 | 2\left(x+\frac{1}{2}\right)^2+\frac{25x}{2}=\left(\frac{1}{2}-x\right)(7x+1)-4
Latex | hide | null | 350 | 180 | 2\left(x^2 + x + \frac{1}{4}\right) + \frac{25x}{2} = \left(\frac{1}{2}-x\right)(7x+1)-4
Latex | hide | null | 350 | 260 | 2x^2 + 2x + \frac{1}{2} + \frac{25x}{2} = \left(\frac{1}{2}-x\right)(7x+1)-4
Latex | hide | null | 350 | 340 | 2x^2 + 2x + \frac{1}{2} + \frac{25x}{2} = \frac{7x}{2} + \frac{1}{2} - 7x^2 - x - 4
Latex | hide | null | 350 | 420 | 2x^2 + \frac{4x}{2} + \frac{1}{2} + \frac{25x}{2} = \frac{7x}{2} + \frac{1}{2} - 7x^2 - \frac{2x}{2} - 4
Latex | hide | null | 350 | 500 | 2x^2 + \frac{29x}{2} + \frac{1}{2} = -7x^2 + \frac{5x}{2} - \frac{7}{2}
Latex | hide | null | 350 | 580 | 2x^2 + 7x^2 + \frac{29x}{2} - \frac{5x}{2} + \frac{1}{2} + \frac{7}{2} = 0
Latex | hide | null | 350 | 660 | 9x^2 + \frac{24x}{2} + \frac{8}{2} = 0
Latex | hide | null | 350 | 740 | 9x^2 + 12x + 4 = 0
Latex | hide | null | 350 | 870 | x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
Latex | hide | null | 350 | 1000 | x = \frac{-12 \pm \sqrt{(12)^2 - 4(9)(4)}}{2(9)}
Latex | hide | null | 350 | 1130 | x = \frac{-12 \pm \sqrt{144 - 144}}{18}
Latex | hide | null | 350 | 1260 | x = \frac{-12 \pm \sqrt{0}}{18}
Latex | hide | null | 350 | 1390 | x = \frac{-12}{18}
Latex | hide | null | 350 | 1520 | x = -\frac{2}{3}

=== INSTS ===
¡Hola a todos! Hoy vamos a resolver una ecuación cuadrática compleja que requiere varios pasos de simplificación.
> 0 | appear | all | null
El primer paso es expandir el término al cuadrado en el lado izquierdo de la ecuación. Usaremos la fórmula del binomio al cuadrado.
> 0 | resalt | "\left(x+\frac{1}{2}\right)^2" | #FCD34D
> 1 | appear | all | null
> 1 | resalt | "\left(x^2 + x + \frac{1}{4}\right)" | #4ADE80
Ahora, distribuimos el 2 que multiplica al binomio expandido en el lado izquierdo.
> 1 | resalt | "2\left(x^2 + x + \frac{1}{4}\right)" | #FCD34D
> 2 | appear | all | null
> 2 | resalt | "2x^2 + 2x + \frac{1}{2}" | #4ADE80
A continuación, expandimos el producto de los dos binomios en el lado derecho de la ecuación.
> 2 | resalt | "\left(\frac{1}{2}-x\right)(7x+1)" | #FCD34D
> 3 | appear | all | null
> 3 | resalt | "\frac{7x}{2} + \frac{1}{2} - 7x^2 - x" | #4ADE80
Para facilitar la combinación de términos, vamos a expresar los términos con 'x' que no son fracciones, como fracciones con denominador 2.
> 3 | resalt | "2x" | #FCD34D
> 3 | resalt | "- x" | #FCD34D
> 4 | appear | all | null
> 4 | resalt | "\frac{4x}{2}" | #4ADE80
> 4 | resalt | "- \frac{2x}{2}" | #4ADE80
Ahora, combinamos los términos semejantes en cada lado de la ecuación.
> 4 | resalt | "2x^2 + \frac{4x}{2} + \frac{1}{2} + \frac{25x}{2}" | #FCD34D
> 5 | appear | all | null
> 5 | resalt | "2x^2 + \frac{29x}{2} + \frac{1}{2}" | #4ADE80
> 5 | resalt | "-7x^2 + \frac{5x}{2} - \frac{7}{2}" | #4ADE80
Movemos todos los términos del lado derecho al lado izquierdo de la ecuación para igualarla a cero.
> 5 | resalt | "-7x^2 + \frac{5x}{2} - \frac{7}{2}" | #FCD34D
> 6 | appear | all | null
> 6 | resalt | "+ 7x^2" | #4ADE80
> 6 | resalt | "- \frac{5x}{2}" | #4ADE80
> 6 | resalt | "+ \frac{7}{2}" | #4ADE80
Agrupamos y combinamos los términos semejantes: los términos con x al cuadrado, los términos con x, y las constantes.
> 6 | resalt | "2x^2 + 7x^2" | #FCD34D
> 6 | resalt | "\frac{29x}{2} - \frac{5x}{2}" | #FCD34D
> 6 | resalt | "\frac{1}{2} + \frac{7}{2}" | #FCD34D
> 7 | appear | all | null
> 7 | resalt | "9x^2" | #4ADE80
> 7 | resalt | "\frac{24x}{2}" | #4ADE80
> 7 | resalt | "\frac{8}{2}" | #4ADE80
Ahora, simplificamos las fracciones resultantes.
> 7 | resalt | "\frac{24x}{2}" | #FCD34D
> 7 | resalt | "\frac{8}{2}" | #FCD34D
> 8 | appear | all | null
> 8 | resalt | "12x" | #4ADE80
> 8 | resalt | "4" | #4ADE80
Hemos llegado a una ecuación cuadrática en su forma estándar: ax^2 + bx + c = 0. Para resolverla, utilizaremos la fórmula cuadrática.
> 8 | resalt | "9x^2 + 12x + 4 = 0" | #FCD34D
> 9 | appear | all | null
> 9 | resalt | "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" | #4ADE80
Identificamos los valores de a, b y c de nuestra ecuación. Aquí, a es 9, b es 12 y c es 4. Sustituimos estos valores en la fórmula cuadrática.
> 8 | resalt | "9" | #FCD34D
> 8 | resalt | "12" | #FCD34D
> 8 | resalt | "4" | #FCD34D
> 10 | appear | all | null
> 10 | resalt | "9" | #4ADE80
> 10 | resalt | "12" | #4ADE80
> 10 | resalt | "4" | #4ADE80
> 10 | resalt | "9" | #4ADE80
Calculamos los términos dentro de la raíz cuadrada y el denominador.
> 10 | resalt | "(12)^2" | #FCD34D
> 10 | resalt | "4(9)(4)" | #FCD34D
> 10 | resalt | "2(9)" | #FCD34D
> 11 | appear | all | null
> 11 | resalt | "144" | #4ADE80
> 11 | resalt | "144" | #4ADE80
> 11 | resalt | "18" | #4ADE80
Realizamos la resta dentro de la raíz cuadrada.
> 11 | resalt | "144 - 144" | #FCD34D
> 12 | appear | all | null
> 12 | resalt | "0" | #4ADE80
La raíz cuadrada de cero es cero, lo que significa que tenemos una única solución.
> 12 | resalt | "\sqrt{0}" | #FCD34D
> 13 | appear | all | null
> 13 | resalt | "0" | #4ADE80
Finalmente, simplificamos la fracción para obtener el valor de x.
> 13 | resalt | "\frac{-12}{18}" | #FCD34D
> 14 | appear | all | null
> 14 | resalt | "-\frac{2}{3}" | #4ADE80

=== RES ===
1 | Binomio al Cuadrado | (a+b)^2 = a^2 + 2ab + b^2
2, 3 | Propiedad Distributiva | a(b+c) = ab + ac \quad \text{y} \quad (a+b)(c+d) = ac+ad+bc+bd
9 | Fórmula Cuadrática | x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}