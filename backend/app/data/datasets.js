
const WHITEBOARD_MOCK_DATA = [
  {
    "ig": "Simplificación Logarítmica Detallada",
    "cont": [
      // --- COLUMNA PRINCIPAL (x: 350) ---
      { "type": "Latex", "cont": "\\frac{\\log_4 25}{2} - \\frac{1}{2} - \\log_4 40", "x": 350, "y": 100, "status": "hide" },
      { "type": "Latex", "cont": "\\log_4 5 - \\frac{1}{2} - \\log_4 40", "x": 350, "y": 180, "status": "hide" },
      { "type": "Latex", "cont": "\\log_4 5 - \\log_4 40 - \\frac{1}{2}", "x": 350, "y": 260, "status": "hide" },
      { "type": "Latex", "cont": "\\log_4(\\frac{5}{40}) - \\frac{1}{2}", "x": 350, "y": 340, "status": "hide" },
      { "type": "Latex", "cont": "\\log_4(\\frac{1}{8}) - \\frac{1}{2}", "x": 350, "y": 420, "status": "hide" }, // De aquí nace el cálculo auxiliar
      
      // --- COLUMNA AUXILIAR (x: 650) ---
      // Alineamos la primera parte del cálculo auxiliar a la misma altura (y: 420)
      { "type": "Latex", "cont": "\\log_{2^2}(2^{-3})", "x": 650, "y": 420, "status": "hide" },
      { "type": "Latex", "cont": "\\frac{-3}{2} \\cdot \\log_2(2)", "x": 650, "y": 500, "status": "hide" },
      { "type": "Latex", "cont": "-\\frac{3}{2}", "x": 650, "y": 580, "status": "hide" },
      
      // --- VUELTA A LA COLUMNA PRINCIPAL (x: 350) ---
      // Retomamos la ecuación principal en el siguiente renglón disponible (y: 500)
      { "type": "Latex", "cont": "-\\frac{3}{2} - \\frac{1}{2}", "x": 350, "y": 500, "status": "hide" },
      { "type": "Latex", "cont": "-2", "x": 350, "y": 580, "status": "hide" }
    ],
    "resources": [
      { 
        "step": 1, 
        "title": "Propiedad de la Potencia", 
        "tex": "n \\cdot \\log_b(x) = \\log_b(x^n)" 
      },
      { 
        "step": 3, 
        "title": "Propiedad del Cociente", 
        "tex": "\\log_b(x) - \\log_b(y) = \\log_b(\\frac{x}{y})" 
      },
      { 
        "step": 5, 
        "title": "Cambio de Base (Truco)", 
        "tex": "4=2^2, \\quad 8=2^3" 
      },
      { 
        "step": 7, // Ajustado al paso donde se sacan los exponentes
        "title": "Propiedad del Logaritmo", 
        "tex": "\\log_{b^n}(b^m) = \\frac{m}{n}" 
      }
    ],
    "insts": [
      {
        "msg": "Comenzamos con la expresión original.",
        "tgs": [ { "tg": "0:(0-f)", "ac": "appear" } ],
        "fin": []
      },
      {
        "msg": "Aplicamos la regla de la potencia: dividir por 2 es raíz cuadrada (√25 = 5).",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "dim" },
          { "tg": "0:(0-18)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "1:(0-f)", "ac": "appear" },
          { "tg": "1:(0-7)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Reordenamos los términos para agrupar los logaritmos.",
        "tgs": [
          { "tg": "1:(0-f)", "ac": "dim" },
          { "tg": "2:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Restar logaritmos de la misma base equivale al logaritmo del cociente.",
        "tgs": [
          { "tg": "2:(0-f)", "ac": "dim" },
          { "tg": "2:(0-6)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "2:(10-18)", "ac": "resalt", "color": "#FCD34D" },
          { "tg": "3:(0-f)", "ac": "appear" },
          { "tg": "3:(0-16)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "Simplificamos la fracción dentro del logaritmo: 5/40 es igual a 1/8.",
        "tgs": [
          { "tg": "3:(0-f)", "ac": "dim" },
          { "tg": "4:(0-f)", "ac": "appear" },
          { "tg": "4:(6-11)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      
      // --- INICIO DE LA EXPLICACIÓN DETALLADA (AL MARGEN) ---
      
      {
        "msg": "¡Alto aquí! Resolvamos este logaritmo por separado a la derecha. Expresaremos todo en base 2. El 4 es 2 al cuadrado.",
        "tgs": [
          { "tg": "4:(0-f)", "ac": "dim" },
          { "tg": "4:(0-12)", "ac": "resalt", "color": "#FCD34D" }, 
          { "tg": "5:(0-f)", "ac": "appear" },
          { "tg": "5:(3-6)", "ac": "resalt", "color": "#4ADE80" } 
        ],
        "fin": []
      },
      {
        "msg": "Y el 8 es 2 al cubo. Como el 8 está abajo dividiendo, su exponente pasa a ser negativo, es decir, -3.",
        "tgs": [
          { "tg": "5:(3-6)", "ac": "resalt", "color": "#1e293b" }, 
          { "tg": "5:(7-11)", "ac": "resalt", "color": "#4ADE80" }  
        ],
        "fin": []
      },
      {
        "msg": "Ahora usamos un truco: sacamos los exponentes hacia afuera como una fracción. El -3 va arriba y el 2 va abajo.",
        "tgs": [
          { "tg": "5:(0-f)", "ac": "dim" },
          { "tg": "6:(0-f)", "ac": "appear" },
          { "tg": "6:(0-4)", "ac": "resalt", "color": "#4ADE80" } 
        ],
        "fin": []
      },
      {
        "msg": "Como el logaritmo de 2 en base 2 vale 1, simplemente nos queda la fracción -3/2.",
        "tgs": [
          { "tg": "6:(0-f)", "ac": "dim" },
          { "tg": "7:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Ahora que sabemos cuánto vale esa parte, la ponemos de vuelta en nuestra ecuación principal, a la izquierda.",
        "tgs": [
          { "tg": "7:(0-f)", "ac": "dim" },
          { "tg": "8:(0-f)", "ac": "appear" },
          { "tg": "8:(0-4)", "ac": "resalt", "color": "#4ADE80" } 
        ],
        "fin": [] // <- QUITO EL BORRADO AQUÍ. Así la columna de la derecha se queda visible.
      },
      
      // --- FIN DEL DESGLOSE ---

      {
        "msg": "Finalmente restamos ambas fracciones: -1.5 menos 0.5 es igual a -2.",
        "tgs": [
          { "tg": "8:(0-f)", "ac": "dim" },
          { "tg": "9:(0-f)", "ac": "appear" }
        ],
        "fin": []
      }
    ]
  }
] 
const a=[
    {
        "ig": "Resolución de Ecuaciones de Primer Grado",
        "cont": [
            {"type": "Latex", "cont": "2(x + 5) = 24", "x": 300, "y": 100, "status": "show"},

            {"type": "Flecha", "x": 310, "y": 90, "toX": 330, "toY": 90, "status": "hide"},
            {"type": "Flecha", "x": 310, "y": 90, "toX": 370, "toY": 90, "status": "hide"},

            // [2] Paso 1: Distribución realizada
            {"type": "Latex", "cont": "2x + 10 = 24", "x": 300, "y": 200, "status": "hide"},

            // [3] Paso 2: El 10 pasa restando (Mostramos la operación)
            {"type": "Latex", "cont": "2x = 24 - 10", "x": 300, "y": 300, "status": "hide"},

            // [4] Paso 3: Simplificación de la resta
            {"type": "Latex", "cont": "2x = 14", "x": 300, "y": 400, "status": "hide"},

            // [5] Paso 4: Despeje (El 2 pasa dividiendo)
            // Aquí usamos una fracción visual
            {"type": "Latex", "cont": "x = \\frac{14}{2}", "x": 300, "y": 500, "status": "hide"},

            // [6] Resultado Final (Muy abajo, para forzar el scroll)
            {"type": "Latex", "cont": "x = 7", "x": 300, "y": 600, "status": "hide"},

            // [7] Marco de resultado
            {"type": "Marco", "x1": 250, "x2": 350, "y1": 580, "y2": 640, "status": "hide"}
        ],
        "insts": [
            {
                "msg": "Tenemos esta ecuación. El objetivo es encontrar el valor de x.",
                "tgs": []
            },
            {
                "msg": "Lo primero que nos molesta es el paréntesis. El 2 está multiplicando a todo lo de adentro.",
                "tgs": [{"tg": "0:(0-1)", "ac": "resalt", "color": "#FCD34D"}] // Resalta el 2
            },
            {
                "msg": "Aplicamos la propiedad distributiva: multiplicamos el 2 por la x...",
                "tgs": [{"tg": "1", "ac": "appear"}] // Flechas
            },
            {
                "msg": "...y también multiplicamos el 2 por el 5.",
                "tgs": []
            },
            {
                "msg": "Esto nos deja la ecuación así: 2x más 10 es igual a 24.",
                "tgs": [{"tg": "2", "ac": "appear"}],
                "fin": [0, 1] // Limpia lo anterior para enfocar en lo nuevo
            },
            {
                "msg": "Ahora queremos dejar a la 'x' sola. Este +10 que está sumando...",
                "tgs": [{"tg": "2:(3-5)", "ac": "resalt", "color": "#EF4444"}] // Resalta +10
            },
            {
                "msg": "...pasa al otro lado del igual haciendo lo contrario: restando.",
                "tgs": [{"tg": "3", "ac": "appear"}],
                "fin": [2]
            },
            {
                "msg": "Hacemos la resta: 24 menos 10 es 14.",
                "tgs": [{"tg": "4", "ac": "appear"}],
                "fin": [3]
            },
            {
                "msg": "Casi terminamos. El 2 está multiplicando a la x, así que pasa al otro lado dividiendo.",
                "tgs": [{"tg": "5", "ac": "appear"}],
                "fin": [4]
            },
            {
                "msg": "Finalmente, 14 entre 2 es 7. ¡Ese es el valor de x!",
                // NOTA: Como el elemento 6 está en Y=600, tu Auto-Pan debería bajar la cámara automáticamente aquí.
                "tgs": [{"tg": "6", "ac": "appear"}, {"tg": "7", "ac": "appear"}], 
                "fin": [5]
            }
        ]
    },


]

const WHITEBOARD_MOCK_DATAs = [
    {
        "ig": "primero debemos saber que es el metodo de factorizacion por termino medio",
        "cont": [
            // [0] Polinomio Objetivo (300 - 50 = 250)
            {"type": "Latex", "cont": "15x^2 + 26xy + 8y^2", "x": 250, "y": 100, "status": "show"},
            
            // [1] Factores
            {"type": "Latex", "cont": "(3x+4y)(5x+2y)", "x": 250, "y": 200, "status": "hide"},
            
            // [2] Resultados parciales (Desplazados -50 respecto al anterior)
            {"type": "Latex", "cont": "15x^2", "x": 130, "y": 300, "status": "hide"},
            {"type": "Latex", "cont": "+6xy", "x": 210, "y": 300, "status": "hide"},
            {"type": "Latex", "cont": "+20xy", "x": 290, "y": 300, "status": "hide"},
            {"type": "Latex", "cont": "+8y^2", "x": 370, "y": 300, "status": "hide"},
            
            // [3] Resultado Final Sumado
            {"type": "Latex", "cont": "= 15x^2 + 26xy + 8y^2", "x": 250, "y": 400, "status": "hide"}
        ],
        "insts": [
            { "msg": "nuestro objetivo sera pasar un polinomio de esta forma", "tgs": [] },
            { "msg": "a esta otra forma, para ello veremos como es que este valor se transforma al anterior", "tgs": [{"tg": "1:(0-f)", "ac": "appear"}] },
            { "msg": "primero debemos multiplicar este factor", "tgs": [{"tg": "1:(0-6)", "ac": "resalt", "color": "#FCD34D"}] },
            { "msg": "con este otro, aplicando la propiedad distributiva , que consiste en multiplicar cada termino de uno con el del otro", "tgs": [{"tg": "1:(7-f)", "ac": "resalt", "color": "#4ADE80"}] },
            { "msg": "asi pues 3x por 5x da 15x al cuadrado", "tgs": [{"tg": "1:(1-2)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "1:(8-9)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "2:(0-f)", "ac": "appear"}], "fin":[2,3] },
            { "msg": "3x por 2y es 6xy", "tgs": [{"tg": "1:(1-2)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "1:(11-12)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "3:(0-f)", "ac": "appear"}], "fin":[4] },
            { "msg": "4y por 5x es 20xy", "tgs": [{"tg": "1:(4-5)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "1:(8-9)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "4:(0-f)", "ac": "appear"}], "fin":[5] },
            { "msg": "4y por 2y es 8y al cuadrado", "tgs": [{"tg": "1:(4-5)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "1:(11-12)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "5:(0-f)", "ac": "appear"}], "fin":[6] },
            { "msg": "Ahora si sumamos todo eso nos da este resultado, el cual es el mismo que teniamos originalmente", "tgs": [{"tg": "3:(0-f)", "ac": "appear"},{"tg":"0:(0-f)","ac":"resalt","color":""}], "fin":[7] },
            { "msg": "Perfecto ahora sabemos que simplemente es buscar nuemeros que cumplan con este patron jugando un poco con los valores", "tgs": [] }
        ]
    },
    {
        "ig": "Ahora resolvamos nuestro problema",
        "cont": [
            // [0] Problema Desordenado (280 - 50 = 230)
            {"type": "Latex", "cont": "9y^2+\\frac{25}{4}x^2z^2+15xyz", "x": 230, "y": 100, "status": "show"},
            
            // [1] Problema Ordenado
            {"type": "Latex", "cont": "9y^2+15xyz+\\frac{25}{4}x^2z^2", "x": 230, "y": 170, "status": "hide"},

            // --- COLUMNA IZQUIERDA (180 - 50 = 130) ---
            // [2] 3y arriba
            {"type": "Latex", "cont": "3y", "x": 230, "y": 250, "status": "hide"},
            // [3] 3y abajo
            {"type": "Latex", "cont": "3y", "x": 230, "y": 330, "status": "hide"},

            // --- COLUMNA DERECHA (380 - 50 = 330) ---
            // [4] 5/2xz arriba
            {"type": "Latex", "cont": "\\frac{5}{2}xz", "x": 430, "y": 250, "status": "hide"},
            // [5] 5/2xz abajo
            {"type": "Latex", "cont": "\\frac{5}{2}xz", "x": 430, "y": 330, "status": "hide"},

            // --- FLECHAS CRUZADAS (x: 230->180, toX: 380->330) ---
            // [6] Flecha: Izq Arriba -> Der Abajo
            {"type": "Flecha", "x": 280, "y": 280, "toX": 430, "toY": 360, "status": "hide"},
            // [7] Flecha: Izq Abajo -> Der Arriba
            {"type": "Flecha", "x": 280, "y": 350, "toX": 430, "toY": 280, "status": "hide"},

            // --- RESULTADOS MULTIPLICACIÓN (480 - 50 = 430) ---
            // [8] Resultado arriba
            {"type": "Latex", "cont": "\\frac{15}{2}xyz", "x": 530, "y": 270, "status": "hide"},
            // [9] Resultado abajo
            {"type": "Latex", "cont": "\\frac{15}{2}xyz", "x": 530, "y": 310, "status": "hide"},
            
            // [10] Suma central comprobación (557 - 50 = 507)
            {"type": "Latex", "cont": "= 15xyz", "x": 607, "y": 290, "status": "hide"},

            // [11] Marco para agrupar Fila 1 (x1: 170->120, x2: 440->390)
            {"type": "Marco", "x1": 220, "x2": 490, "y1": 250, "y2": 300, "status": "hide"}, 
            // [12] Marco para agrupar Fila 2
            {"type": "Marco", "x1": 220, "x2": 490, "y1": 330, "y2": 380, "status": "hide"},
            
            // [13] Copia de factores (100 - 50 = 50)
             {"type": "Latex", "cont": "(3y+\\frac{5}{2}xz)(3y+\\frac{5}{2}xz)", "x": 150, "y": 410, "status": "hide"},
            // [14] Resultado Final (380 - 50 = 330)
            {"type": "Latex", "cont": "=(3y+\\frac{5}{2}xz)^2", "x": 430, "y": 410, "status": "hide"}
        ],
        "insts": [
            { "msg": "Si lo comparamos con el modelo anterior notaremos que no esta en orden...", "tgs": [{"tg": "0:(5-f)", "ac": "resalt", "color": "#EF4444"}] },

            { "msg": "esta es la forma correcta por la que debemos empezar", "tgs": [{"tg": "1:(0-f)", "ac": "appear"}] },

            { "msg": "descomponemos el primer termino de la forma 3y por 3y", "tgs": [{"tg": "1:(0-3)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "2:(0-f)", "ac": "appear"}, {"tg": "3:(0-f)", "ac": "appear"}] },

            { "msg": "descomponemos el segundo termino de la forma 5 medios xz por 5 medios xz...", "tgs": [{"tg": "1:(11-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "4:(0-f)", "ac": "appear"}, {"tg": "5:(0-f)", "ac": "appear"}], "fin":[2] },

            { "msg": "ahora si multiplicamos estos dos extremos nos da 15 medios xyz", "tgs": [{"tg": "2:(0-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "5:(0-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "6:(0-f)", "ac": "appear"}, {"tg": "8:(0-f)", "ac": "appear"}], "fin":[3] },

            { "msg": "y multiplicando estos dos tambien nos da 15 medios xyz", "tgs": [{"tg": "3:(0-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "4:(0-f)", "ac": "resalt", "color": "#FCD34D"}, {"tg": "7:(0-f)", "ac": "appear"}, {"tg": "9:(0-f)", "ac": "appear"}],"fin":[4] },
            { "msg": "ahora si sumamos ambos productos vemos que efectivamente nos da el termino del medio", "tgs": [{"tg": "10:(0-f)", "ac": "appear"}, {"tg": "1:(5-10)", "ac": "resalt", "color": "#4ADE80"}], "fin":[5] },
            { "msg": "Bien ahora agrupamos los que seran nuestros factores , agarrando los extremos", "tgs": [{"tg": "11:(0-f)", "ac": "appear"}, {"tg": "12:(0-f)", "ac": "appear"}, {"tg": "13:(0-f)", "ac": "appear"}], "fin":[6] }, 
            { "msg": "nos damos cuenta que se trata de un binomio al cuadrado...", "tgs": [{"tg": "14:(0-f)", "ac": "appear", "color": "#4ADE80"}] }
        ]
    }
];
[
  {
    "ig": "Ecuación Lineal Simple",
    "cont": [
      { "type": "Latex", "cont": "3x+5=20", "x": 400, "y": 100, "status": "hide" },
      { "type": "Latex", "cont": "3x=20-5", "x": 400, "y": 180, "status": "hide" },
      { "type": "Latex", "cont": "3x=15", "x": 400, "y": 260, "status": "hide" },
      { "type": "Latex", "cont": "x=15/3", "x": 400, "y": 340, "status": "hide" },
      { "type": "Latex", "cont": "x=5", "x": 400, "y": 420, "status": "hide" }
    ],
    "insts": [
      {
        "msg": "Tenemos la ecuación. El objetivo es despejar la x.",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Identificamos el +5 que está sumando.",
        "tgs": [
          { "tg": "0:(2-4)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Pasamos el 5 al otro lado restando (inverso aditivo).",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "dim" },
          { "tg": "1:(0-f)", "ac": "appear" },
          { "tg": "1:(5-7)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Resolvemos la resta: 20 menos 5 es 15.",
        "tgs": [
          { "tg": "1:(0-f)", "ac": "dim" },
          { "tg": "2:(0-f)", "ac": "appear" },
          { "tg": "2:(3-5)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      },
      {
        "msg": "El 3 multiplica a la x, así que pasa dividiendo.",
        "tgs": [
          { "tg": "2:(0-f)", "ac": "dim" },
          { "tg": "3:(0-f)", "ac": "appear" },
          { "tg": "3:(5-6)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Dividimos 15 entre 3. ¡Resultado final!",
        "tgs": [
          { "tg": "3:(0-f)", "ac": "dim" },
          { "tg": "4:(0-f)", "ac": "appear" },
          { "tg": "4:(0-f)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": []
      }
    ]
  }
]
[
  {
    "ig": "Trinomio Cuadrado Perfecto",
    "cont": [
      { "type": "Latex", "cont": "x^2+6x+9", "x": 400, "y": 100, "status": "hide" },
      { "type": "Latex", "cont": "x \\quad\\quad 3", "x": 400, "y": 180, "status": "hide" },
      { "type": "Latex", "cont": "2(x)(3)=6x", "x": 400, "y": 260, "status": "hide" },
      { "type": "Flecha", "x": 450, "y": 250, "toX": 450, "toY": 130, "status": "hide" },
      { "type": "Latex", "cont": "(x+3)^2", "x": 400, "y": 340, "status": "hide" }
    ],
    "insts": [
      {
        "msg": "Identificamos el trinomio. Para ser 'Perfecto', analizamos los extremos.",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Verificamos si el primer y último término tienen raíz cuadrada exacta.",
        "tgs": [
          { "tg": "0:(0-3)", "ac": "resalt", "color": "#FCD34D" }, 
          { "tg": "0:(6-8)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "Extraemos las bases: la raíz de x² es 'x' y la de 9 es '3'.",
        "tgs": [
          { "tg": "0:(0-f)", "ac": "dim" },
          { "tg": "1:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "La regla de oro: El doble del primero por el segundo debe dar el término central.",
        "tgs": [
          { "tg": "1:(0-f)", "ac": "dim" },
          { "tg": "2:(0-f)", "ac": "appear" },
          { "tg": "2:(0-7)", "ac": "resalt", "color": "#FCD34D" }
        ],
        "fin": []
      },
      {
        "msg": "¡Coincide! 6x es igual al término central original. Es un TCP.",
        "tgs": [
          { "tg": "2:(8-10)", "ac": "resalt", "color": "#4ADE80" },
          { "tg": "0:(3-5)", "ac": "resalt", "color": "#4ADE80" },
          { "tg": "3:(0-f)", "ac": "appear" }
        ],
        "fin": []
      },
      {
        "msg": "Factorizamos: Sumamos las bases y elevamos al cuadrado.",
        "tgs": [
          { "tg": "2:(0-f)", "ac": "dim" },
          { "tg": "3:(0-f)", "ac": "disappear" },
          { "tg": "4:(0-f)", "ac": "appear" },
          { "tg": "4:(0-f)", "ac": "resalt", "color": "#4ADE80" }
        ],
        "fin": [3]
      }
    ]
  }
]

{'escenas': [{'ig': 'Ecuación Exponencial: 9^x - 4 \\cdot 3^x + 3 = 0', 'cont': [{'type': 'Latex', 'cont': '9^x - 4 \\cdot 3^x + 3 = 0', 'x': 350, 'y': 100, 'status': 'show'}, {'type': 'Latex', 'cont': '(3^2)^x - 4 \\cdot 3^x + 3 = 0', 'x': 350, 'y': 180, 'status': 'hide'}, {'type': 'Latex', 'cont': '(3^x)^2 - 4 \\cdot 3^x + 3 = 0', 'x': 350, 'y': 260, 'status': 'hide'}, {'type': 'Latex', 'cont': 'u = 3^x', 'x': 750, 'y': 340, 'status': 'hide'}, {'type': 'Latex', 'cont': 'u^2 - 4u + 3 = 0', 'x': 350, 'y': 340, 'status': 'hide'}, {'type': 'Latex', 'cont': '(u-3)(u-1) = 0', 'x': 350, 'y': 420, 'status': 'hide'}, {'type': 'Latex', 'cont': 'u_1 = 3, \\quad u_2 = 1', 'x': 350, 'y': 500, 'status': 'hide'}, {'type': 'Latex', 'cont': '3^x = 3 \\implies x = 1', 'x': 350, 'y': 580, 'status': 'hide'}, {'type': 'Latex', 'cont': '3^x = 1 \\implies x = 0', 'x': 350, 'y': 660, 'status': 'hide'}], 'resources': [{'step': 1, 'title': 'Potencia de Potencia', 'tex': '(a^n)^m = a^{n \\cdot m}'}, {'step': 3, 'title': 'Cambio de Variable', 'tex': 'u = f(x)'}, {'step': 5, 'title': 'Factorización', 'tex': 'x^2 + bx + c = (x-p)(x-q)'}], 'insts': [{'msg': 'Partimos de la ecuación exponencial original.', 'tgs': [{'tg': '0:(0-f)', 'ac': 'appear'}], 'fin': [0]}, {'msg': 'Expresamos 9 como una potencia de base 3.', 'tgs': [{'tg': '0:(0-f)', 'ac': 'dim'}, {'tg': '0:(0-3)', 'ac': 'resalt', 'color': '#FCD34D'}, {'tg': '1:(0-f)', 'ac': 'appear'}, {'tg': '1:(0-7)', 'ac': 'resalt', 'color': '#FCD34D'}], 'fin': [1]}, {'msg': 'Intercambiamos los exponentes usando las propiedades de las potencias.', 'tgs': [{'tg': '1:(0-f)', 'ac': 'dim'}, {'tg': '1:(0-7)', 'ac': 'resalt', 'color': '#FCD34D'}, {'tg': '2:(0-f)', 'ac': 'appear'}, {'tg': '2:(0-7)', 'ac': 'resalt', 'color': '#FCD34D'}], 'fin': [2]}, {'msg': 'Definimos un cambio de variable para simplificar la ecuación.', 'tgs': [{'tg': '2:(0-f)', 'ac': 'dim'}, {'tg': '2:(1-4)', 'ac': 'resalt', 'color': '#FCD34D'}, {'tg': '2:(14-17)', 'ac': 'resalt', 'color': '#FCD34D'}, {'tg': '3:(0-f)', 'ac': 'appear'}], 'fin': [3]}, {'msg': 'Sustituimos y obtenemos una ecuación de segundo grado.', 'tgs': [{'tg': '3:(0-f)', 'ac': 'dim'}, {'tg': '4:(0-f)', 'ac': 'appear'}, {'tg': '4:(0-3)', 'ac': 'resalt', 'color': '#4ADE80'}, {'tg': '4:(6-8)', 'ac': 'resalt', 'color': '#4ADE80'}], 'fin': [4]}, {'msg': 'Factorizamos el trinomio buscando dos números que sumen -4 y multipliquen 3.', 'tgs': [{'tg': '4:(0-f)', 'ac': 'dim'}, {'tg': '5:(0-f)', 'ac': 'appear'}], 'fin': [5]}, {'msg': 'Resolvemos para u igualando cada factor a cero.', 'tgs': [{'tg': '5:(0-f)', 'ac': 'dim'}, {'tg': '6:(0-f)', 'ac': 'appear'}], 'fin': [6]}, {'msg': 'Deshacemos el cambio de variable para la primera solución.', 'tgs': [{'tg': '6:(0-7)', 'ac': 'resalt', 'color': '#FCD34D'}, {'tg': '7:(0-f)', 'ac': 'appear'}, {'tg': '7:(18-23)', 'ac': 'resalt', 'color': '#4ADE80'}], 'fin': [7]}, {'msg': 'Deshacemos el cambio para la segunda solución.', 'tgs': [{'tg': '6:(16-23)', 'ac': 'resalt', 'color': '#FCD34D'}, {'tg': '8:(0-f)', 'ac': 'appear'}, {'tg': '8:(18-23)', 'ac': 'resalt', 'color': '#4ADE80'}], 'fin': [8]}]}]}