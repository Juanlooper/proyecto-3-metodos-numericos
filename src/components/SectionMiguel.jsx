import React, { useState } from 'react';
import { RotateCcw, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { PRESETS_RAPIDOS, CASOS_ERROR_DEMO, fmt } from '../utils/mathEngine';
import MathFormula, { exprToLatex } from './MathFormula';
import InteractiveTerminal from './InteractiveTerminal';

const BLOQUES_JS = [
  {
    id: 'compilador',
    num: '01',
    nombre: 'compilarFuncionSegura(rawExpr)',
    proposito: 'Validación léxica, balanceo de paréntesis y lista blanca de tokens',
    ecuacionTex: 'f(x) \\longrightarrow \\text{AST Validado (JS Safe Function)}',
    descripcion:
      'Verifica que la cadena ingresada no esté vacía, comprueba el balance exacto de paréntesis, valida cada identificador contra una lista blanca matemática y traduce la notación algebraica a sintaxis ejecutable de JavaScript.',
    codigo: `export function compilarFuncionSegura(rawExpr) {
  if (typeof rawExpr !== 'string' || rawExpr.trim() === '') {
    return { ok: false, error: 'La expresión de la función no puede estar vacía.' };
  }

  // 1. Conteo estricto de paréntesis abiertos y cerrados
  let balance = 0;
  for (const ch of expr) {
    if (ch === '(') balance++;
    if (ch === ')') balance--;
    if (balance < 0) {
      return { ok: false, error: 'Paréntesis ")" sin su correspondiente "(".' };
    }
  }
  if (balance !== 0) {
    return { ok: false, error: \`Faltan \${balance} paréntesis de cierre.\` };
  }

  // 2. Lista blanca (Whitelist) de funciones matemáticas permitidas
  const tokensPermitidos = new Set([
    'x', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sqrt', 'cbrt', 'abs', 'ln', 'log', 'exp', 'pi', 'e'
  ]);

  // 3. Reemplazo de potencias (^) y envoltura con funciones protectoras
  jsExpr = jsExpr
    .replace(/\\^/g, '**')
    .replace(/\\bsqrt\\b/g, '__safeSqrt')
    .replace(/\\bln\\b/g, '__safeLn');

  return { ok: true, fn: fnSegura };
}`,
    claves: [
      {
        titulo: 'Algoritmo de balanceo de paréntesis',
        detalle:
          'Incrementa un contador en cada "(" y lo decrementa en cada ")". Si en cualquier posición es negativo o al finalizar es distinto de cero, aborta la compilación.',
      },
      {
        titulo: 'Prevención de inyección mediante lista blanca',
        detalle:
          'Extrae todos los identificadores alfabéticos con expresiones regulares y rechaza cualquier palabra ajena al repertorio matemático autorizado.',
      },
    ],
  },
  {
    id: 'dominio',
    num: '02',
    nombre: 'validarLimitesYDominio(fn, rawA, rawB)',
    proposito: 'Protección del dominio real, asíntotas y límites de integración',
    ecuacionTex: '\\forall x \\in [a, b] :\\; |f(x)| < \\infty,\\quad a \\neq b',
    descripcion:
      'En JavaScript estándar, dividir por cero retorna Infinity y la raíz par de un negativo retorna NaN sin lanzar error. Este módulo envuelve las funciones críticas y muestrea el intervalo [a, b] para interceptar indeterminaciones.',
    codigo: `const helpers = {
  __safeSqrt: (v) => {
    if (v < 0) throw new Error(\`Raíz cuadrada de negativo: sqrt(\${v.toFixed(4)})\`);
    return Math.sqrt(v);
  },
  __safeLn: (v) => {
    if (v <= 0) throw new Error(\`Logaritmo ln(\${v.toFixed(4)}) indefinido para <= 0\`);
    return Math.log(v);
  }
};

export function validarLimitesYDominio(fn, rawA, rawB) {
  const aNum = Number(rawA);
  const bNum = Number(rawB);

  if (Number.isNaN(aNum) || Number.isNaN(bNum)) {
    return { ok: false, error: 'Los límites a y b deben ser números reales válidos.' };
  }
  if (Math.abs(bNum - aNum) < 1e-12) {
    return { ok: false, error: 'Los límites no pueden ser iguales (ancho de intervalo cero).' };
  }

  // Barrido preventivo de continuidad en [a, b]
  for (let i = 0; i <= 20; i++) {
    const xTest = aNum + ((bNum - aNum) * i) / 20;
    const val = fn(xTest); // Lanza excepción si detecta NaN o Infinity
  }
  return { ok: true, a: aNum, b: bNum };
}`,
    claves: [
      {
        titulo: 'Interceptación de NaN e Infinity',
        detalle:
          'Cada evaluación verifica Number.isNaN(val) y Number.isFinite(val), detectando divisiones entre cero (como 10/(x-2) en x=2) antes de ejecutar las fórmulas.',
      },
      {
        titulo: 'Validación de intervalo no degenerado',
        detalle:
          'Comprueba que |b - a| > 0 y que ambos límites sean números reales finitos.',
      },
    ],
  },
  {
    id: 'trapecio',
    num: '03',
    nombre: 'metodoTrapecioSimple(fn, a, b)',
    proposito: 'Implementación del Método del Trapecio Simple y su error de truncamiento',
    ecuacionTex:
      'I_{\\text{trap}} \\approx (b - a)\\,\\frac{f(a) + f(b)}{2}, \\quad E_t = -\\frac{(b-a)^3}{12}f\'\'(\\xi)',
    descripcion:
      'Evalúa la función en los extremos del intervalo [a, b], aplica la regla trapezoidal simple y estima numéricamente la segunda derivada media para calcular el término de error de truncamiento.',
    codigo: `export function metodoTrapecioSimple(fn, a, b) {
  const h = b - a;
  const fa = fn(a);
  const fb = fn(b);

  // Fórmula del Trapecio Simple: I ≈ (b - a) * [f(a) + f(b)] / 2
  const sumaExtremos = fa + fb;
  const promedioAlturas = sumaExtremos / 2;
  const integral = h * promedioAlturas;

  // Error de Truncamiento: Et = -((b - a)^3 / 12) * f''(ξ)
  const segundaDerivadaMedia = estimarSegundaDerivadaMedia(fn, a, b);
  const errorTruncamiento = -((Math.pow(b - a, 3) / 12) * segundaDerivadaMedia);

  return { h, fa, fb, integral, errorTruncamiento };
}`,
    claves: [
      {
        titulo: 'Evaluación directa en los extremos',
        detalle:
          'Calcula f(a) y f(b) en tiempo constante O(1). En el problema del servidor: 4 * (12 + 76) / 2 = 176 GB.',
      },
      {
        titulo: 'Estimación de la segunda derivada',
        detalle:
          'Aplica diferencias finitas centradas para obtener f\'\'(ξ) promedio y evaluar -(b-a)³/12 * f\'\'(ξ).',
      },
    ],
  },
  {
    id: 'simpson',
    num: '04',
    nombre: 'metodoSimpsonUnTercioSimple(fn, a, b)',
    proposito: 'Implementación del Método de Simpson 1/3 Simple (n = 2)',
    ecuacionTex:
      'I_{\\text{simpson}} \\approx \\frac{h}{3}\\big[f(x_0) + 4f(x_1) + f(x_2)\\big], \\quad E_t = -\\frac{(b-a)^5}{2880}f^{(4)}(\\xi)',
    descripcion:
      'Subdivide el intervalo [a, b] en 2 partes iguales de paso h = (b - a) / 2, evalúa los 3 nodos equidistantes con ponderación 1 - 4 - 1 y calcula el error de truncamiento de cuarto orden.',
    codigo: `export function metodoSimpsonUnTercioSimple(fn, a, b) {
  const n = 2;
  const h = (b - a) / n;

  // Nodos equidistantes: extremo izquierdo, punto medio y extremo derecho
  const x0 = a;
  const x1 = (a + b) / 2;
  const x2 = b;

  const fx0 = fn(x0);
  const fx1 = fn(x1);
  const fx2 = fn(x2);

  // Fórmula de Simpson 1/3 Simple: I ≈ (h / 3) * [f(x0) + 4*f(x1) + f(x2)]
  const sumaPonderada = fx0 + 4 * fx1 + fx2;
  const integral = (h / 3) * sumaPonderada;

  // Error de Truncamiento: Et = -((b - a)^5 / 2880) * f^(4)(ξ)
  const cuartaDerivadaMedia = estimarCuartaDerivada(fn, a, b);
  const errorTruncamiento = -((Math.pow(b - a, 5) / 2880) * cuartaDerivadaMedia);

  return { h, x0, x1, x2, fx0, fx1, fx2, sumaPonderada, integral, errorTruncamiento };
}`,
    claves: [
      {
        titulo: 'Ponderación parabólica 1 - 4 - 1',
        detalle:
          'Otorga peso 4 al punto medio x₁ = (a+b)/2. En el servidor: (2/3) * [12 + 4(20) + 76] = (2/3) * 168 = 112 GB.',
      },
      {
        titulo: 'Diferencias finitas de cuarto orden',
        detalle:
          'Calcula la cuarta derivada f⁽⁴⁾(ξ) para evaluar el error teórico -(b-a)⁵ / 2880 * f⁽⁴⁾(ξ) = -4.2667 GB.',
      },
    ],
  },
  {
    id: 'errores',
    num: '05',
    nombre: 'calcularMetricasError() + Menú CLI',
    proposito: 'Cálculo de errores verdaderos e interfaz interactiva de consola',
    ecuacionTex:
      '|E_v| = |I_{\\text{exacta}} - I_{\\text{aprox}}|, \\qquad \\varepsilon_t = \\frac{|E_v|}{|I_{\\text{exacta}}|} \\times 100\\%',
    descripcion:
      'Compara las aproximaciones numéricas contra el valor exacto para obtener el Error Verdadero Absoluto y el Error Relativo Porcentual, presentando los resultados en consola mediante node:readline/promises.',
    codigo: `export function calcularMetricasError(valorExacto, valorAproximado, errorTruncamientoTeorico) {
  const errorConSigno = valorExacto - valorAproximado;
  const errorAbsoluto = Math.abs(errorConSigno);

  const errorRelativoPorcentual =
    Math.abs(valorExacto) > 1e-12
      ? (errorAbsoluto / Math.abs(valorExacto)) * 100
      : 0;

  return {
    valorExacto,
    valorAproximado,
    errorAbsoluto,
    errorRelativoPorcentual,
    errorTruncamientoTeorico,
  };
}`,
    claves: [
      {
        titulo: 'Métricas estandarizadas de exactitud',
        detalle:
          'Entrega tanto la desviación absoluta en unidades del problema (GB) como la desviación porcentual relativa (εt %).',
      },
      {
        titulo: 'Ejecución dual (Terminal y Web)',
        detalle:
          'El mismo motor lógico alimenta el script de consola (npm run terminal) y esta interfaz en React.',
      },
    ],
  },
];

export default function SectionMiguel({
  expresionInput,
  setExpresionInput,
  limiteA,
  setLimiteA,
  limiteB,
  setLimiteB,
  resultado,
  esCasoServidor,
  onCargarServidor,
}) {
  const [subvista, setSubvista] = useState('terminal'); // 'terminal' | 'parametros' | 'arquitectura'
  const [bloqueId, setBloqueId] = useState('compilador');

  const bloqueActual = BLOQUES_JS.find((b) => b.id === bloqueId) || BLOQUES_JS[0];

  const handleSincronizarDesdeTerminal = (fnStr, aStr, bStr) => {
    setExpresionInput(fnStr);
    setLimiteA(aStr);
    setLimiteB(bStr);
  };

  return (
    <div className="section-view">
      <div className="section-intro">
        <div className="section-meta-row">
          <span className="speaker-tag">SECCIÓN 03 · EXPOSITOR: MIGUEL OLIVER</span>
          <span className="section-topic">Representación en Computadora y Código JavaScript</span>
        </div>
        <h2>Terminal Interactiva en Vivo, Control de Errores y Arquitectura en JavaScript</h2>
        <p>
          Ejecución interactiva del programa de consola directamente desde el navegador, pruebas de
          validación contra entradas inválidas y desglose modular del código fuente.
        </p>
      </div>

      <div className="subnav-bar">
        <div className="subnav-tabs">
          <button
            type="button"
            className={`subnav-tab ${subvista === 'terminal' ? 'is-active' : ''}`}
            onClick={() => setSubvista('terminal')}
          >
            <span className="subnav-num">3.1</span>
            <span>Terminal Interactiva en Vivo (CLI)</span>
          </button>

          <button
            type="button"
            className={`subnav-tab ${subvista === 'parametros' ? 'is-active' : ''}`}
            onClick={() => setSubvista('parametros')}
          >
            <span className="subnav-num">3.2</span>
            <span>Formulario de Datos y Casos de Error</span>
          </button>

          <button
            type="button"
            className={`subnav-tab ${subvista === 'arquitectura' ? 'is-active' : ''}`}
            onClick={() => setSubvista('arquitectura')}
          >
            <span className="subnav-num">3.3</span>
            <span>Explicación Modular del Código Fuente JS</span>
          </button>
        </div>
      </div>

      {/* SUBVISTA 3.1: TERMINAL INTERACTIVA EN VIVO */}
      {subvista === 'terminal' && (
        <InteractiveTerminal onSincronizarDatos={handleSincronizarDesdeTerminal} />
      )}

      {/* SUBVISTA 3.2: FORMULARIO DE PARÁMETROS Y PRUEBAS DE ERROR */}
      {subvista === 'parametros' && (
        <div className="clean-two-col">
          <div className="editorial-panel">
            <div className="panel-header-split">
              <div>
                <span className="panel-kicker">Parámetros de Entrada</span>
                <h3>Configuración de Función y Límites</h3>
              </div>

              <button
                type="button"
                className={`btn-primary-sm ${esCasoServidor ? 'is-preset-active' : ''}`}
                onClick={onCargarServidor}
              >
                <RotateCcw size={14} />
                <span>
                  {esCasoServidor
                    ? 'Problema del Servidor Activo'
                    : 'Setear Datos del Problema Planteado'}
                </span>
              </button>
            </div>

            <div className="form-stack">
              <div className="field-block">
                <label htmlFor="miguel-fn">
                  Función matemática <MathFormula tex="f(x)" /> o <MathFormula tex="R(t)" />:
                </label>
                <input
                  id="miguel-fn"
                  type="text"
                  value={expresionInput}
                  onChange={(e) => setExpresionInput(e.target.value)}
                  className={!resultado.ok ? 'has-error' : ''}
                  placeholder="0.5*x^4 - 2*x^3 + 4*x^2 + 12"
                />
              </div>

              <div className="field-row-2">
                <div className="field-block">
                  <label htmlFor="miguel-a">
                    Límite inferior (<MathFormula tex="a" />
                    ):
                  </label>
                  <input
                    id="miguel-a"
                    type="text"
                    value={limiteA}
                    onChange={(e) => setLimiteA(e.target.value)}
                  />
                </div>
                <div className="field-block">
                  <label htmlFor="miguel-b">
                    Límite superior (<MathFormula tex="b" />
                    ):
                  </label>
                  <input
                    id="miguel-b"
                    type="text"
                    value={limiteB}
                    onChange={(e) => setLimiteB(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {resultado.ok ? (
              <div className="status-box status-ok">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Validación exitosa · Expresión interpretada:</strong>
                  <div style={{ marginTop: '6px' }}>
                    <MathFormula
                      tex={`\\int_{${resultado.a}}^{${resultado.b}} \\left(${exprToLatex(
                        expresionInput,
                        'x'
                      )}\\right) dx \\quad\\Longrightarrow\\quad I_{\\text{trap}} = ${resultado.trapecio.integral.toFixed(
                        4
                      )},\\; I_{\\text{simpson}} = ${resultado.simpson.integral.toFixed(4)}`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="status-box status-err" role="alert">
                <AlertOctagon size={20} />
                <div>
                  <strong>Excepción interceptada ({resultado.tipoError})</strong>
                  <p>{resultado.error}</p>
                </div>
              </div>
            )}

            <div className="test-cases-section">
              <h4>Funciones Válidas de Ejemplo</h4>
              <div className="preset-pills-row">
                {PRESETS_RAPIDOS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="btn-quiet"
                    onClick={() => {
                      setExpresionInput(item.expresion);
                      setLimiteA(item.a);
                      setLimiteB(item.b);
                    }}
                  >
                    {item.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="editorial-panel">
            <span className="panel-kicker">Pruebas de Robustez</span>
            <h3>Casos de Prueba del Controlador de Errores</h3>
            <p className="panel-prose">
              Seleccione cualquiera de estos escenarios inválidos para verificar cómo el motor
              intercepta errores de sintaxis, dominio real y límites sin interrumpir la aplicación:
            </p>
            <div className="test-grid-2">
              {CASOS_ERROR_DEMO.map((caso) => (
                <button
                  key={caso.id}
                  type="button"
                  className="test-case-btn"
                  onClick={() => {
                    setExpresionInput(caso.expresion);
                    setLimiteA(caso.a);
                    setLimiteB(caso.b);
                  }}
                >
                  <span className="test-cat">{caso.categoria}</span>
                  <strong>{caso.titulo}</strong>
                  <code>f(x) = {caso.expresion}</code>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBVISTA 3.3: EXPLICACIÓN MODULAR DEL CÓDIGO FUENTE JS */}
      {subvista === 'arquitectura' && (
        <div className="juan-workspace-grid">
          <aside className="steps-rail">
            <div className="rail-header">
              <span>Módulos de cli/integracion_terminal.js</span>
              <small>5 bloques</small>
            </div>

            <div className="rail-list">
              {BLOQUES_JS.map((b) => {
                const activo = b.id === bloqueId;
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`rail-step-card ${activo ? 'is-active' : ''}`}
                    onClick={() => setBloqueId(b.id)}
                  >
                    <div className="rail-step-top">
                      <span className="rail-num">{b.num}</span>
                      <strong className="rail-title">{b.nombre}</strong>
                    </div>
                    <p className="rail-desc">{b.proposito}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="juan-canvas-column">
            <div className="terminal-panel">
              <div className="terminal-top-bar">
                <span className="terminal-title">
                  cli/integracion_terminal.js — {bloqueActual.nombre}
                </span>
                <span className="terminal-status">ES Module · Node.js</span>
              </div>
              <pre className="code-clean-pre">
                <code>{bloqueActual.codigo}</code>
              </pre>
            </div>

            <div className="editorial-panel">
              <span className="panel-kicker">Explicación del Funcionamiento</span>
              <h3>{bloqueActual.proposito}</h3>
              <div className="master-formula">
                <MathFormula block tex={bloqueActual.ecuacionTex} />
              </div>
              <p className="panel-prose">{bloqueActual.descripcion}</p>

              <div className="clean-two-col-inner">
                {bloqueActual.claves.map((item, i) => (
                  <div key={i} className="tech-note-card">
                    <strong>
                      {i + 1}. {item.titulo}
                    </strong>
                    <p>{item.detalle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
