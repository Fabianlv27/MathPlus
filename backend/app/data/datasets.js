[
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

const WHITEBOARD_MOCK_DATA = [
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