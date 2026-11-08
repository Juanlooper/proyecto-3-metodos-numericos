/**
 * Motor matemático compartido para la interfaz web interactiva (React + Vite)
 * Implementa el mismo control exhaustivo de errores y fórmulas que cli/integracion_terminal.js
 */

export const PROBLEMA_SERVIDOR = {
  id: 'servidor-backup',
  titulo: 'Monitoreo de Transferencia de Datos en Servidor Cloud (Ventana de Backup)',
  subtitulo: 'Caso de Estudio Aplicado a Ingeniería en Sistemas',
  contexto:
    'Un ingeniero en sistemas monitorea el nodo principal de almacenamiento durante una ventana crítica de respaldo distribuido (backup) de 4 horas (t = 0 h hasta t = 4 h). La tasa de transferencia de red R(t), medida en Gigabytes por hora (GB/h), varía según una función polinómica de cuarto grado.',
  expresion: '0.5*x^4 - 2*x^3 + 4*x^2 + 12',
  expresionHumana: 'R(t) = 0.5t⁴ - 2t³ + 4t² + 12',
  a: '0',
  b: '4',
  unidadX: 'horas (h)',
  unidadY: 'GB/h',
  unidadArea: 'GB',
  valorExactoAnalitico: 1616 / 15, // 107.73333333333333 GB
  bufferReservado: 120,
  preguntas: [
    {
      id: 1,
      pregunta: '¿Cuál es el volumen real (exacto) de datos transferidos durante las 4 horas de respaldo?',
      respuesta:
        'Al integrar analíticamente R(t) = 0.5t⁴ - 2t³ + 4t² + 12 entre t = 0 y t = 4 horas, obtenemos [0.1t⁵ - 0.5t⁴ + (4/3)t³ + 12t]₀⁴ = 102.4 - 128 + 85.3333 + 48 = 107.7333 GB (1616/15 GB).',
      badge: '107.7333 GB exactos',
    },
    {
      id: 2,
      pregunta: '¿Qué volumen estima cada método numérico y cuál representa con mayor fidelidad el tráfico de red?',
      respuesta:
        'El Método del Trapecio Simple estima 176.0000 GB con un error verdadero absoluto de 68.2667 GB (error relativo de 63.37%), ya que une los extremos con una línea recta sin detectar el valle intermedio en t = 2h. En cambio, el Método de Simpson 1/3 Simple estima 112.0000 GB con un error absoluto de apenas 4.2667 GB (error relativo de 3.96%), reduciendo el error casi 16 veces al ajustar una parábola que pasa por R(0)=12, R(2)=20 y R(4)=76.',
      badge: 'Simpson es 16x más preciso',
    },
    {
      id: 3,
      pregunta: 'Si el servidor dispone de un buffer temporal de almacenamiento de 120 GB, ¿qué decisión de ingeniería induce cada método?',
      respuesta:
        'Usar el Trapecio Simple (176 GB > 120 GB) dispararía una falsa alerta de saturación de disco (buffer overflow), obligando a escalar almacenamiento innecesariamente. Con Simpson 1/3 Simple (112 GB < 120 GB) se concluye acertadamente que el buffer de 120 GB absorberá la transferencia completa con un margen libre de 8 GB estimados (12.27 GB reales).',
      badge: 'Buffer de 120 GB es suficiente',
    },
  ],
};

export const PRESETS_RAPIDOS = [
  {
    id: 'servidor',
    nombre: 'Caso Servidor Cloud (Planteado)',
    descripcion: 'R(t) = 0.5x⁴ - 2x³ + 4x² + 12 en [0, 4]',
    expresion: '0.5*x^4 - 2*x^3 + 4*x^2 + 12',
    a: '0',
    b: '4',
    esProblemaPrincipal: true,
  },
  {
    id: 'cpu-carga',
    nombre: 'Carga de CPU Cúbica (Error Simpson = 0)',
    descripcion: 'f(x) = 0.5x³ - 2x² + 3x + 5 en [0, 4]',
    expresion: '0.5*x^3 - 2*x^2 + 3*x + 5',
    a: '0',
    b: '4',
    esProblemaPrincipal: false,
  },
  {
    id: 'latencia-exp',
    nombre: 'Crecimiento Exponencial de Peticiones',
    descripcion: 'f(x) = 5*exp(0.4*x) en [0, 4]',
    expresion: '5*exp(0.4*x)',
    a: '0',
    b: '4',
    esProblemaPrincipal: false,
  },
  {
    id: 'ondas-red',
    nombre: 'Oscilación de Ancho de Banda',
    descripcion: 'f(x) = 15 + 8*sin(0.6*x) + 0.5*x^2 en [0, 4]',
    expresion: '15 + 8*sin(0.6*x) + 0.5*x^2',
    a: '0',
    b: '4',
    esProblemaPrincipal: false,
  },
];

export const CASOS_ERROR_DEMO = [
  {
    id: 'err-parentesis',
    titulo: 'Paréntesis desbalanceados',
    expresion: '0.5*(x^4 - 2*x^3 + 12',
    a: '0',
    b: '4',
    categoria: 'Sintaxis',
  },
  {
    id: 'err-operadores',
    titulo: 'Operadores duplicados (x^2 + * 4)',
    expresion: 'x^2 + * 4*x',
    a: '0',
    b: '4',
    categoria: 'Sintaxis',
  },
  {
    id: 'err-div-cero',
    titulo: 'División por cero en x = 2',
    expresion: '10 / (x - 2)',
    a: '0',
    b: '4',
    categoria: 'Dominio / Asíntota',
  },
  {
    id: 'err-sqrt-neg',
    titulo: 'Raíz cuadrada negativa en [0, 4]',
    expresion: 'sqrt(x - 5)',
    a: '0',
    b: '4',
    categoria: 'Dominio Real',
  },
  {
    id: 'err-ln-cero',
    titulo: 'Logaritmo natural ln(x) en x = 0',
    expresion: 'ln(x)',
    a: '0',
    b: '4',
    categoria: 'Dominio Real',
  },
  {
    id: 'err-limites-iguales',
    titulo: 'Límites iguales (a = b = 3)',
    expresion: '0.5*x^4 + 12',
    a: '3',
    b: '3',
    categoria: 'Límites Inválidos',
  },
];

export function compilarFuncionSegura(rawExpr) {
  if (typeof rawExpr !== 'string' || rawExpr.trim() === '') {
    return {
      ok: false,
      tipoError: 'Expresión Vacía',
      error: 'La expresión matemática f(x) no puede estar vacía.',
    };
  }

  let expr = rawExpr.trim().toLowerCase();

  // Permitir 't' además de 'x'
  expr = expr
    .replace(/\bsqrt\b/g, '__SQRT__')
    .replace(/\btan\b/g, '__TAN__')
    .replace(/\batan\b/g, '__ATAN__')
    .replace(/\bt\b/g, 'x')
    .replace(/__SQRT__/g, 'sqrt')
    .replace(/__TAN__/g, 'tan')
    .replace(/__ATAN__/g, 'atan');

  let balance = 0;
  for (const ch of expr) {
    if (ch === '(') balance++;
    if (ch === ')') balance--;
    if (balance < 0) {
      return {
        ok: false,
        tipoError: 'Error de Sintaxis (Paréntesis)',
        error: 'Se encontró un paréntesis de cierre ")" sin su correspondiente apertura "(".',
      };
    }
  }
  if (balance !== 0) {
    return {
      ok: false,
      tipoError: 'Error de Sintaxis (Paréntesis)',
      error: `Paréntesis desbalanceados: faltan ${balance} paréntesis de cierre ")".`,
    };
  }

  if (/\(\s*\)/.test(expr)) {
    return {
      ok: false,
      tipoError: 'Error de Sintaxis',
      error: 'No se permiten paréntesis vacíos "()".',
    };
  }

  const caracteresValidos = /^[0-9x+\-*/^.,()\s_a-z]+$/;
  if (!caracteresValidos.test(expr)) {
    return {
      ok: false,
      tipoError: 'Caracteres No Permitidos',
      error: 'La función contiene símbolos ilegales. Use números, x, +, -, *, /, ^ y funciones matemáticas.',
    };
  }

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
        tipoError: 'Identificador Desconocido',
        error: `No se reconoce "${palabra}". Use 'x' (o 't') como variable y funciones estándar (sin, cos, tan, sqrt, ln, log, exp, abs).`,
      };
    }
  }

  const sinEspacios = expr.replace(/\s+/g, '');
  if (/^[*/^]/.test(sinEspacios) || /[+\-*/^]$/.test(sinEspacios)) {
    return {
      ok: false,
      tipoError: 'Operador Mal Ubicado',
      error: 'La expresión no puede empezar ni terminar con un operador binario (*, /, ^, +, -).',
    };
  }
  if (/[+\-*/^]{2,}/.test(sinEspacios.replace(/\*\*/g, '^').replace(/[*/^][+-]/g, ''))) {
    return {
      ok: false,
      tipoError: 'Operadores Duplicados',
      error: 'Se detectaron operadores matemáticos consecutivos inválidos.',
    };
  }

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

  const helpers = {
    __safeSqrt: (v) => {
      if (v < 0) throw new Error(`Raíz cuadrada de número negativo: sqrt(${v.toFixed(4)}).`);
      return Math.sqrt(v);
    },
    __safeLn: (v) => {
      if (v <= 0) throw new Error(`Logaritmo natural ln(${v.toFixed(4)}) indefinido para valores <= 0.`);
      return Math.log(v);
    },
    __safeLog10: (v) => {
      if (v <= 0) throw new Error(`Logaritmo base 10 log(${v.toFixed(4)}) indefinido para valores <= 0.`);
      return Math.log10(v);
    },
    __safeAsin: (v) => {
      if (v < -1 || v > 1) throw new Error(`arcsin(${v.toFixed(4)}) fuera del dominio [-1, 1].`);
      return Math.asin(v);
    },
    __safeAcos: (v) => {
      if (v < -1 || v > 1) throw new Error(`arccos(${v.toFixed(4)}) fuera del dominio [-1, 1].`);
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
  } catch (err) {
    return {
      ok: false,
      tipoError: 'Error de Compilación',
      error: `Sintaxis matemática incompleta o inválida (${err.message}).`,
    };
  }

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
      throw new Error(`Indeterminación matemática (0/0 o NaN) al evaluar en x = ${Number(x.toFixed(4))}.`);
    }
    if (!Number.isFinite(val)) {
      throw new Error(`Asíntota vertical o división por cero detectada en x = ${Number(x.toFixed(4))}.`);
    }
    return val;
  };

  return { ok: true, fn: fnSegura, normalized: expr };
}

export function analizarIntegracionCompleta(rawExpr, rawA, rawB) {
  const comp = compilarFuncionSegura(rawExpr);
  if (!comp.ok) {
    return { ok: false, tipoError: comp.tipoError, error: comp.error };
  }

  const strA = String(rawA ?? '').trim().replace(',', '.');
  const strB = String(rawB ?? '').trim().replace(',', '.');

  if (strA === '' || strB === '') {
    return {
      ok: false,
      tipoError: 'Límites Incompletos',
      error: 'Debe ingresar tanto el límite inferior (a) como el límite superior (b).',
    };
  }

  const a = Number(strA);
  const b = Number(strB);

  if (Number.isNaN(a) || !Number.isFinite(a)) {
    return {
      ok: false,
      tipoError: 'Límite Inferior Inválido',
      error: `El valor "${rawA}" para el límite inferior (a) no es un número real válido.`,
    };
  }
  if (Number.isNaN(b) || !Number.isFinite(b)) {
    return {
      ok: false,
      tipoError: 'Límite Superior Inválido',
      error: `El valor "${rawB}" para el límite superior (b) no es un número real válido.`,
    };
  }
  if (Math.abs(b - a) < 1e-12) {
    return {
      ok: false,
      tipoError: 'Intervalo Nulo (a = b)',
      error: `Los límites no pueden ser iguales (a = b = ${a}). El intervalo de integración tiene ancho cero.`,
    };
  }
  if (Math.abs(b - a) > 1e5) {
    return {
      ok: false,
      tipoError: 'Intervalo Excesivo',
      error: 'Por estabilidad gráfica y numérica, use un intervalo con amplitud menor a 100,000.',
    };
  }

  const fn = comp.fn;

  // Muestrear 40 puntos para garantizar ausencia de discontinuidades o violaciones de dominio
  const muestras = 40;
  for (let i = 0; i <= muestras; i++) {
    const xTest = a + ((b - a) * i) / muestras;
    try {
      fn(xTest);
    } catch (err) {
      return {
        ok: false,
        tipoError: 'Error de Dominio / Continuidad',
        error: `En x = ${Number(xTest.toFixed(4))}: ${err.message}`,
      };
    }
  }

  // Nodos fundamentales
  const x0 = a;
  const x1 = (a + b) / 2;
  const x2 = b;
  const hTrapecio = b - a;
  const hSimpson = (b - a) / 2;

  const fx0 = fn(x0);
  const fx1 = fn(x1);
  const fx2 = fn(x2);

  // 1. Trapecio Simple
  const integralTrapecio = hTrapecio * ((fx0 + fx2) / 2);

  // Segunda derivada media en [a, b]
  const delta2 = Math.max(Math.abs(b - a) * 1e-5, 1e-6);
  const d1 = (x) => (fn(x + delta2) - fn(x - delta2)) / (2 * delta2);
  const f2Media = (d1(b) - d1(a)) / (b - a);
  const errorTruncTrapecio = -((Math.pow(b - a, 3) / 12) * f2Media);

  // 2. Simpson 1/3 Simple
  const sumaPonderadaSimpson = fx0 + 4 * fx1 + fx2;
  const integralSimpson = (hSimpson / 3) * sumaPonderadaSimpson;

  // Cuarta derivada media en xm
  const delta4 = Math.max(Math.abs(b - a) * 0.02, 1e-3);
  const f4Media =
    (fn(x1 - 2 * delta4) -
      4 * fn(x1 - delta4) +
      6 * fn(x1) -
      4 * fn(x1 + delta4) +
      fn(x1 + 2 * delta4)) /
    Math.pow(delta4, 4);
  const errorTruncSimpson = -((Math.pow(b - a, 5) / 2880) * f4Media);

  // 3. Valor exacto / referencia de alta precisión (Compuesto N = 1000)
  const nRef = 1000;
  const hRef = (b - a) / nRef;
  let sumaRef = fn(a) + fn(b);
  for (let i = 1; i < nRef; i++) {
    sumaRef += (i % 2 === 0 ? 2 : 4) * fn(a + i * hRef);
  }
  const valorExacto = (hRef / 3) * sumaRef;

  // Polinomio interpolador de Lagrange grado 1 (recta del Trapecio)
  const evaluarRectaTrapecio = (x) => {
    const t = (x - x0) / (x2 - x0);
    return fx0 + t * (fx2 - fx0);
  };

  // Polinomio interpolador de Lagrange grado 2 (parábola de Simpson 1/3)
  const evaluarParabolaSimpson = (x) => {
    const L0 = ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2));
    const L1 = ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2));
    const L2 = ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
    return fx0 * L0 + fx1 * L1 + fx2 * L2;
  };

  // Errores verdaderos
  const errorAbsTrapecio = Math.abs(valorExacto - integralTrapecio);
  const errorRelTrapecio =
    Math.abs(valorExacto) > 1e-12 ? (errorAbsTrapecio / Math.abs(valorExacto)) * 100 : 0;

  const errorAbsSimpson = Math.abs(valorExacto - integralSimpson);
  const errorRelSimpson =
    Math.abs(valorExacto) > 1e-12 ? (errorAbsSimpson / Math.abs(valorExacto)) * 100 : 0;

  return {
    ok: true,
    expresion: rawExpr,
    a,
    b,
    invertido: a > b,
    nodos: { x0, x1, x2, fx0, fx1, fx2 },
    fn,
    evaluarRectaTrapecio,
    evaluarParabolaSimpson,
    valorExacto,
    trapecio: {
      h: hTrapecio,
      sumaExtremos: fx0 + fx2,
      promedioAlturas: (fx0 + fx2) / 2,
      integral: integralTrapecio,
      f2Media,
      errorTruncamiento: errorTruncTrapecio,
      errorAbsoluto: errorAbsTrapecio,
      errorConSigno: valorExacto - integralTrapecio,
      errorRelativo: errorRelTrapecio,
    },
    simpson: {
      h: hSimpson,
      sumaPonderada: sumaPonderadaSimpson,
      integral: integralSimpson,
      f4Media,
      errorTruncamiento: errorTruncSimpson,
      errorAbsoluto: errorAbsSimpson,
      errorConSigno: valorExacto - integralSimpson,
      errorRelativo: errorRelSimpson,
    },
  };
}

export function fmt(num, dec = 4) {
  if (typeof num !== 'number' || Number.isNaN(num)) return 'NaN';
  if (Math.abs(num - Math.round(num)) < 1e-9) return Math.round(num).toString();
  return Number(num.toFixed(dec)).toString();
}

