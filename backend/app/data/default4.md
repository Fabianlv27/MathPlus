IG: Análisis de Funciones Racionales

=== CONT ===
Latex | show | null | 350 | 100 | f(x) = \frac{2x - 6}{x + 1}
Latex | hide | start | 350 | 180 | x + 1 \neq 0 \implies x \neq -1
Latex | hide | end | 350 | 260 | \text{Asíntota Vertical: } x = -1
Latex | hide | null | 350 | 340 | \text{Asíntota Horizontal: } y = \frac{2}{1} = 2
Latex | hide | null | 350 | 420 | \text{Intersección X (} y=0 \text{): } 2x - 6 = 0
Latex | hide | null | 350 | 500 | 2x = 6 \implies x = 3
Latex | hide | null | 350 | 580 | \text{Intersección Y (} x=0 \text{): } y = \frac{2(0) - 6}{0 + 1}
Latex | hide | null | 350 | 660 | y = \frac{-6}{1} = -6

=== INSTS ===
Hoy vamos a analizar y graficar esta función racional. Lo primero es determinar su dominio y las asíntotas verticales.
> 0 | appear | all | null
Miramos el denominador. Sabemos que la división por cero no está definida, por lo que igualamos el denominador a cero para encontrar la restricción.
> 0 | resalt | "x + 1" | #FCD34D
> 1 | appear | all | null
> 1 | resalt | "x \neq -1" | #4ADE80
Esto nos indica que tenemos una Asíntota Vertical en x igual a -1. La gráfica nunca tocará esta línea. 

[Image of vertical asymptote on graph]

> 1 | resalt | "x \neq -1" | #FCD34D
> 2 | appear | all | null
> 2 | resalt | "x = -1" | #4ADE80
Ahora busquemos la Asíntota Horizontal. Como el grado del numerador y del denominador es el mismo (grado 1), dividimos los coeficientes principales.
> 0 | resalt | "2x" | #FCD34D
> 0 | resalt | "x" | #FCD34D
> 3 | appear | all | null
> 3 | resalt | "y = 2" | #4ADE80
Para encontrar dónde la gráfica corta al eje X, igualamos el numerador a cero.
> 0 | resalt | "2x - 6" | #FCD34D
> 4 | appear | all | null
> 4 | resalt | "2x - 6 = 0" | #4ADE80
Resolvemos para x. Sumamos 6 y dividimos por 2, obteniendo x igual a 3.
> 4 | resalt | "x = 3" | #FCD34D
> 5 | appear | all | null
> 5 | resalt | "x = 3" | #4ADE80
Finalmente, para la intersección con el eje Y, sustituimos x por 0.
> 0 | resalt | "x" | #FCD34D
> 6 | appear | all | null
> 6 | resalt | "0" | #4ADE80
Simplificando, obtenemos -6 dividido entre 1, que es -6.
> 6 | resalt | "\frac{-6}{1}" | #FCD34D
> 7 | appear | all | null
> 7 | resalt | "-6" | #4ADE80
Con estos puntos y asíntotas, ya podemos bosquejar la gráfica de la función racional. 

=== RES ===
2 | Asíntota Vertical | \text{Ceros del denominador}
3 | Asíntota Horizontal | \text{Si grados iguales: } y = \frac{a}{b}
4 | Intersección en X | \text{Ceros del numerador}
6 | Intersección en Y | f(0)