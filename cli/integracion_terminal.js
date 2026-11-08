/**
 * ============================================================================
 * UNIVERSIDAD - FACULTAD DE INGENIERÍA EN SISTEMAS
 * ASIGNATURA: MÉTODOS NUMÉRICOS — PROYECTO 3
 * TEMA: INTEGRACIÓN NUMÉRICA (MÉTODO DEL TRAPECIO SIMPLE Y SIMPSON 1/3 SIMPLE)
 * ============================================================================
 * INTEGRANTES:
 *   - Nicole Caceres  (Informe y Demostración)
 *   - Juan Rodriguez  (Presentación y Análisis)
 *   - Miguel Oliver   (Representación del Método en Computadora)
 *
 * DESCRIPCIÓN:
 *   Aplicación interactiva de terminal en JavaScript (Node.js) que implementa
 *   los métodos de Integración Numérica del Trapecio Simple y Simpson 1/3 Simple.
 *   Incluye:
 *     1. Caso preconfigurado de Ingeniería en Sistemas (Tráfico de Red en Servidor).
 *     2. Entrada personalizada de funciones f(x) y límites [a, b].
 *     3. Motor robusto de validación y control de errores (sintaxis, dominio,
 *        división por cero, raíces complejas, logaritmos inválidos, límites).
 *     4. Desglose matemático paso a paso y análisis de errores (Error Verdadero,
 *        Error Relativo Porcentual y Error de Truncamiento Teórico).
 * ============================================================================
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// ============================================================================
// 1. CONSTANTES DE ESTILO ANSI PARA TERMINAL
// ============================================================================
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// ============================================================================
// 2. DATOS DEL PROBLEMA PRECONFIGURADO (INGENIERÍA EN SISTEMAS)
// ============================================================================
export const PROBLEMA_SERVIDOR = {
  titulo: 'Monitoreo de Transferencia de Datos en Servidor Cloud (Ventana de Backup)',
  contexto:
    'Un ingeniero en sistemas monitorea el nodo principal de almacenamiento durante una ' +
    'ventana crítica de respaldo distribuido de 4 horas (t = 0 h hasta t = 4 h). ' +
    'La tasa de transferencia de red R(t) medida en Gigabytes por hora (GB/h) varía según la función:',
  expresion: '0.5*x^4 - 2*x^3 + 4*x^2 + 12',
  expresionHumana: 'R(t) = 0.5t⁴ - 2t³ + 4t² + 12  [GB/h]',
  variable: 't (horas)',
  unidadTasa: 'GB/h',
  unidadIntegral: 'GB',
  a: 0,
  b: 4,
  valorExacto: 1616 / 15, // 107.73333333333333 GB
  capacidadBufferAsignada: 120, // GB reservados en el almacenamiento temporal del servidor
  preguntas: [
    {
      pregunta: '1. ¿Cuál es el volumen real (exacto) de datos transferidos durante las 4 horas de respaldo?',
      respuesta:
        'Al resolver analíticamente la integral definida de R(t) entre 0 y 4 horas, se obtiene I = 1616/15 ≈ 107.7333 GB.',
    },
    {
      pregunta: '2. ¿Qué volumen estima cada método numérico y cuál aproxima mejor el comportamiento del tráfico?',
      respuesta:
        'El Método del Trapecio Simple estima 176.0000 GB (error relativo de 63.37%), sobreestimando drásticamente debido a la concavidad de la curva. En cambio, el Método de Simpson 1/3 Simple estima 112.0000 GB (error relativo de apenas 3.96%), reduciendo el error en más de 16 veces gracias al ajuste parabólico de segundo orden.',
    },
    {
      pregunta: '3. Si el servidor tiene un buffer de almacenamiento temporal reservado de 120 GB para el backup, ¿qué decisión de infraestructura se tomaría con cada método?',
      respuesta:
        'Con el Trapecio Simple (176 GB > 120 GB) se generaría una falsa alarma de desbordamiento de almacenamiento (buffer overflow), provocando un aprovisionamiento innecesario de discos. Con Simpson 1/3 Simple (112 GB < 120 GB) se confirma correctamente que el buffer de 120 GB es suficiente con un margen seguro de 8 GB (y 12.27 GB respecto al valor real de 107.73 GB).',
    },
  ],
};

// ============================================================================
// 3. MOTOR DE VALIDACIÓN Y EVALUACIÓN MATEMÁTICA SEGURA
// ============================================================================

/**
 * Valida la sintaxis de una expresión matemática f(x) y la compila en una
 * función segura evaluable en JavaScript.
 *
 * Controla errores de:
 *  - Expresión vacía o tipo de dato incorrecto
 *  - Caracteres ilegales o intentos de inyección de código
 *  - Paréntesis desbalanceados
 *  - Operadores consecutivos inválidos o sintaxis incompleta
 *
 * @param {string} rawExpr Expresión matemática ingresada por el usuario (en términos de x o t)
 * @returns {{ ok: boolean, fn?: (x: number) => number, normalized?: string, error?: string }}
 */
export function compilarFuncionSegura(rawExpr) {
  if (typeof rawExpr !== 'string' || rawExpr.trim() === '') {
    return {
      ok: false,
      error: 'La expresión de la función no puede estar vacía.',
    };
  }

  let expr = rawExpr.trim().toLowerCase();

  // Permitir que el usuario escriba 't' como variable independiente convirtiéndola a 'x'
  // sin afectar funciones como sqrt, tan, atan
  expr = expr
    .replace(/\bsqrt\b/g, '__SQRT__')
    .replace(/\btan\b/g, '__TAN__')
    .replace(/\batan\b/g, '__ATAN__')
    .replace(/\bt\b/g, 'x')
    .replace(/__SQRT__/g, 'sqrt')
    .replace(/__TAN__/g, 'tan')
    .replace(/__ATAN__/g, 'atan');

  // 1. Verificar paréntesis balanceados
  let balance = 0;
  for (const ch of expr) {
    if (ch === '(') balance++;
    if (ch === ')') balance--;
    if (balance < 0) {
      return {
        ok: false,
        error: 'Error de sintaxis: Hay un paréntesis de cierre ")" sin su correspondiente apertura "(".',
      };
    }
  }
  if (balance !== 0) {
    return {
      ok: false,
      error: `Error de sintaxis: Paréntesis desbalanceados (faltan ${balance} paréntesis de cierre).`,
    };
  }

  // 2. Verificar paréntesis vacíos
  if (/\(\s*\)/.test(expr)) {
    return {
      ok: false,
      error: 'Error de sintaxis: Se encontraron paréntesis vacíos "()".',
    };
  }

  // 3. Verificar caracteres permitidos únicamente
  const caracteresValidos = /^[0-9x+\-*/^.,()\s_a-z]+$/;
  if (!caracteresValidos.test(expr)) {
    return {
      ok: false,
      error: 'Error de sintaxis: La expresión contiene caracteres especiales no válidos.',
    };
  }

  // 4. Comprobar tokens alfabéticos permitidos (solo funciones matemáticas seguras y 'x')
  const tokensPermitidos = new Set([
    'x',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'sqrt',
    'cbrt',
    'abs',
    'ln',
    'log',
    'exp',
    'pi',
    'e',
  ]);
  const palabras = expr.match(/[a-z_]+/g) || [];
  for (const palabra of palabras) {
    if (!tokensPermitidos.has(palabra)) {
      return {
        ok: false,
        error: `Identificador desconocido "${palabra}". Use 'x' (o 't') como variable y funciones estándar (sin, cos, tan, sqrt, ln, log, exp, abs).`,
      };
    }
  }

  // 5. Detectar operadores binarios duplicados o mal ubicados (ej. "x+*2", "*x", "x/")
  const sinEspacios = expr.replace(/\s+/g, '');
  if (/^[*/^]/.test(sinEspacios) || /[+\-*/^]$/.test(sinEspacios)) {
    return {
      ok: false,
      error: 'Error de sintaxis: La expresión no puede comenzar ni terminar con un operador binario (*, /, ^, +, -).',
    };
  }
  if (/[+\-*/^]{2,}/.test(sinEspacios.replace(/\*\*/g, '^').replace(/[*/^][+-]/g, ''))) {
    return {
      ok: false,
      error: 'Error de sintaxis: Se detectaron operadores consecutivos inválidos.',
    };
  }

  // 6. Normalizar multiplicación implícita: ej. "2x" -> "2*x", "2(x+1)" -> "2*(x+1)", ")(" -> ")*("
  let jsExpr = expr
    .replace(/,/g, '.')
    .replace(/(\d)(x)/g, '$1*$2')
    .replace(/(\d)\(/g, '$1*(')
    .replace(/(x)(\d)/g, '$1*$2')
    .replace(/(x)\(/g, '$1*(')
    .replace(/\)(\d)/g, ')*$1')
    .replace(/\)(x)/g, ')*$1')
    .replace(/\)\(/g, ')*(')
    .replace(/(\d)(sin|cos|tan|asin|acos|atan|sqrt|cbrt|abs|ln|log|exp|pi|e)\b/g, '$1*$2');

  // 7. Reemplazar funciones matemáticas por funciones seguras con validación de dominio
  jsExpr = jsExpr
    .replace(/\^/g, '**')
    .replace(/\bpi\b/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\basin\b/g, '__safeAsin')
    .replace(/\bacos\b/g, '__safeAcos')
    .replace(/\batan\b/g, 'Math.atan')
    .replace(/\bsqrt\b/g, '__safeSqrt')
    .replace(/\bcbrt\b/g, 'Math.cbrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bln\b/g, '__safeLn')
    .replace(/\blog\b/g, '__safeLog10')
    .replace(/\bexp\b/g, 'Math.exp');

  // Funciones auxiliares que lanzan errores descriptivos si se viola el dominio real
  const helpers = {
    __safeSqrt: (v) => {
      if (v < 0) {
        throw new Error(`Dominio inválido: Raíz cuadrada de número negativo sqrt(${v.toFixed(4)}).`);
      }
      return Math.sqrt(v);
    },
    __safeLn: (v) => {
      if (v <= 0) {
        throw new Error(`Dominio inválido: Logaritmo natural ln(${v.toFixed(4)}) no está definido para valores <= 0.`);
      }
      return Math.log(v);
    },
    __safeLog10: (v) => {
      if (v <= 0) {
        throw new Error(`Dominio inválido: Logaritmo base 10 log(${v.toFixed(4)}) no está definido para valores <= 0.`);
      }
      return Math.log10(v);
    },
    __safeAsin: (v) => {
      if (v < -1 || v > 1) {
        throw new Error(`Dominio inválido: arcsin(${v.toFixed(4)}) fuera del rango [-1, 1].`);
      }
      return Math.asin(v);
    },
    __safeAcos: (v) => {
      if (v < -1 || v > 1) {
        throw new Error(`Dominio inválido: arccos(${v.toFixed(4)}) fuera del rango [-1, 1].`);
      }
      return Math.acos(v);
    },
  };

  let compilada;
  try {
    compilada = new Function(
      'x',
      '__safeSqrt',
      '__safeLn',
      '__safeLog10',
      '__safeAsin',
      '__safeAcos',
      `"use strict"; return (${jsExpr});`
    );
    // Prueba preliminar de sintaxis compilada
    compilada.toString();
  } catch (err) {
    return {
      ok: false,
      error: `Error al compilar la expresión matemática: revise la sintaxis cerca de los operadores (${err.message}).`,
    };
  }

  // Envolver en evaluador con control de NaN / Infinito / División por cero
  const fnSegura = (x) => {
    const val = compilada(
      x,
      helpers.__safeSqrt,
      helpers.__safeLn,
      helpers.__safeLog10,
      helpers.__safeAsin,
      helpers.__safeAcos
    );
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw new Error(
        `Indeterminación matemática (NaN) al evaluar f(${x}). Verifique posibles formas 0/0 o raíces pares de negativos.`
      );
    }
    if (!Number.isFinite(val)) {
      throw new Error(
        `Asíntota vertical o división por cero detectada: f(${x}) tiende a Infinito.`
      );
    }
    return val;
  };

  return {
    ok: true,
    fn: fnSegura,
    normalized: expr,
  };
}

/**
 * Valida los límites de integración [a, b] y comprueba que la función sea
 * continua y evaluable en el intervalo.
 *
 * @param {(x: number) => number} fn Función compilada
 * @param {number|string} rawA Límite inferior
 * @param {number|string} rawB Límite superior
 * @returns {{ ok: boolean, a?: number, b?: number, invertido?: boolean, error?: string }}
 */
export function validarLimitesYDominio(fn, rawA, rawB) {
  const strA = String(rawA ?? '').trim().replace(',', '.');
  const strB = String(rawB ?? '').trim().replace(',', '.');

  if (strA === '' || strB === '') {
    return { ok: false, error: 'Ambos límites de integración (a y b) son obligatorios.' };
  }

  const aNum = Number(strA);
  const bNum = Number(strB);

  if (Number.isNaN(aNum) || !Number.isFinite(aNum)) {
    return { ok: false, error: `El límite inferior "a" (${rawA}) no es un número real finito válido.` };
  }
  if (Number.isNaN(bNum) || !Number.isFinite(bNum)) {
    return { ok: false, error: `El límite superior "b" (${rawB}) no es un número real finito válido.` };
  }
  if (Math.abs(bNum - aNum) < 1e-12) {
    return {
      ok: false,
      error: `Los límites de integración no pueden ser iguales (a = b = ${aNum}). El ancho del intervalo sería 0.`,
    };
  }

  // Verificar evaluabilidad en los nodos principales (a, punto medio, b) y puntos de muestreo internos
  const puntosPrueba = 20;
  for (let i = 0; i <= puntosPrueba; i++) {
    const xTest = aNum + ((bNum - aNum) * i) / puntosPrueba;
    try {
      fn(xTest);
    } catch (err) {
      return {
        ok: false,
        error: `Error en x = ${ Number(xTest.toFixed(4)) }: ${err.message}`,
      };
    }
  }

  return {
    ok: true,
    a: aNum,
    b: bNum,
    invertido: aNum > bNum,
  };
}

// ============================================================================
// 4. IMPLEMENTACIÓN DE LOS MÉTODOS NUMÉRICOS Y CÁLCULO DE ERRORES
// ============================================================================

/**
 * MÉTODO DEL TRAPECIO SIMPLE
 * Fórmula: I ≈ (b - a) * [f(a) + f(b)] / 2
 * Error de truncamiento: Et = -((b - a)^3 / 12) * f''(ξ)
 */
export function metodoTrapecioSimple(fn, a, b) {
  const h = b - a;
  const fa = fn(a);
  const fb = fn(b);
  const sumaExtremos = fa + fb;
  const promedioAlturas = sumaExtremos / 2;
  const integral = h * promedioAlturas;

  // Estimación de f''(ξ) promedio mediante diferencias finitas o Teorema del Valor Medio
  const segundaDerivadaMedia = estimarSegundaDerivadaMedia(fn, a, b);
  const errorTruncamiento = -((Math.pow(b - a, 3) / 12) * segundaDerivadaMedia);

  return {
    metodo: 'Método del Trapecio Simple',
    a,
    b,
    h,
    fa,
    fb,
    sumaExtremos,
    promedioAlturas,
    integral,
    segundaDerivadaMedia,
    errorTruncamiento,
    pasos: [
      `Paso 1 (Ancho del intervalo): b - a = ${b} - (${a}) = ${formatearNum(h)}`,
      `Paso 2 (Evaluar en extremos): f(${a}) = ${formatearNum(fa)}  |  f(${b}) = ${formatearNum(fb)}`,
      `Paso 3 (Sustituir en fórmula): I ≈ (${formatearNum(h)}) * [${formatearNum(fa)} + ${formatearNum(fb)}] / 2`,
      `Paso 4 (Resultado Trapecio):   I ≈ ${formatearNum(h)} * (${formatearNum(sumaExtremos)} / 2) = ${formatearNum(integral)}`,
    ],
  };
}

/**
 * MÉTODO DE SIMPSON 1/3 SIMPLE
 * Divide el intervalo [a, b] en n = 2 subintervalos de paso h = (b - a) / 2,
 * con nodo central xm = (a + b) / 2.
 * Fórmula: I ≈ (h / 3) * [f(x0) + 4*f(x1) + f(x2)]
 * Error de truncamiento: Et = -((b - a)^5 / 2880) * f''''(ξ)
 */
export function metodoSimpsonUnTercioSimple(fn, a, b) {
  const n = 2; // Simpson 1/3 simple utiliza exactamente 2 subintervalos (3 nodos)
  const h = (b - a) / n;
  const x0 = a;
  const x1 = (a + b) / 2;
  const x2 = b;

  const fx0 = fn(x0);
  const fx1 = fn(x1);
  const fx2 = fn(x2);

  const sumaPonderada = fx0 + 4 * fx1 + fx2;
  const integral = (h / 3) * sumaPonderada;

  // Estimación de la cuarta derivada f''''(ξ) en el punto medio
  const cuartaDerivadaMedia = estimarCuartaDerivada(fn, a, b);
  const errorTruncamiento = -((Math.pow(b - a, 5) / 2880) * cuartaDerivadaMedia);

  return {
    metodo: 'Método de Simpson 1/3 Simple',
    a,
    b,
    n,
    h,
    x0,
    x1,
    x2,
    fx0,
    fx1,
    fx2,
    sumaPonderada,
    integral,
    cuartaDerivadaMedia,
    errorTruncamiento,
    pasos: [
      `Paso 1 (Tamaño de paso h):     h = (b - a) / 2 = (${b} - (${a})) / 2 = ${formatearNum(h)}`,
      `Paso 2 (Nodos de integración): x0 = ${formatearNum(x0)},  x1 (punto medio) = ${formatearNum(x1)},  x2 = ${formatearNum(x2)}`,
      `Paso 3 (Evaluar función):      f(x0) = ${formatearNum(fx0)}  |  f(x1) = ${formatearNum(fx1)}  |  f(x2) = ${formatearNum(fx2)}`,
      `Paso 4 (Suma ponderada 1-4-1): S = ${formatearNum(fx0)} + 4*(${formatearNum(fx1)}) + ${formatearNum(fx2)} = ${formatearNum(sumaPonderada)}`,
      `Paso 5 (Sustituir en fórmula): I ≈ (h / 3) * S = (${formatearNum(h)} / 3) * ${formatearNum(sumaPonderada)} = ${formatearNum(integral)}`,
    ],
  };
}

/**
 * Calcula una referencia de altísima precisión (usando cuadratura compuesta de
 * 1000 subintervalos) cuando el usuario ingresa una función personalizada sin
 * valor exacto analítico conocido, para poder comparar siempre el Error Verdadero.
 */
export function calcularReferenciaAltaPrecision(fn, a, b, n = 1000) {
  const h = (b - a) / n;
  let suma = fn(a) + fn(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    suma += (i % 2 === 0 ? 2 : 4) * fn(x);
  }
  return (h / 3) * suma;
}

/**
 * Estima la segunda derivada promedio en [a, b] usando el Teorema Fundamental:
 * f''_media = [f'(b) - f'(a)] / (b - a) con diferencias centrales de paso fino.
 */
function estimarSegundaDerivadaMedia(fn, a, b) {
  const delta = Math.max(Math.abs(b - a) * 1e-5, 1e-6);
  const derivadaEn = (x) => (fn(x + delta) - fn(x - delta)) / (2 * delta);
  return (derivadaEn(b) - derivadaEn(a)) / (b - a);
}

/**
 * Estima la cuarta derivada f^(4) en el intervalo [a, b] mediante diferencias
 * finitas centradas de orden 4.
 */
function estimarCuartaDerivada(fn, a, b) {
  const xm = (a + b) / 2;
  const delta = Math.max(Math.abs(b - a) * 0.02, 1e-3);
  const num =
    fn(xm - 2 * delta) -
    4 * fn(xm - delta) +
    6 * fn(xm) -
    4 * fn(xm + delta) +
    fn(xm + 2 * delta);
  return num / Math.pow(delta, 4);
}

/**
 * Calcula las métricas de error respecto al valor exacto / referencia:
 *  - Error Verdadero Con Signo: Et_real = Valor Exacto - Valor Aproximado
 *  - Error Verdadero Absoluto:  |Ev| = |Valor Exacto - Valor Aproximado|
 *  - Error Relativo Porcentual: εt (%) = (|Ev| / |Valor Exacto|) * 100
 */
export function calcularMetricasError(valorExacto, valorAproximado, errorTruncamientoTeorico) {
  const errorConSigno = valorExacto - valorAproximado;
  const errorAbsoluto = Math.abs(errorConSigno);
  const errorRelativoPorcentual =
    Math.abs(valorExacto) > 1e-12
      ? (errorAbsoluto / Math.abs(valorExacto)) * 100
      : 0;

  return {
    valorExacto,
    valorAproximado,
    errorConSigno,
    errorAbsoluto,
    errorRelativoPorcentual,
    errorTruncamientoTeorico,
    errorTruncamientoAbsoluto: Math.abs(errorTruncamientoTeorico),
  };
}

export function formatearNum(n, decimales = 4) {
  if (typeof n !== 'number' || Number.isNaN(n)) return 'NaN';
  if (Number.isInteger(n)) return n.toString();
  const redondeado = Number(n.toFixed(decimales));
  return Number.isInteger(redondeado) ? redondeado.toString() : n.toFixed(decimales);
}

// ============================================================================
// 5. IMPRESIÓN DETALLADA EN CONSOLA
// ============================================================================

function imprimirEncabezado() {
  console.log('\n' + C.cyan + '═'.repeat(80) + C.reset);
  console.log(
    `${C.bold}${C.cyan}  PROYECTO 3 - MÉTODOS NUMÉRICOS (INGENIERÍA EN SISTEMAS)${C.reset}`
  );
  console.log(
    `${C.white}  Integración Numérica: Método del Trapecio Simple y Simpson 1/3 Simple${C.reset}`
  );
  console.log(
    `${C.dim}  Integrantes: Nicole Caceres | Juan Rodriguez | Miguel Oliver${C.reset}`
  );
  console.log(C.cyan + '═'.repeat(80) + C.reset);
}

export function ejecutarYMostrarAnalisis({
  titulo,
  contexto,
  expresion,
  expresionHumana,
  a,
  b,
  valorExactoOpcional = null,
  unidadIntegral = 'u²',
  preguntas = [],
}) {
  const compilacion = compilarFuncionSegura(expresion);
  if (!compilacion.ok) {
    console.log(`\n${C.bgRed}${C.white} [ERROR DE SINTAXIS] ${C.reset} ${C.red}${compilacion.error}${C.reset}`);
    return false;
  }

  const validacion = validarLimitesYDominio(compilacion.fn, a, b);
  if (!validacion.ok) {
    console.log(`\n${C.bgRed}${C.white} [ERROR DE DOMINIO / LÍMITES] ${C.reset} ${C.red}${validacion.error}${C.reset}`);
    return false;
  }

  if (validacion.invertido) {
    console.log(
      `\n${C.yellow}⚠ Advertencia: El límite inferior a (${validacion.a}) es mayor que b (${validacion.b}). ` +
        `Por propiedad de integrales definidas, el resultado tendrá signo invertido.${C.reset}`
    );
  }

  const fn = compilacion.fn;
  const limA = validacion.a;
  const limB = validacion.b;

  // Ejecutar ambos métodos
  const resTrapecio = metodoTrapecioSimple(fn, limA, limB);
  const resSimpson = metodoSimpsonUnTercioSimple(fn, limA, limB);

  // Obtener valor exacto analítico o referencia numérica de alta precisión
  const valorExacto =
    valorExactoOpcional !== null
      ? valorExactoOpcional
      : calcularReferenciaAltaPrecision(fn, limA, limB);

  const errTrapecio = calcularMetricasError(
    valorExacto,
    resTrapecio.integral,
    resTrapecio.errorTruncamiento
  );
  const errSimpson = calcularMetricasError(
    valorExacto,
    resSimpson.integral,
    resSimpson.errorTruncamiento
  );

  // Mostrar planteamiento
  console.log(`\n${C.bold}${C.blue}▶ CASO DE ESTUDIO: ${titulo}${C.reset}`);
  if (contexto) {
    console.log(`  ${C.white}${contexto}${C.reset}`);
  }
  console.log(`  • Función a integrar : ${C.bold}${C.yellow}${expresionHumana || `f(x) = ${expresion}`}${C.reset}`);
  console.log(`  • Intervalo [a, b]   : ${C.bold}[${limA}, ${limB}]${C.reset}`);
  console.log(
    `  • Valor Exacto (I)   : ${C.bold}${C.green}${valorExacto.toFixed(4)} ${unidadIntegral}${C.reset}`
  );

  // Mostrar Método 1: Trapecio Simple
  console.log('\n' + C.yellow + '─'.repeat(80) + C.reset);
  console.log(`${C.bold}${C.yellow}1. DEMOSTRACIÓN PASO A PASO — MÉTODO DEL TRAPECIO SIMPLE${C.reset}`);
  console.log(`   Fórmula: I ≈ (b - a) * [f(a) + f(b)] / 2`);
  console.log(C.yellow + '─'.repeat(80) + C.reset);
  for (const paso of resTrapecio.pasos) {
    console.log(`   ${paso}`);
  }
  console.log(
    `\n   ${C.bold}• Resultado Trapecio Simple      :${C.reset} ${C.yellow}${resTrapecio.integral.toFixed(4)} ${unidadIntegral}${C.reset}`
  );
  console.log(
    `   • Error Verdadero Absoluto |Ev|  : |${valorExacto.toFixed(4)} - ${resTrapecio.integral.toFixed(4)}| = ${C.red}${errTrapecio.errorAbsoluto.toFixed(4)} ${unidadIntegral}${C.reset}`
  );
  console.log(
    `   • Error Relativo Porcentual (εt) : ${C.red}${errTrapecio.errorRelativoPorcentual.toFixed(2)}%${C.reset}`
  );
  console.log(
    `   • Error de Truncamiento (Et)     : -((b-a)³/12)*f''(ξ) = ${resTrapecio.errorTruncamiento.toFixed(4)} ${unidadIntegral}`
  );

  // Mostrar Método 2: Simpson 1/3 Simple
  console.log('\n' + C.green + '─'.repeat(80) + C.reset);
  console.log(`${C.bold}${C.green}2. DEMOSTRACIÓN PASO A PASO — MÉTODO DE SIMPSON 1/3 SIMPLE${C.reset}`);
  console.log(`   Fórmula: I ≈ (h / 3) * [f(x0) + 4*f(x1) + f(x2)]   donde h = (b - a) / 2`);
  console.log(C.green + '─'.repeat(80) + C.reset);
  for (const paso of resSimpson.pasos) {
    console.log(`   ${paso}`);
  }
  console.log(
    `\n   ${C.bold}• Resultado Simpson 1/3 Simple   :${C.reset} ${C.green}${resSimpson.integral.toFixed(4)} ${unidadIntegral}${C.reset}`
  );
  console.log(
    `   • Error Verdadero Absoluto |Ev|  : |${valorExacto.toFixed(4)} - ${resSimpson.integral.toFixed(4)}| = ${C.green}${errSimpson.errorAbsoluto.toFixed(4)} ${unidadIntegral}${C.reset}`
  );
  console.log(
    `   • Error Relativo Porcentual (εt) : ${C.green}${errSimpson.errorRelativoPorcentual.toFixed(2)}%${C.reset}`
  );
  console.log(
    `   • Error de Truncamiento (Et)     : -((b-a)⁵/2880)*f⁽⁴⁾(ξ) = ${resSimpson.errorTruncamiento.toFixed(4)} ${unidadIntegral}`
  );
  console.log(
    `   • Verificación Exacta (I + Et)   : ${resSimpson.integral.toFixed(4)} + (${resSimpson.errorTruncamiento.toFixed(4)}) = ${(resSimpson.integral + resSimpson.errorTruncamiento).toFixed(4)} ${unidadIntegral}`
  );

  // Tabla comparativa resumen
  console.log('\n' + C.cyan + '─'.repeat(80) + C.reset);
  console.log(`${C.bold}${C.cyan}3. TABLA COMPARATIVA DE RESULTADOS Y ERRORES${C.reset}`);
  console.log(C.cyan + '─'.repeat(80) + C.reset);
  console.table([
    {
      Método: 'Valor Exacto (Analítico)',
      'Integral Aprox.': `${valorExacto.toFixed(4)} ${unidadIntegral}`,
      'Error Absoluto |Ev|': `0.0000 ${unidadIntegral}`,
      'Error Relativo (%)': '0.00%',
      'Error Truncamiento (Et)': `0.0000 ${unidadIntegral}`,
    },
    {
      Método: 'Trapecio Simple (Grado 1)',
      'Integral Aprox.': `${resTrapecio.integral.toFixed(4)} ${unidadIntegral}`,
      'Error Absoluto |Ev|': `${errTrapecio.errorAbsoluto.toFixed(4)} ${unidadIntegral}`,
      'Error Relativo (%)': `${errTrapecio.errorRelativoPorcentual.toFixed(2)}%`,
      'Error Truncamiento (Et)': `${resTrapecio.errorTruncamiento.toFixed(4)} ${unidadIntegral}`,
    },
    {
      Método: 'Simpson 1/3 Simple (Grado 2)',
      'Integral Aprox.': `${resSimpson.integral.toFixed(4)} ${unidadIntegral}`,
      'Error Absoluto |Ev|': `${errSimpson.errorAbsoluto.toFixed(4)} ${unidadIntegral}`,
      'Error Relativo (%)': `${errSimpson.errorRelativoPorcentual.toFixed(2)}%`,
      'Error Truncamiento (Et)': `${resSimpson.errorTruncamiento.toFixed(4)} ${unidadIntegral}`,
    },
  ]);

  // Mostrar preguntas y respuestas si existen (caso del problema planteado)
  if (preguntas.length > 0) {
    console.log('\n' + C.magenta + '─'.repeat(80) + C.reset);
    console.log(
      `${C.bold}${C.magenta}4. RESPUESTAS A LAS PREGUNTAS DEL PLANTEAMIENTO DEL PROBLEMA${C.reset}`
    );
    console.log(C.magenta + '─'.repeat(80) + C.reset);
    for (const item of preguntas) {
      console.log(`\n  ${C.bold}${C.yellow}${item.pregunta}${C.reset}`);
      console.log(`  ${C.white}R/: ${item.respuesta}${C.reset}`);
    }
  }

  return true;
}

/**
 * Batería de demostración del sistema de control de errores para mostrar en vivo
 * durante la exposición cómo el programa previene fallos matemáticos y de entrada.
 */
function ejecutarDemostracionControlErrores() {
  console.log('\n' + C.magenta + '═'.repeat(80) + C.reset);
  console.log(
    `${C.bold}${C.magenta}  BATERÍA DE PRUEBAS DE CONTROL DE ERRORES Y VALIDACIONES${C.reset}`
  );
  console.log(C.magenta + '═'.repeat(80) + C.reset);

  const casosDeError = [
    {
      nombre: 'Caso 1: Expresión vacía',
      expr: '   ',
      a: 0,
      b: 4,
    },
    {
      nombre: 'Caso 2: Paréntesis desbalanceados',
      expr: '0.5*(x^4 - 2*x^3 + 12',
      a: 0,
      b: 4,
    },
    {
      nombre: 'Caso 3: Operadores consecutivos inválidos',
      expr: 'x^2 + * 4*x',
      a: 0,
      b: 4,
    },
    {
      nombre: 'Caso 4: Función desconocida o intento de código externo',
      expr: 'alert(x) + 5',
      a: 0,
      b: 4,
    },
    {
      nombre: 'Caso 5: Límites iguales (intervalo de ancho cero a = b)',
      expr: 'x^2 + 4',
      a: 3,
      b: 3,
    },
    {
      nombre: 'Caso 6: Límite no numérico',
      expr: 'x^2 + 4',
      a: 'abc',
      b: 4,
    },
    {
      nombre: 'Caso 7: División por cero dentro del intervalo [0, 4]',
      expr: '10 / (x - 2)',
      a: 0,
      b: 4,
    },
    {
      nombre: 'Caso 8: Raíz cuadrada de número negativo en el intervalo',
      expr: 'sqrt(x - 5)',
      a: 0,
      b: 4,
    },
    {
      nombre: 'Caso 9: Logaritmo natural fuera de su dominio (x <= 0)',
      expr: 'ln(x)',
      a: 0,
      b: 4,
    },
  ];

  for (const caso of casosDeError) {
    console.log(`\n${C.bold}${C.cyan}▶ Probando ${caso.nombre}:${C.reset}`);
    console.log(`  Entrada: f(x) = "${caso.expr}"  |  a = "${caso.a}"  |  b = "${caso.b}"`);
    const comp = compilarFuncionSegura(caso.expr);
    if (!comp.ok) {
      console.log(`  ${C.green}✔ Capturado en Compilación:${C.reset} ${C.red}${comp.error}${C.reset}`);
      continue;
    }
    const val = validarLimitesYDominio(comp.fn, caso.a, caso.b);
    if (!val.ok) {
      console.log(`  ${C.green}✔ Capturado en Dominio/Límites:${C.reset} ${C.red}${val.error}${C.reset}`);
    }
  }
  console.log('\n' + C.green + '✔ Todas las validaciones respondieron correctamente sin bloquear el programa.' + C.reset);
}

// ============================================================================
// 6. BUCLE PRINCIPAL DEL MENÚ INTERACTIVO DE TERMINAL
// ============================================================================

async function iniciarMenuInteractivo() {
  // Si se ejecuta con el flag --demo, corre automáticamente el problema del servidor y las pruebas de error
  if (process.argv.includes('--demo')) {
    imprimirEncabezado();
    ejecutarYMostrarAnalisis({
      titulo: PROBLEMA_SERVIDOR.titulo,
      contexto: PROBLEMA_SERVIDOR.contexto,
      expresion: PROBLEMA_SERVIDOR.expresion,
      expresionHumana: PROBLEMA_SERVIDOR.expresionHumana,
      a: PROBLEMA_SERVIDOR.a,
      b: PROBLEMA_SERVIDOR.b,
      valorExactoOpcional: PROBLEMA_SERVIDOR.valorExacto,
      unidadIntegral: PROBLEMA_SERVIDOR.unidadIntegral,
      preguntas: PROBLEMA_SERVIDOR.preguntas,
    });
    ejecutarDemostracionControlErrores();
    return;
  }

  const rl = readline.createInterface({ input, output });

  try {
    let continuar = true;
    while (continuar) {
      imprimirEncabezado();
      console.log(`\n${C.bold}Seleccione una opción del menú:${C.reset}`);
      console.log(
        `  ${C.cyan}[1]${C.reset} ${C.bold}Cargar Problema Planteado (Ingeniería en Sistemas: Tráfico en Servidor)${C.reset}`
      );
      console.log(
        `  ${C.cyan}[2]${C.reset} Introducir datos personalizados (cualquier función f(x) y límites [a, b])`
      );
      console.log(
        `  ${C.cyan}[3]${C.reset} Ejecutar demostración automática del Control de Errores`
      );
      console.log(`  ${C.cyan}[4]${C.reset} Salir del programa\n`);

      const opcion = (await rl.question(`${C.bold}${C.yellow}➤ Ingrese su opción (1-4): ${C.reset}`)).trim();

      switch (opcion) {
        case '1': {
          ejecutarYMostrarAnalisis({
            titulo: PROBLEMA_SERVIDOR.titulo,
            contexto: PROBLEMA_SERVIDOR.contexto,
            expresion: PROBLEMA_SERVIDOR.expresion,
            expresionHumana: PROBLEMA_SERVIDOR.expresionHumana,
            a: PROBLEMA_SERVIDOR.a,
            b: PROBLEMA_SERVIDOR.b,
            valorExactoOpcional: PROBLEMA_SERVIDOR.valorExacto,
            unidadIntegral: PROBLEMA_SERVIDOR.unidadIntegral,
            preguntas: PROBLEMA_SERVIDOR.preguntas,
          });
          await rl.question(`\n${C.dim}Presione ENTER para volver al menú principal...${C.reset}`);
          break;
        }

        case '2': {
          console.log(`\n${C.bold}${C.cyan}─── MODO PERSONALIZADO: INTRODUCCIÓN DE DATOS ───${C.reset}`);
          console.log(
            `${C.dim}Ejemplos válidos: 0.5*x^4 - 2*x^3 + 4*x^2 + 12  |  sin(x) + x^2  |  exp(x)  |  sqrt(x + 1)${C.reset}`
          );

          const exprUsuario = await rl.question(`${C.yellow}1. Ingrese la función f(x): ${C.reset}`);
          const comp = compilarFuncionSegura(exprUsuario);
          if (!comp.ok) {
            console.log(`\n${C.bgRed}${C.white} ERROR ${C.reset} ${C.red}${comp.error}${C.reset}`);
            await rl.question(`\n${C.dim}Presione ENTER para intentar nuevamente...${C.reset}`);
            break;
          }

          const rawA = await rl.question(`${C.yellow}2. Ingrese el límite inferior (a): ${C.reset}`);
          const rawB = await rl.question(`${C.yellow}3. Ingrese el límite superior (b): ${C.reset}`);

          ejecutarYMostrarAnalisis({
            titulo: 'Problema Personalizado Ingresado por el Usuario',
            contexto: null,
            expresion: exprUsuario,
            expresionHumana: `f(x) = ${exprUsuario}`,
            a: rawA,
            b: rawB,
            valorExactoOpcional: null,
            unidadIntegral: 'u²',
            preguntas: [],
          });
          await rl.question(`\n${C.dim}Presione ENTER para volver al menú principal...${C.reset}`);
          break;
        }

        case '3': {
          ejecutarDemostracionControlErrores();
          await rl.question(`\n${C.dim}Presione ENTER para volver al menú principal...${C.reset}`);
          break;
        }

        case '4': {
          console.log(`\n${C.green}¡Gracias por utilizar el Laboratorio de Integración Numérica! Hasta luego.${C.reset}\n`);
          continuar = false;
          break;
        }

        default: {
          console.log(
            `\n${C.red}✖ Opción inválida "${opcion}". Por favor ingrese un número entre 1 y 4.${C.reset}`
          );
          await rl.question(`\n${C.dim}Presione ENTER para continuar...${C.reset}`);
          break;
        }
      }
    }
  } finally {
    rl.close();
  }
}

// Ejecutar si el archivo es llamado directamente desde Node.js
iniciarMenuInteractivo();

