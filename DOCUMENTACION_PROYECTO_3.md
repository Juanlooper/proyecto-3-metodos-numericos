# PROYECTO 3 — MÉTODOS NUMÉRICOS: INTEGRACIÓN NUMÉRICA (TRAPECIO SIMPLE Y SIMPSON 1/3 SIMPLE)

Este documento reúne los **tres entregables escritos** solicitados para el laboratorio:
1. **Parte I:** Informe Escrito Completo (siguiendo estrictamente la estructura oficial de la guía).
2. **Parte II:** Explicación General y Técnica del Funcionamiento del Código en JavaScript.
3. **Parte III:** Guion Detallado por Persona para la Exposición y Demostración en Video (Teams con cámara encendida).

---

# PARTE I: INFORME ESCRITO COMPLETO

## 1. Hoja de Presentación

<div align="center">

### UNIVERSIDAD
**FACULTAD DE INGENIERÍA**
**CARRERA DE INGENIERÍA EN SISTEMAS COMPUTACIONALES**

---

### ASIGNATURA:
**MÉTODOS NUMÉRICOS**

### PROYECTO N.° 3:
**MÉTODO DE INTEGRACIÓN NUMÉRICA (MÉTODO DEL TRAPECIO SIMPLE Y MÉTODO DE SIMPSON 1/3 SIMPLE) APLICADO AL MONITOREO DE TRANSFERENCIA DE DATOS EN UN SERVIDOR CLOUD**

---

### INTEGRANTES DEL GRUPO Y ROLES:
- **Nicole Caceres** — *Informe y Demostración Matemática Paso a Paso*
- **Juan Rodriguez** — *Presentación Estructurada (PPT) y Análisis Geométrico*
- **Miguel Oliver** — *Representación del Método en Computadora (JavaScript + React)*

---

### FECHA DE EXPOSICIÓN Y ENTREGA:
**Viernes 13 de noviembre**

</div>

---

## 2. Índice

1. [Hoja de Presentación](#1-hoja-de-presentación)
2. [Índice](#2-índice)
3. [Introducción](#3-introducción)
4. [Contenido](#4-contenido)
   - 4.1. [Marco Teórico: Fórmulas de Integración de Newton-Cotes](#41-marco-teórico-fórmulas-de-integración-de-newton-cotes)
   - 4.2. [Método del Trapecio Simple y su Error](#42-método-del-trapecio-simple-y-su-error)
   - 4.3. [Método de Simpson 1/3 Simple y su Error](#43-método-de-simpson-13-simple-y-su-error)
   - 4.4. [Planteamiento del Problema de la Vida Real (Ingeniería en Sistemas)](#44-planteamiento-del-problema-de-la-vida-real-ingeniería-en-sistemas)
   - 4.5. [Demostración Paso a Paso de los Métodos y Aplicación del Error](#45-demostración-paso-a-paso-de-los-métodos-y-aplicación-del-error)
   - 4.6. [Respuestas a las Preguntas según el Planteamiento del Problema](#46-respuestas-a-las-preguntas-según-el-planteamiento-del-problema)
5. [Código Fuente con Comentarios](#5-código-fuente-con-comentarios)
6. [Conclusión](#6-conclusión)
7. [Bibliografía y Webgrafía](#7-bibliografía-y-webgrafía)

---

## 3. Introducción

En el ámbito de la **Ingeniería en Sistemas Computacionales**, es sumamente frecuente enfrentarse a magnitudes físicas y operativas que varían continuamente con respecto al tiempo: el tráfico de paquetes en una interfaz de red, la tasa de lectura/escritura en arreglos de discos (IOPS), el consumo de potencia eléctrica en un centro de datos o la frecuencia de peticiones concurrentes hacia un clúster de microservicios. Para conocer el volumen total acumulado en un intervalo de tiempo $[a, b]$, el cálculo diferencial e integral establece que debemos resolver la integral definida:

$$I = \int_{a}^{b} f(t)\,dt$$

Sin embargo, en sistemas de monitoreo en producción y telemetría de servidores, rara vez se dispone de una antiderivada elemental cerrada o bien la función proviene de modelos empíricos complejos difíciles de integrar analíticamente en tiempo real. Es aquí donde los **Métodos de Integración Numérica** (también denominados *cuadratura numérica*) cobran vital importancia.

En este proyecto investigamos, demostramos paso a paso y programamos en **JavaScript** (tanto en consola de comandos como en una plataforma visual interactiva con **Vite + React**) las dos fórmulas cerradas fundamentales de Newton-Cotes: el **Método del Trapecio Simple** (basado en interpolación lineal de primer grado) y el **Método de Simpson 1/3 Simple** (basado en interpolación parabólica de segundo grado). Ambos métodos se aplican a un problema real de Ingeniería en Sistemas: la estimación del volumen total de datos transferidos en Gigabytes ($\text{GB}$) durante una ventana crítica de respaldo (*backup*) de $4\text{ horas}$ en un servidor Cloud, analizando rigurosamente tanto el **Error Verdadero** como el **Error de Truncamiento Teórico**.

---

## 4. Contenido

### 4.1. Marco Teórico: Fórmulas de Integración de Newton-Cotes

Las fórmulas de **Newton-Cotes** son los esquemas más comunes de integración numérica. Se basan en la estrategia de reemplazar una función complicada $f(x)$ (o datos tabulados) por un polinomio de aproximación $P_n(x)$ de grado $n$ que sea fácil de integrar:

$$I = \int_{a}^{b} f(x)\,dx \approx \int_{a}^{b} P_n(x)\,dx$$

Donde $P_n(x)$ es un polinomio interpolador de Lagrange que coincide con $f(x)$ en $n + 1$ nodos igualmente espaciados dentro del intervalo $[a, b]$.

---

### 4.2. Método del Trapecio Simple y su Error

El **Método del Trapecio Simple** corresponde al caso $n = 1$ de las fórmulas de Newton-Cotes. Sustituye la curva original $f(x)$ en el intervalo $[a, b]$ por un polinomio de primer grado (una línea recta secante) que une los puntos extremos $(a, f(a))$ y $(b, f(b))$:

$$P_1(x) = f(a) + \frac{f(b) - f(a)}{b - a}(x - a)$$

El área bajo esta línea recta forma geométricamente un trapecio cuya base es el ancho del intervalo $h = b - a$ y cuyas alturas son $f(a)$ y $f(b)$:

$$I_{\text{trapecio}} \approx (b - a)\,\frac{f(a) + f(b)}{2}$$

#### Error de Truncamiento del Trapecio Simple ($E_t$)
Al aproximar una curva mediante una recta, se comete un error local de truncamiento dado por el término residual de la serie de Taylor / interpolación de Lagrange:

$$E_{t,\text{trapecio}} = -\frac{(b - a)^3}{12}\,f''(\xi), \quad \text{para algún } \xi \in (a, b)$$

- Si la función es lineal ($f''(x) = 0$), el método del Trapecio Simple es **exacto** ($E_t = 0$).
- Si la función tiene concavidad hacia arriba ($f''(x) > 0$), la cuerda secante queda por encima de la curva y el método **sobreestima** el valor real de la integral.

---

### 4.3. Método de Simpson 1/3 Simple y su Error

Una forma de obtener una estimación mucho más exacta de una integral consiste en usar polinomios de grado superior para unir los puntos. El **Método de Simpson 1/3 Simple** corresponde al caso $n = 2$: divide el intervalo $[a, b]$ en $2$ subintervalos iguales de ancho:

$$h = \frac{b - a}{2}$$

Esto define tres nodos equidistantes:
- $x_0 = a$ (extremo izquierdo)
- $x_1 = a + h = \frac{a + b}{2}$ (punto medio)
- $x_2 = b$ (extremo derecho)

Por estos tres puntos $(x_0, f(x_0))$, $(x_1, f(x_1))$ y $(x_2, f(x_2))$ se hace pasar un **polinomio interpolador de Lagrange de segundo grado (una parábola)** $P_2(x)$. Al integrar analíticamente dicho polinomio desde $x_0$ hasta $x_2$, se obtiene la **Regla de Simpson 1/3 Simple**:

$$I_{\text{simpson}} \approx \frac{h}{3}\left[f(x_0) + 4f(x_1) + f(x_2)\right] = \frac{b - a}{6}\left[f(a) + 4f\!\left(\frac{a+b}{2}\right) + f(b)\right]$$

#### Error de Truncamiento de Simpson 1/3 Simple ($E_t$)
Sorprendentemente, aunque la regla de Simpson 1/3 se deduce integrando una parábola (grado 2), el término de tercer orden se cancela por simetría en el punto medio, haciendo que su error de truncamiento dependa de la **cuarta derivada**:

$$E_{t,\text{simpson}} = -\frac{(b - a)^5}{2880}\,f^{(4)}(\xi) = -\frac{h^5}{90}\,f^{(4)}(\xi), \quad \xi \in (a, b)$$

Esto significa que Simpson 1/3 Simple proporciona resultados **100% exactos** ($E_t = 0$) no solo para parábolas, sino también para **polinomios cúbicos (grado 3)**.

---

### 4.4. Planteamiento del Problema de la Vida Real (Ingeniería en Sistemas)

#### Contexto Operativo
En el centro de datos de una empresa de servicios financieros, el equipo de **Ingeniería en Sistemas e Infraestructura Cloud** programa una ventana nocturna de respaldo distribuido (*backup*) que tiene una duración de **$4\text{ horas}$**, comprendida desde $t = 0\text{ horas}$ hasta $t = 4\text{ horas}$.

Durante esta ventana, el sistema de monitoreo de red registra que la **tasa de transferencia de datos** $R(t)$, medida en **Gigabytes por hora ($\text{GB/h}$)**, sigue el comportamiento modelado por la función:

$$R(t) = 0.5t^4 - 2t^3 + 4t^2 + 12 \quad \left[\text{GB/h}\right]$$

Al inicio ($t = 0$), el servidor transmite una carga base de $12\text{ GB/h}$. Hacia la mitad del proceso ($t = 2\text{ h}$), la compresión estabiliza el flujo en $20\text{ GB/h}$, y en el tramo final ($t = 4\text{ h}$) se produce una ráfaga intensiva de volcado de bases de datos que alcanza los $76\text{ GB/h}$.

El administrador de infraestructura ha reservado un **buffer de almacenamiento temporal SSD de $120\text{ GB}$** en el nodo receptor y necesita determinar el **volumen total de datos transferidos ($V$)** durante las $4\text{ horas}$:

$$V = \int_{0}^{4} \left(0.5t^4 - 2t^3 + 4t^2 + 12\right) dt$$

#### Preguntas del Planteamiento del Problema
1. **¿Cuál es el volumen real (exacto) de datos transferidos durante las 4 horas de respaldo?**
2. **¿Qué volumen estima cada método numérico (Trapecio Simple vs. Simpson 1/3 Simple) y cuál aproxima mejor el comportamiento del tráfico de red?**
3. **Si el servidor tiene un buffer de almacenamiento temporal reservado de $120\text{ GB}$ para el backup, ¿qué decisión de infraestructura se tomaría con cada método?**

---

### 4.5. Demostración Paso a Paso de los Métodos y Aplicación del Error

#### A. Cálculo del Valor Exacto (Solución Analítica de Referencia)
Integramos término a término la función $R(t) = 0.5t^4 - 2t^3 + 4t^2 + 12$ en $[0, 4]$:

$$I_{\text{exacta}} = \int_{0}^{4} \left(0.5t^4 - 2t^3 + 4t^2 + 12\right) dt = \left[ 0.5\frac{t^5}{5} - 2\frac{t^4}{4} + 4\frac{t^3}{3} + 12t \right]_{0}^{4}$$

$$I_{\text{exacta}} = \left[ 0.1t^5 - 0.5t^4 + \frac{4}{3}t^3 + 12t \right]_{0}^{4}$$

Evaluando en $t = 4$ (en $t = 0$ todos los términos valen $0$):
- $0.1(4)^5 = 0.1(1024) = 102.4$
- $-0.5(4)^4 = -0.5(256) = -128$
- $\frac{4}{3}(4)^3 = \frac{4}{3}(64) = \frac{256}{3} \approx 85.3333$
- $12(4) = 48$

$$I_{\text{exacta}} = 102.4 - 128 + 85.3333 + 48 = \frac{1616}{15} \approx \mathbf{107.7333\text{ GB}}$$

---

#### B. Demostración Paso a Paso: Método del Trapecio Simple

- **Paso 1: Identificar los límites y el ancho del intervalo**
  $$a = 0, \quad b = 4 \implies b - a = 4 - 0 = 4\text{ horas}$$

- **Paso 2: Evaluar la función $R(t)$ en los extremos $a$ y $b$**
  $$R(0) = 0.5(0)^4 - 2(0)^3 + 4(0)^2 + 12 = \mathbf{12\text{ GB/h}}$$
  $$R(4) = 0.5(4)^4 - 2(4)^3 + 4(4)^2 + 12 = 128 - 128 + 64 + 12 = \mathbf{76\text{ GB/h}}$$

- **Paso 3: Sustituir en la fórmula del Trapecio Simple**
  $$I_{\text{trapecio}} = (b - a)\,\frac{R(a) + R(b)}{2} = (4)\,\frac{12 + 76}{2} = 4 \times \frac{88}{2} = 4 \times 44 = \mathbf{176\text{ GB}}$$

- **Paso 4: Aplicación del Error en el Método del Trapecio Simple**
  1. **Error Verdadero Absoluto ($|E_v|$):**
     $$|E_v| = |I_{\text{exacta}} - I_{\text{trapecio}}| = |107.7333 - 176.0000| = \mathbf{68.2667\text{ GB}}$$
  2. **Error Relativo Porcentual ($\varepsilon_t$):**
     $$\varepsilon_t = \left|\frac{107.7333 - 176.0000}{107.7333}\right| \times 100\% = \mathbf{63.37\%}$$
  3. **Error de Truncamiento Estimado ($E_t$):**
     Calculamos las primeras dos derivadas de $R(t)$:
     $$R'(t) = 2t^3 - 6t^2 + 8t \implies R''(t) = 6t^2 - 12t + 8$$
     El valor medio de la segunda derivada en $[0, 4]$ es:
     $$\overline{R''} = \frac{R'(4) - R'(0)}{4 - 0} = \frac{\left[2(64) - 6(16) + 8(4)\right] - 0}{4} = \frac{128 - 96 + 32}{4} = \frac{64}{4} = 16$$
     Sustituyendo en la fórmula de truncamiento:
     $$E_{t,\text{trapecio}} = -\frac{(b - a)^3}{12}\,\overline{R''} = -\frac{4^3}{12}(16) = -\frac{64 \times 16}{12} = \mathbf{-85.3333\text{ GB}}$$

---

#### C. Demostración Paso a Paso: Método de Simpson 1/3 Simple

- **Paso 1: Calcular el tamaño de paso $h$ y definir los 3 nodos ($n = 2$)**
  $$h = \frac{b - a}{2} = \frac{4 - 0}{2} = \mathbf{2\text{ horas}}$$
  $$t_0 = 0, \quad t_1 = 2, \quad t_2 = 4$$

- **Paso 2: Evaluar la función $R(t)$ en los tres nodos**
  - En $t_0 = 0$: $R(0) = \mathbf{12\text{ GB/h}}$
  - En $t_1 = 2$:
    $$R(2) = 0.5(2)^4 - 2(2)^3 + 4(2)^2 + 12 = 0.5(16) - 2(8) + 4(4) + 12 = 8 - 16 + 16 + 12 = \mathbf{20\text{ GB/h}}$$
  - En $t_2 = 4$: $R(4) = \mathbf{76\text{ GB/h}}$

- **Paso 3: Sustituir en la fórmula de Simpson 1/3 Simple**
  $$I_{\text{simpson}} = \frac{h}{3}\left[R(t_0) + 4R(t_1) + R(t_2)\right]$$
  $$I_{\text{simpson}} = \frac{2}{3}\left[12 + 4(20) + 76\right] = \frac{2}{3}\left[12 + 80 + 76\right] = \frac{2}{3}(168) = 2 \times 56 = \mathbf{112\text{ GB}}$$

- **Paso 4: Aplicación del Error en el Método de Simpson 1/3 Simple**
  1. **Error Verdadero Absoluto ($|E_v|$):**
     $$|E_v| = |I_{\text{exacta}} - I_{\text{simpson}}| = |107.7333 - 112.0000| = \mathbf{4.2667\text{ GB}}$$
  2. **Error Relativo Porcentual ($\varepsilon_t$):**
     $$\varepsilon_t = \left|\frac{107.7333 - 112.0000}{107.7333}\right| \times 100\% = \mathbf{3.96\%}$$
  3. **Error de Truncamiento Teórico ($E_t$):**
     Hallamos las derivadas sucesivas hasta el cuarto orden:
     - $R'(t) = 2t^3 - 6t^2 + 8t$
     - $R''(t) = 6t^2 - 12t + 8$
     - $R'''(t) = 12t - 12$
     - $R^{(4)}(t) = \mathbf{12}$ (constante en todo el intervalo)

     Sustituyendo en la fórmula de error de truncamiento de Simpson 1/3:
     $$E_{t,\text{simpson}} = -\frac{(b - a)^5}{2880}\,R^{(4)}(\xi) = -\frac{4^5}{2880}(12) = -\frac{1024 \times 12}{2880} = -\frac{12288}{2880} = \mathbf{-4.2667\text{ GB}}$$

  4. **Comprobación Exacta ($I_{\text{simpson}} + E_t = I_{\text{exacta}}$):**
     $$112.0000\text{ GB} + (-4.2667\text{ GB}) = \mathbf{107.7333\text{ GB}} = I_{\text{exacta}}$$
     Se comprueba que el término de error de truncamiento explica con exactitud milimétrica la diferencia entre el método numérico y la integral analítica.

---

#### D. Tabla Resumen Comparativa

| Métrica / Parámetro | Valor Exacto Analítico | Método del Trapecio Simple | Método de Simpson 1/3 Simple |
| :--- | :---: | :---: | :---: |
| **Grado del Polinomio** | Continuo (Grado 4) | Grado 1 (Recta) | Grado 2 (Parábola) |
| **Nodos Utilizados** | Infinitos | $2$ nodos: $(0, 12)$ y $(4, 76)$ | $3$ nodos: $(0, 12), (2, 20), (4, 76)$ |
| **Volumen Estimado ($I$)** | **$107.7333\text{ GB}$** | **$176.0000\text{ GB}$** | **$112.0000\text{ GB}$** |
| **Error Verdadero Absoluto ($|E_v|$)** | $0.0000\text{ GB}$ | $68.2667\text{ GB}$ | $4.2667\text{ GB}$ |
| **Error Relativo Porcentual ($\varepsilon_t$)** | $0.00\%$ | **$63.37\%$** | **$3.96\%$** |
| **Error de Truncamiento ($E_t$)** | $0.0000\text{ GB}$ | $-85.3333\text{ GB}$ | $-4.2667\text{ GB}$ |

---

### 4.6. Respuestas a las Preguntas según el Planteamiento del Problema

1. **¿Cuál es el volumen real (exacto) de datos transferidos durante las 4 horas de respaldo?**
   - **Respuesta:** El volumen real transferido por el servidor durante las 4 horas de ventana de backup es de **$107.7333\text{ GB}$** (equivalente a la fracción exacta $\frac{1616}{15}\text{ GB}$).

2. **¿Qué volumen estima cada método numérico y cuál aproxima mejor el comportamiento del tráfico?**
   - **Respuesta:** El **Método del Trapecio Simple** estima **$176.0000\text{ GB}$**, presentando un error relativo muy elevado del **$63.37\%$** debido a que traza una línea recta directa desde $R(0)=12$ hasta $R(4)=76$, ignorando que durante las primeras dos horas la transferencia se mantuvo baja cerca de $20\text{ GB/h}$. Por su parte, el **Método de Simpson 1/3 Simple** estima **$112.0000\text{ GB}$**, con un error relativo de apenas **$3.96\%$**. Simpson 1/3 aproxima **16 veces mejor** el tráfico real gracias a que incorpora el nodo central $R(2)=20\text{ GB/h}$ mediante una parábola ponderada.

3. **Si el servidor tiene un buffer de almacenamiento temporal reservado de $120\text{ GB}$ para el backup, ¿qué decisión de infraestructura se tomaría con cada método?**
   - **Respuesta:**
     - Si el ingeniero se basara en el **Trapecio Simple ($176\text{ GB} > 120\text{ GB}$)**, concluiría erróneamente que habrá un desbordamiento de memoria (*buffer overflow*) por un supuesto déficit de $56\text{ GB}$, desencadenando compras o aprovisionamiento innecesario de volúmenes Cloud adicionales.
     - Si el ingeniero utiliza **Simpson 1/3 Simple ($112\text{ GB} < 120\text{ GB}$)**, toma la decisión correcta: certifica que el buffer de $120\text{ GB}$ es completamente capaz de almacenar el respaldo completo, dejando un margen de seguridad estimado de $8\text{ GB}$ ($12.27\text{ GB}$ reales).

---

## 5. Código Fuente con Comentarios

El código completo de terminal se encuentra en [cli/integracion_terminal.js](file:///c:/Users/jrdri/Documents/Proyecto%203%20metodos%20num%C3%A9ricos/cli/integracion_terminal.js) y el motor compartido de la interfaz web en [src/utils/mathEngine.js](file:///c:/Users/jrdri/Documents/Proyecto%203%20metodos%20num%C3%A9ricos/src/utils/mathEngine.js). A continuación se presenta el núcleo algorítmico documentado:

```javascript
/**
 * MÉTODO DEL TRAPECIO SIMPLE
 * Aproxima la integral definida de f(x) en [a, b] usando un segmento lineal entre (a, f(a)) y (b, f(b)).
 * Fórmula: I ≈ (b - a) * [f(a) + f(b)] / 2
 * Error de truncamiento: Et = -((b - a)^3 / 12) * f''(ξ)
 */
export function metodoTrapecioSimple(fn, a, b) {
  const h = b - a;                  // Ancho total del intervalo [a, b]
  const fa = fn(a);                 // Evaluación en el límite inferior
  const fb = fn(b);                 // Evaluación en el límite superior
  const sumaExtremos = fa + fb;     // Suma de las bases del trapecio
  const promedioAlturas = sumaExtremos / 2;
  const integral = h * promedioAlturas;

  // Estimación de f''(ξ) promedio y cálculo del Error de Truncamiento
  const segundaDerivadaMedia = estimarSegundaDerivadaMedia(fn, a, b);
  const errorTruncamiento = -((Math.pow(b - a, 3) / 12) * segundaDerivadaMedia);

  return { h, fa, fb, integral, errorTruncamiento };
}

/**
 * MÉTODO DE SIMPSON 1/3 SIMPLE
 * Divide [a, b] en n = 2 subintervalos iguales de paso h = (b - a) / 2,
 * interpolando una parábola sobre los 3 nodos (x0, x1, x2).
 * Fórmula: I ≈ (h / 3) * [f(x0) + 4*f(x1) + f(x2)]
 * Error de truncamiento: Et = -((b - a)^5 / 2880) * f^(4)(ξ)
 */
export function metodoSimpsonUnTercioSimple(fn, a, b) {
  const n = 2;                      // Número de subintervalos fijo para Simpson 1/3 Simple
  const h = (b - a) / n;            // Tamaño de paso h
  const x0 = a;                     // Nodo inicial
  const x1 = (a + b) / 2;           // Nodo central (punto medio)
  const x2 = b;                     // Nodo final

  const fx0 = fn(x0);               // Evaluación en x0
  const fx1 = fn(x1);               // Evaluación en punto medio x1 (peso 4)
  const fx2 = fn(x2);               // Evaluación en x2

  const sumaPonderada = fx0 + 4 * fx1 + fx2;
  const integral = (h / 3) * sumaPonderada;

  // Estimación de la cuarta derivada f^(4)(ξ) y Error de Truncamiento
  const cuartaDerivadaMedia = estimarCuartaDerivada(fn, a, b);
  const errorTruncamiento = -((Math.pow(b - a, 5) / 2880) * cuartaDerivadaMedia);

  return { h, x0, x1, x2, fx0, fx1, fx2, sumaPonderada, integral, errorTruncamiento };
}
```

---

## 6. Conclusión

1. **Superioridad del Ajuste Parabólico sobre el Lineal:** Con apenas evaluar un nodo adicional en el centro del intervalo ($x_1 = \frac{a+b}{2}$), el **Método de Simpson 1/3 Simple** redujo el error relativo porcentual de **$63.37\%$** (obtenido con el Trapecio Simple) a tan solo **$3.96\%$** en nuestro caso de monitoreo de red. Esto demuestra cómo el paso de una aproximación de primer orden a una de segundo orden captura la curvatura real de los fenómenos físicos e informáticos.
2. **Importancia del Análisis del Error de Truncamiento:** Se demostró analítica y computacionalmente que el error de truncamiento de Simpson 1/3 depende de la cuarta derivada dividida entre $2880$ ($E_t = -\frac{(b-a)^5}{2880}f^{(4)}(\xi)$). En nuestro modelo de cuarto grado, donde $R^{(4)}(t) = 12$, el error teórico calculado ($-4.2667\text{ GB}$) coincidió exactamente con el error verdadero, verificándose la identidad $I_{\text{aprox}} + E_t = I_{\text{exacta}}$ ($112 - 4.2667 = 107.7333\text{ GB}$).
3. **Impacto en Ingeniería en Sistemas:** La elección de un método numérico adecuado impacta directamente las decisiones de arquitectura y dimensionamiento de recursos (*capacity planning*). Un método con alto error de truncamiento como el Trapecio Simple en intervalos amplios puede inducir falsas alarmas de saturación de almacenamiento o red, mientras que Simpson 1/3 ofrece estimaciones confiables con un costo computacional mínimo de solo tres evaluaciones funcionales.

---

## 7. Bibliografía y Webgrafía

1. **Chapra, S. C., & Canale, R. P.** (2015). *Métodos Numéricos para Ingenieros* (7.ª ed.). McGraw-Hill Education. (Capítulo 21: Fórmulas de integración de Newton-Cotes, pp. 621–648).
2. **Burden, R. L., & Faires, J. D.** (2011). *Análisis Numérico* (9.ª ed.). Cengage Learning. (Capítulo 4: Diferenciación e integración numérica).
3. **Mathews, J. H., & Fink, K. D.** (2000). *Métodos Numéricos con MATLAB* (3.ª ed.). Prentice Hall.
4. **MDN Web Docs — Mozilla.** (2026). *JavaScript Math Standard Built-in Object & Readline API*. Recuperado de https://developer.mozilla.org/es/docs/Web/JavaScript

---
---

# PARTE II: EXPLICACIÓN GENERAL Y TÉCNICA DEL FUNCIONAMIENTO DEL CÓDIGO EN JAVASCRIPT

Esta sección explica detalladamente cómo está construido el software para que cualquier integrante pueda responder preguntas técnicas del profesor sobre el código.

## 1. Arquitectura Dual del Proyecto

El proyecto cuenta con dos entornos sincronizados en JavaScript moderno (ES Modules):
1. **Aplicación Interactiva de Terminal ([`cli/integracion_terminal.js`](file:///c:/Users/jrdri/Documents/Proyecto%203%20metodos%20num%C3%A9ricos/cli/integracion_terminal.js)):** Ejecutable con `npm run terminal` (o `node cli/integracion_terminal.js --demo`). Utiliza el módulo nativo `node:readline/promises` para presentar un menú en consola con 4 opciones:
   - Opción 1: Cargar automáticamente los datos del problema del servidor Cloud ($R(t) = 0.5t^4 - 2t^3 + 4t^2 + 12$ en $[0, 4]$).
   - Opción 2: Introducir cualquier función $f(x)$ y límites $[a, b]$ por teclado.
   - Opción 3: Ejecutar una batería automática de 9 casos de prueba de control de errores.
   - Opción 4: Salir.
2. **Plataforma Web Animada con Vite + React ([`src/App.jsx`](file:///c:/Users/jrdri/Documents/Proyecto%203%20metodos%20num%C3%A9ricos/src/App.jsx)):** Ejecutable con `npm run dev`. Renderiza animaciones geométricas en SVG de cada paso de los métodos y cuenta con un explorador interactivo del código fuente.

## 2. Cómo Funciona el Control de Todo Tipo de Errores

En JavaScript estándar, evaluar operaciones inválidas como `10 / 0` o `Math.sqrt(-5)` **no lanza una excepción**, sino que devuelve `Infinity` o `NaN` silenciosamente, lo cual arruinaría todos los cálculos posteriores mostrando `NaN` en el resultado final. Para evitarlo, nuestro motor implementa **tres capas de seguridad**:

### Capa 1: Validación Léxica y Sintáctica (`compilarFuncionSegura`)
- **Entrada vacía:** Verifica que el texto no sea nulo ni contenga solo espacios.
- **Balanceo de paréntesis:** Un bucle recorre la cadena sumando $+1$ cuando encuentra `(` y restando $-1$ cuando encuentra `)`. Si el contador cae por debajo de $0$ en cualquier instante (ej. `x+1)`) o termina distinto de $0$ (ej. `(x^2 + 1`), rechaza la expresión indicando cuántos paréntesis faltan.
- **Lista blanca (*Whitelist*) de funciones:** Extrae todos los identificadores alfabéticos mediante una expresión regular (`/[a-z_]+/g`) y verifica que estén en el conjunto permitido (`x, t, sin, cos, tan, asin, acos, atan, sqrt, cbrt, abs, ln, log, exp, pi, e`). Así se bloquea cualquier intento de inyección de código o nombres de variables inexistentes.
- **Detección de operadores duplicados:** Detecta combinaciones ilegales como `x+*2`, `*x` al inicio o `+` al final sin operando.
- **Normalización algebraica:** Permite escribir como un humano (`0.5t^4 - 2t^3 + 4t^2 + 12` o `2x`) transformando `^` en el operador de potencia `**` de JavaScript e insertando el signo `*` en multiplicaciones implícitas.

### Capa 2: Envoltorios de Dominio Real (`helpers`)
Antes de evaluar la función, reemplazamos `sqrt`, `ln`, `log`, `asin` y `acos` por funciones protectoras propias:
- `__safeSqrt(v)`: Si $v < 0$, lanza un error explícito: *"Dominio inválido: Raíz cuadrada de número negativo"*.
- `__safeLn(v)` y `__safeLog10(v)`: Si $v \le 0$, lanza un error indicando que el logaritmo no está definido en los reales para valores menores o iguales a cero.
- **Filtro de `NaN` e `Infinity`:** Después de cada evaluación $f(x)$, se comprueba `Number.isNaN(val)` y `!Number.isFinite(val)`. Si el usuario ingresa `10 / (x - 2)` en $[0, 4]$, al pasar por $x = 2$ el resultado es `Infinity` y el programa reporta inmediatamente: *"Asíntota vertical o división por cero detectada en x = 2"*.

### Capa 3: Validación de Límites de Integración (`validarLimitesYDominio`)
- Verifica que tanto $a$ como $b$ sean números reales finitos (`!Number.isNaN(a)`).
- Verifica que $a \ne b$ (`Math.abs(b - a) < 1e-12`), ya que si los límites son iguales el ancho del intervalo es cero.
- Si $a > b$, emite una advertencia pedagógica recordando la propiedad $\int_a^b f(x)\,dx = -\int_b^a f(x)\,dx$.
- Realiza un barrido preventivo de muestreo a lo largo de todo el intervalo $[a, b]$ antes de ejecutar los métodos para asegurar que la función sea continua y evaluable en todo el recorrido.

---
---

# PARTE III: GUION DETALLADO POR PERSONA PARA EL VIDEO EN TEAMS

> [!IMPORTANT]
> **Recordatorio de las reglas de entrega (según la guía del profesor):**
> - **Fecha límite:** Viernes 13 de noviembre (subir el video a Microsoft Teams).
> - **Requisito indispensable:** **La cámara debe estar encendida durante todo el video** por parte de los integrantes.
> - **Apoyo visual:** Compartir pantalla mostrando la aplicación web interactiva (`npm run dev`) y la terminal de comandos (`npm run terminal`).

---

## Distribución Equitativa de Tiempos (Duración exacta: 3:00 min por integrante — Total: 9:00 min)

> [!TIP]
> **Equilibrio de participación:** Los tres guiones han sido calibrados a **~385–395 palabras habladas cada uno** (que a velocidad normal de exposición de $130\text{ palabras/min}$ equivalen exactamente a **3 minutos por persona**).

| Orden | Integrante | Rol Asignado en la Guía | Secciones que Expone | Extensión / Tiempo |
| :---: | :--- | :--- | :--- | :---: |
| **1.°** | **Juan Rodriguez** | *PPT / Presentación Estructurada* | Bienvenida, planteamiento del contexto del servidor Cloud, fundamento teórico de Newton-Cotes y explicación geométrica animada (Pasos 01 al 05). | ~390 palabras (**3:00 min**) |
| **2.°** | **Nicole Caceres** | *Informe y Demostración* | Integral analítica exacta, demostración matemática paso a paso de Trapecio Simple y Simpson 1/3 Simple, aplicación del error y respuestas a las 3 preguntas. | ~395 palabras (**3:00 min**) |
| **3.°** | **Miguel Oliver** | *Representación del Método en Computadora* | Explicación modular de los 5 bloques del código JavaScript, demostración en vivo del control de errores, ejecución en terminal y conclusión grupal. | ~390 palabras (**3:00 min**) |

---

## 🎙️ PARTE 1: JUAN RODRIGUEZ (Sección 01 — 3:00 minutos / ~390 palabras)

*(Juan enciende su cámara y comparte pantalla en la **Sección 01 · Juan Rodríguez — Fundamento y Geometría** de la aplicación web).*

### Guion de Juan Rodriguez:

> **"Buenas tardes profesor y compañeros. Nosotros somos el grupo conformado por Nicole Caceres, Miguel Oliver y quien les habla, Juan Rodriguez. En este Proyecto N.° 3 de Métodos Numéricos vamos a exponer y demostrar los métodos de Integración Numérica del Trapecio Simple y Simpson 1/3 Simple aplicados a un problema real de Ingeniería en Sistemas."**
>
> **"En nuestra carrera es muy frecuente analizar tasas variables en el tiempo, como el ancho de banda de un servidor, para conocer el volumen total de datos acumulados mediante una integral definida. Nuestro caso de estudio analiza el nodo principal de almacenamiento de un servidor Cloud durante una ventana crítica de respaldo distribuido (*backup*) que dura $4\text{ horas}$, desde $t = 0$ hasta $t = 4\text{ horas}$, donde la tasa de transferencia en Gigabytes por hora sigue el modelo polinómico de cuarto grado $R(t) = 0.5t^4 - 2t^3 + 4t^2 + 12$."**
>
> **"Cuando integrar analíticamente una función en monitoreo de sistemas es complejo, recurrimos a las fórmulas cerradas de Newton-Cotes, que reemplazan la curva original $f(x)$ por un polinomio interpolador de Lagrange $P_n(x)$ sobre nodos equidistantes. Veamos su construcción paso a paso en nuestro lienzo interactivo:"**
>
> *(Juan selecciona los pasos **01 al 05** o presiona **"Reproducir secuencia"**):*
>
> - **"En el Paso 01, trazamos en azul la función continua $R(t)$ entre $0$ y $4\text{ horas}$; el área sombreada bajo esta curva representa el volumen real transferido."**
> - **"En el Paso 02, discretizamos el intervalo en tres nodos equidistantes: el extremo inicial $x_0 = 0$, el punto medio $x_1 = 2$ y el extremo final $x_2 = 4$."**
> - **"En el Paso 03, observamos la Regla del Trapecio Simple (Grado 1): une únicamente los dos extremos mediante una recta secante con la fórmula $I \approx (b - a)\frac{f(a) + f(b)}{2}$. Como se ve en el área rayada en rojo, al ser la curva cóncava hacia arriba, la recta queda muy por encima de la función real, cometiendo un gran error por exceso que depende de la segunda derivada."**
> - **"En el Paso 04, aplicamos la Regla de Simpson 1/3 Simple (Grado 2): divide el intervalo en $n = 2$ subintervalos de paso $h = \frac{b-a}{2}$ y traza una parábola de segundo grado que pasa por los tres nodos $(x_0, x_1, x_2)$, usando la fórmula ponderada $I \approx \frac{h}{3}[f(x_0) + 4f(x_1) + f(x_2)]$."**
> - **"En el Paso 05, al superponer ambas curvas, comprobamos visualmente cómo la parábola verde de Simpson se adapta casi perfectamente a la función real. Le cedo la palabra a mi compañera Nicole Caceres en la Sección 02 para la demostración matemática paso a paso."**

---

## 🎙️ PARTE 2: NICOLE CACERES (Sección 02 — 3:00 minutos / ~395 palabras)

*(Nicole tiene su cámara encendida. Selecciona la pestaña **"02 · Nicole Cáceres — Demostración y Errores"** y recorre las sub-pestañas `2.1`, `2.2`, `2.3` y `2.4`).*

### Guion de Nicole Caceres:

> **"Muchas gracias, Juan. En esta Sección 02 demostraremos matemáticamente ambos métodos paso a paso y aplicaremos las fórmulas de error."**
>
> *(En la sub-pestaña **2.1 Planteamiento y Solución Exacta**):*
> **"Primero hallamos el valor exacto analítico integrando $R(t) = 0.5t^4 - 2t^3 + 4t^2 + 12$ entre $t = 0$ y $t = 4$. Su antiderivada es $0.1t^5 - 0.5t^4 + \frac{4}{3}t^3 + 12t$. Al evaluar en $t = 4$, obtenemos $102.4 - 128 + 85.3333 + 48 = 107.7333\text{ GB}$ exactos. Además, al evaluar la función en los nodos obtenemos tres valores enteros: $R(0) = 12\text{ GB/h}$, en el punto medio $R(2) = 20\text{ GB/h}$ y en el extremo final $R(4) = 76\text{ GB/h}$."**
>
> *(En la sub-pestaña **2.2 Demostración: Trapecio Simple**):*
> **"En el Método del Trapecio Simple seguimos tres pasos: primero, el ancho del intervalo es $h = 4 - 0 = 4$. Segundo, tomamos los extremos $R(0) = 12$ y $R(4) = 76$. Tercero, sustituimos en la fórmula: $I \approx 4 \cdot \frac{12 + 76}{2} = 4 \cdot 44 = 176.0000\text{ GB}$. Al aplicar el error, el Error Verdadero Absoluto es $|107.7333 - 176| = 68.2667\text{ GB}$, lo que equivale a un Error Relativo Porcentual de $63.37\%$. Y con la fórmula de truncamiento $E_t = -\frac{(b-a)^3}{12}f''(\xi)$, usando la segunda derivada media igual a $16$, obtenemos $-85.3333\text{ GB}$."**
>
> *(En la sub-pestaña **2.3 Demostración: Simpson 1/3 Simple**):*
> **"Ahora, en el Método de Simpson 1/3 Simple: primero calculamos el paso $h = \frac{4 - 0}{2} = 2\text{ horas}$ para nuestros nodos $0, 2$ y $4$. Segundo, tomamos las tres evaluaciones: $12, 20$ y $76$. Tercero, calculamos la suma ponderada con pesos $1 - 4 - 1$: $S = 12 + 4(20) + 76 = 168$. Cuarto, multiplicamos por $\frac{h}{3}$: $I \approx \frac{2}{3}(168) = 112.0000\text{ GB}$. Al aplicar el error, el Error Verdadero Absoluto baja a solo $|107.7333 - 112| = 4.2667\text{ GB}$, es decir, apenas un $3.96\%$ de error relativo. Además, en el Error de Truncamiento $E_t = -\frac{(b-a)^5}{2880}f^{(4)}(\xi)$, como la cuarta derivada constante de nuestra función es $12$, obtenemos $-\frac{1024 \times 12}{2880} = -4.2667\text{ GB}$, verificando que $112 - 4.2667 = 107.7333\text{ GB}$ exactos."**
>
> *(En la sub-pestaña **2.4 Comparativa y Preguntas del Problema**):*
> **"Con esto respondemos las tres preguntas del problema: primero, el volumen real transferido es de $107.7333\text{ GB}$. Segundo, Simpson 1/3 ($112\text{ GB}$) es $16$ veces más preciso que el Trapecio ($176\text{ GB}$). Y tercero, respecto al buffer reservado de $120\text{ GB}$ en el servidor: con el Trapecio creeríamos erróneamente que el almacenamiento colapsará, mientras que con Simpson 1/3 confirmamos que los $120\text{ GB}$ son suficientes. Le doy el pase a Miguel Oliver en la Sección 03."**

---

## 🎙️ PARTE 3: MIGUEL OLIVER (Sección 03 — 3:00 minutos / ~390 palabras)

*(Miguel tiene su cámara encendida. Selecciona la pestaña **"03 · Miguel Oliver — Código JS y Validación"**).*

### Guion de Miguel Oliver:

> **"Gracias, Nicole. En esta Sección 03 explicaré cómo representamos ambos métodos en la computadora mediante JavaScript, tanto en el programa interactivo de terminal para Node.js como en esta plataforma web con React."**
>
> *(Miguel muestra primero la sub-pestaña **3.2 Explicación Modular del Código Fuente JS** y recorre los 5 bloques):*
>
> **"Nuestro código fuente está estructurado en cinco módulos principales:"**
> 1. **"El primer módulo es `compilarFuncionSegura(rawExpr)`. Como el usuario puede introducir cualquier función matemática, primero validamos la sintaxis: un algoritmo recorre el texto verificando el balance exacto de paréntesis abiertos y cerrados; luego comprobamos una lista blanca (*whitelist*) de identificadores matemáticos permitidos para bloquear cualquier intento de inyección de código o funciones inexistentes, y finalmente convertimos expresiones algebraicas como `0.5*x^4` a sintaxis ejecutable de JavaScript."**
> 2. **"El segundo módulo es `validarLimitesYDominio(fn, rawA, rawB)`. En JavaScript estándar, dividir entre cero devuelve `Infinity` y evaluar una raíz cuadrada negativa devuelve `NaN` de forma silenciosa sin detener el programa. Para controlar todo tipo de errores, programamos funciones envolventes seguras (`__safeSqrt`, `__safeLn`, `__safeLog10`) y realizamos un barrido de muestreo en todo el intervalo $[a, b]$ que intercepta divisiones por cero, asíntotas verticales, raíces negativas, logaritmos fuera de dominio y límites iguales donde $a = b$."**
> 3. **"El tercer módulo es `metodoTrapecioSimple(fn, a, b)`, que calcula el ancho $h = b - a$, evalúa los extremos $f(a)$ y $f(b)$, aplica la regla trapezoidal y estima la segunda derivada por diferencias finitas centradas para hallar el error de truncamiento."**
> 4. **"El cuarto módulo es `metodoSimpsonUnTercioSimple(fn, a, b)`, que subdivide el intervalo en $n = 2$ partes con paso $h = \frac{b-a}{2}$, evalúa los tres nodos con pesos $1 - 4 - 1$ y estima la cuarta derivada para el error de truncamiento."**
> 5. **"El quinto módulo es `calcularMetricasError()`, que computa el Error Verdadero Absoluto y el Error Relativo Porcentual."**
>
> *(Miguel cambia a la sub-pestaña **3.1 Entrada de Datos, Control de Errores y Terminal**):*
>
> **"Aquí en la sub-sección 3.1 demostramos en vivo el control de errores: si seleccionamos una entrada con paréntesis desbalanceados, una raíz negativa o `10 / (x - 2)` que tiene división por cero en $x = 2$, el validador intercepta la falla inmediatamente e informa la causa exacta en consola. Y al presionar el botón 'Setear Datos del Problema Planteado', se restauran los datos de nuestro servidor Cloud mostrando a la derecha la salida exacta de la terminal de Node.js. Como conclusión grupal, demostramos que Simpson 1/3 Simple ofrece una precisión muy superior con solo añadir el nodo central. ¡Muchas gracias!"**

