import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { PROBLEMA_SERVIDOR, fmt } from '../utils/mathEngine';
import MathFormula, { exprToLatex } from './MathFormula';

const SUBVISTAS_NICOLE = [
  { id: 'planteamiento', num: '2.1', titulo: 'Planteamiento y Solución Exacta' },
  { id: 'trapecio', num: '2.2', titulo: 'Demostración: Trapecio Simple' },
  { id: 'simpson', num: '2.3', titulo: 'Demostración: Simpson 1/3 Simple' },
  { id: 'preguntas', num: '2.4', titulo: 'Comparativa y Preguntas del Problema' },
];

export default function SectionNicole({ datos, esCasoServidor, onCargarServidor }) {
  const [subvista, setSubvista] = useState('planteamiento');
  const { nodos, trapecio, simpson, valorExacto, a, b } = datos;
  const unidadTex = esCasoServidor ? '\\text{ GB}' : '\\text{ u}^2';
  const tasaTex = esCasoServidor ? '\\text{ GB/h}' : '';

  const idxActual = SUBVISTAS_NICOLE.findIndex((s) => s.id === subvista);

  return (
    <div className="section-view">
      <div className="section-intro">
        <div className="section-meta-row">
          <span className="speaker-tag">SECCIÓN 02 · EXPOSITORA: NICOLE CÁCERES</span>
          <span className="section-topic">Informe, Demostración Matemática y Análisis de Error</span>
        </div>
        <h2>Demostración Paso a Paso y Aplicación del Caso de Ingeniería en Sistemas</h2>
        <p>
          Desarrollo analítico completo de los métodos sobre el modelo de transferencia de red,
          evaluación del error verdadero <MathFormula tex="|E_v|" /> y de truncamiento{' '}
          <MathFormula tex="E_t" />, y toma de decisiones de infraestructura.
        </p>
      </div>

      <div className="subnav-bar">
        <div className="subnav-tabs">
          {SUBVISTAS_NICOLE.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`subnav-tab ${subvista === item.id ? 'is-active' : ''}`}
              onClick={() => setSubvista(item.id)}
            >
              <span className="subnav-num">{item.num}</span>
              <span>{item.titulo}</span>
            </button>
          ))}
        </div>

        <div className="subnav-arrows">
          <button
            type="button"
            className="btn-quiet"
            disabled={idxActual === 0}
            onClick={() => idxActual > 0 && setSubvista(SUBVISTAS_NICOLE[idxActual - 1].id)}
          >
            <ChevronLeft size={15} /> Anterior
          </button>
          <button
            type="button"
            className="btn-quiet"
            disabled={idxActual === SUBVISTAS_NICOLE.length - 1}
            onClick={() =>
              idxActual < SUBVISTAS_NICOLE.length - 1 &&
              setSubvista(SUBVISTAS_NICOLE[idxActual + 1].id)
            }
          >
            Siguiente <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {!esCasoServidor && (
        <div className="notice-bar">
          <span>
            Actualmente se muestran los cálculos para la función personalizada{' '}
            <MathFormula tex={`f(x) = ${exprToLatex(datos.expresion, 'x')}`} /> en{' '}
            <MathFormula tex={`[${a}, ${b}]`} />.
          </span>
          <button type="button" className="btn-primary-sm" onClick={onCargarServidor}>
            Restaurar datos del Problema del Servidor
          </button>
        </div>
      )}

      {/* SUBVISTA 2.1: PLANTEAMIENTO Y SOLUCIÓN ANALÍTICA */}
      {subvista === 'planteamiento' && (
        <div className="clean-two-col">
          <div className="editorial-panel">
            <span className="panel-kicker">Contexto Operativo · Ingeniería en Sistemas</span>
            <h3>{PROBLEMA_SERVIDOR.titulo}</h3>
            <p className="panel-prose">{PROBLEMA_SERVIDOR.contexto}</p>

            <div className="math-statement-box">
              <div className="math-row">
                <span>Función de tasa de transferencia:</span>
                <MathFormula tex="R(t) = 0.5t^{4} - 2t^{3} + 4t^{2} + 12" />
              </div>
              <div className="math-row">
                <span>Intervalo de ventana de respaldo:</span>
                <MathFormula tex="[a, b] = [0, 4]\text{ horas}" />
              </div>
              <div className="math-row">
                <span>Integral definida del volumen:</span>
                <MathFormula tex="V = \int_{0}^{4} R(t)\,dt" />
              </div>
              <div className="math-row">
                <span>Buffer SSD reservado en el servidor:</span>
                <MathFormula tex="C_{\text{buffer}} = 120.0000\text{ GB}" />
              </div>
            </div>
          </div>

          <div className="editorial-panel">
            <span className="panel-kicker">Referencia Exacta y Nodos de Evaluación</span>
            <h3>Cálculo Analítico y Valores Nodales</h3>

            <div className="derivation-steps">
              <div className="deriv-item">
                <span className="deriv-label">1. Antiderivada Analítica</span>
                <MathFormula
                  block
                  tex="F(t) = \left[\,0.1t^{5} - 0.5t^{4} + \frac{4}{3}t^{3} + 12t\,\right]_{0}^{4}"
                />
              </div>
              <div className="deriv-item">
                <span className="deriv-label">2. Evaluación mediante Regla de Barrow</span>
                <MathFormula
                  block
                  tex="I_{\text{exacta}} = 102.4 - 128 + 85.3333 + 48"
                />
              </div>
              <div className="deriv-item result-highlight">
                <span className="deriv-label">Valor Exacto Real</span>
                <MathFormula
                  block
                  tex={`I_{\\text{exacta}} = \\frac{1616}{15} \\approx ${valorExacto.toFixed(4)}${unidadTex}`}
                />
              </div>
            </div>

            <h4 className="subtable-heading">
              Tabla de Nodos Equidistantes en <MathFormula tex={`[${a}, ${b}]`} />
            </h4>
            <div className="table-responsive">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Nodo</th>
                    <th>Posición</th>
                    <th>Evaluación</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <MathFormula tex="x_0 = a" />
                    </td>
                    <td>
                      <MathFormula tex={`t_0 = ${fmt(nodos.x0)}`} />
                    </td>
                    <td>
                      <MathFormula tex={`R(${fmt(nodos.x0)})`} />
                    </td>
                    <td>
                      <MathFormula tex={`\\mathbf{${fmt(nodos.fx0)}}${tasaTex}`} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <MathFormula tex="x_1 = \frac{a+b}{2}" />
                    </td>
                    <td>
                      <MathFormula tex={`t_1 = ${fmt(nodos.x1)}`} />
                    </td>
                    <td>
                      <MathFormula tex={`R(${fmt(nodos.x1)})`} />
                    </td>
                    <td>
                      <MathFormula tex={`\\mathbf{${fmt(nodos.fx1)}}${tasaTex}`} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <MathFormula tex="x_2 = b" />
                    </td>
                    <td>
                      <MathFormula tex={`t_2 = ${fmt(nodos.x2)}`} />
                    </td>
                    <td>
                      <MathFormula tex={`R(${fmt(nodos.x2)})`} />
                    </td>
                    <td>
                      <MathFormula tex={`\\mathbf{${fmt(nodos.fx2)}}${tasaTex}`} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBVISTA 2.2: DEMOSTRACIÓN PASO A PASO TRAPECIO SIMPLE */}
      {subvista === 'trapecio' && (
        <div className="clean-two-col">
          <div className="editorial-panel">
            <span className="panel-kicker">Fórmula de Newton-Cotes de Grado 1</span>
            <h3>Desarrollo Paso a Paso — Método del Trapecio Simple</h3>
            <div className="master-formula">
              <MathFormula
                block
                tex="I_{\text{trapecio}} \approx (b - a)\,\frac{f(a) + f(b)}{2}"
              />
            </div>

            <div className="numbered-work">
              <div className="work-step">
                <span className="work-num">Paso 1</span>
                <div>
                  <strong>Determinar el ancho total del intervalo</strong>
                  <MathFormula
                    block
                    tex={`h = b - a = ${fmt(b)} - ${fmt(a)} = ${fmt(trapecio.h)}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">Paso 2</span>
                <div>
                  <strong>Evaluar la función en los extremos del intervalo</strong>
                  <MathFormula
                    block
                    tex={`f(${fmt(nodos.x0)}) = ${fmt(nodos.fx0)}, \\qquad f(${fmt(
                      nodos.x2
                    )}) = ${fmt(nodos.fx2)}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">Paso 3</span>
                <div>
                  <strong>Sustituir los valores en la fórmula del Trapecio Simple</strong>
                  <MathFormula
                    block
                    tex={`I_{\\text{trapecio}} \\approx ${fmt(trapecio.h)} \\cdot \\frac{${fmt(
                      nodos.fx0
                    )} + ${fmt(nodos.fx2)}}{2} = ${fmt(trapecio.h)} \\cdot ${fmt(
                      trapecio.promedioAlturas
                    )}`}
                  />
                </div>
              </div>

              <div className="work-step final-amber">
                <span className="work-num">Resultado</span>
                <div>
                  <strong>Estimación obtenida por Trapecio Simple</strong>
                  <div className="final-figure text-amber">
                    <MathFormula
                      tex={`I_{\\text{trapecio}} = ${trapecio.integral.toFixed(4)}${unidadTex}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="editorial-panel">
            <span className="panel-kicker">Cuantificación de Exactitud</span>
            <h3>Aplicación del Error — Trapecio Simple</h3>

            <div className="numbered-work">
              <div className="work-step">
                <span className="work-num">1. Error Verdadero</span>
                <div>
                  <strong>Diferencia absoluta frente al valor exacto</strong>
                  <MathFormula
                    block
                    tex={`|E_v| = \\left|${valorExacto.toFixed(4)} - ${trapecio.integral.toFixed(
                      4
                    )}\\right| = ${trapecio.errorAbsoluto.toFixed(4)}${unidadTex}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">2. Error Relativo</span>
                <div>
                  <strong>Error Relativo Porcentual</strong>
                  <MathFormula
                    block
                    tex={`\\varepsilon_t = \\frac{${trapecio.errorAbsoluto.toFixed(
                      4
                    )}}{${valorExacto.toFixed(4)}} \\times 100\\% = \\mathbf{${trapecio.errorRelativo.toFixed(
                      2
                    )}\\%}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">3. Truncamiento</span>
                <div>
                  <strong>Error de Truncamiento Teórico</strong>
                  <MathFormula block tex="E_t = -\frac{(b - a)^{3}}{12}\,f''(\xi)" />
                  <p className="step-subnote">
                    Con segunda derivada media{' '}
                    <MathFormula tex={`\\overline{f''} = ${fmt(trapecio.f2Media, 2)}`} />:
                  </p>
                  <MathFormula
                    block
                    tex={`E_t = -\\frac{(${fmt(trapecio.h)})^{3}}{12}(${fmt(
                      trapecio.f2Media,
                      2
                    )}) = \\mathbf{${trapecio.errorTruncamiento.toFixed(4)}}${unidadTex}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVISTA 2.3: DEMOSTRACIÓN PASO A PASO SIMPSON 1/3 SIMPLE */}
      {subvista === 'simpson' && (
        <div className="clean-two-col">
          <div className="editorial-panel">
            <span className="panel-kicker">Fórmula de Newton-Cotes de Grado 2</span>
            <h3>Desarrollo Paso a Paso — Método de Simpson 1/3 Simple</h3>
            <div className="master-formula">
              <MathFormula
                block
                tex="I_{\text{simpson}} \approx \frac{h}{3}\Big[f(x_0) + 4f(x_1) + f(x_2)\Big]"
              />
            </div>

            <div className="numbered-work">
              <div className="work-step">
                <span className="work-num">Paso 1</span>
                <div>
                  <strong>Calcular el tamaño de paso y los 3 nodos equidistantes</strong>
                  <MathFormula
                    block
                    tex={`h = \\frac{${fmt(b)} - ${fmt(a)}}{2} = ${fmt(simpson.h)}`}
                  />
                  <MathFormula
                    block
                    tex={`x_0 = ${fmt(nodos.x0)}, \\quad x_1 = ${fmt(nodos.x1)}, \\quad x_2 = ${fmt(
                      nodos.x2
                    )}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">Paso 2</span>
                <div>
                  <strong>Evaluar la función en los 3 nodos</strong>
                  <MathFormula
                    block
                    tex={`f(${fmt(nodos.x0)}) = ${fmt(nodos.fx0)}, \\quad f(${fmt(
                      nodos.x1
                    )}) = ${fmt(nodos.fx1)}, \\quad f(${fmt(nodos.x2)}) = ${fmt(nodos.fx2)}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">Paso 3</span>
                <div>
                  <strong>Sustituir en la fórmula con ponderación (1 − 4 − 1)</strong>
                  <MathFormula
                    block
                    tex={`I_{\\text{simpson}} \\approx \\frac{${fmt(simpson.h)}}{3}\\Big[${fmt(
                      nodos.fx0
                    )} + 4(${fmt(nodos.fx1)}) + ${fmt(nodos.fx2)}\\Big] = \\frac{${fmt(
                      simpson.h
                    )}}{3}(${fmt(simpson.sumaPonderada)})`}
                  />
                </div>
              </div>

              <div className="work-step final-emerald">
                <span className="work-num">Resultado</span>
                <div>
                  <strong>Estimación obtenida por Simpson 1/3 Simple</strong>
                  <div className="final-figure text-emerald">
                    <MathFormula
                      tex={`I_{\\text{simpson}} = ${simpson.integral.toFixed(4)}${unidadTex}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="editorial-panel">
            <span className="panel-kicker">Cuantificación de Exactitud</span>
            <h3>Aplicación del Error — Simpson 1/3 Simple</h3>

            <div className="numbered-work">
              <div className="work-step">
                <span className="work-num">1. Error Verdadero</span>
                <div>
                  <strong>Diferencia absoluta frente al valor exacto</strong>
                  <MathFormula
                    block
                    tex={`|E_v| = \\left|${valorExacto.toFixed(4)} - ${simpson.integral.toFixed(
                      4
                    )}\\right| = ${simpson.errorAbsoluto.toFixed(4)}${unidadTex}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">2. Error Relativo</span>
                <div>
                  <strong>Error Relativo Porcentual</strong>
                  <MathFormula
                    block
                    tex={`\\varepsilon_t = \\frac{${simpson.errorAbsoluto.toFixed(
                      4
                    )}}{${valorExacto.toFixed(4)}} \\times 100\\% = \\mathbf{${simpson.errorRelativo.toFixed(
                      2
                    )}\\%}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">3. Truncamiento</span>
                <div>
                  <strong>Error de Truncamiento de Cuarto Orden</strong>
                  <MathFormula block tex="E_t = -\frac{(b - a)^{5}}{2880}\,f^{(4)}(\xi)" />
                  <MathFormula
                    block
                    tex={`E_t = -\\frac{(${fmt(b - a)})^{5}}{2880}(${fmt(
                      simpson.f4Media,
                      2
                    )}) = \\mathbf{${simpson.errorTruncamiento.toFixed(4)}}${unidadTex}`}
                  />
                </div>
              </div>

              <div className="work-step">
                <span className="work-num">4. Verificación</span>
                <div>
                  <strong>Identidad Exacta (Aproximación + Error = Valor Real)</strong>
                  <MathFormula
                    block
                    tex={`I_{\\text{simpson}} + E_t = ${simpson.integral.toFixed(
                      4
                    )} - ${Math.abs(simpson.errorTruncamiento).toFixed(4)} = \\mathbf{${(
                      simpson.integral + simpson.errorTruncamiento
                    ).toFixed(4)}}${unidadTex}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVISTA 2.4: TABLA COMPARATIVA Y PREGUNTAS DEL PROBLEMA */}
      {subvista === 'preguntas' && (
        <div className="editorial-stack">
          <div className="editorial-panel">
            <span className="panel-kicker">Síntesis Cuantitativa</span>
            <h3>Tabla Comparativa de Resultados y Errores</h3>

            <div className="table-responsive">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Método Evaluado</th>
                    <th>Polinomio</th>
                    <th>Fórmula Aplicada</th>
                    <th>
                      Integral <MathFormula tex="I" />
                    </th>
                    <th>
                      Error <MathFormula tex="|E_v|" />
                    </th>
                    <th>
                      Error <MathFormula tex="\varepsilon_t" />
                    </th>
                    <th>
                      Truncamiento <MathFormula tex="E_t" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Solución Exacta</strong>
                    </td>
                    <td>Grado 4</td>
                    <td>
                      <MathFormula tex="\int_a^b R(t)\,dt" />
                    </td>
                    <td>
                      <MathFormula tex={`\\mathbf{${valorExacto.toFixed(4)}}${unidadTex}`} />
                    </td>
                    <td>
                      <MathFormula tex={`0.0000${unidadTex}`} />
                    </td>
                    <td>
                      <MathFormula tex="0.00\%" />
                    </td>
                    <td>
                      <MathFormula tex={`0.0000${unidadTex}`} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Trapecio Simple</strong>
                    </td>
                    <td>
                      <MathFormula tex="P_1(x)" />
                    </td>
                    <td>
                      <MathFormula tex="(b-a)\frac{f(a)+f(b)}{2}" />
                    </td>
                    <td className="text-amber">
                      <MathFormula tex={`\\mathbf{${trapecio.integral.toFixed(4)}}${unidadTex}`} />
                    </td>
                    <td>
                      <MathFormula tex={`${trapecio.errorAbsoluto.toFixed(4)}${unidadTex}`} />
                    </td>
                    <td className="text-amber">
                      <MathFormula tex={`\\mathbf{${trapecio.errorRelativo.toFixed(2)}\\%}`} />
                    </td>
                    <td>
                      <MathFormula tex={`${trapecio.errorTruncamiento.toFixed(4)}${unidadTex}`} />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Simpson 1/3 Simple</strong>
                    </td>
                    <td>
                      <MathFormula tex="P_2(x)" />
                    </td>
                    <td>
                      <MathFormula tex="\frac{h}{3}[f(x_0)+4f(x_1)+f(x_2)]" />
                    </td>
                    <td className="text-emerald">
                      <MathFormula tex={`\\mathbf{${simpson.integral.toFixed(4)}}${unidadTex}`} />
                    </td>
                    <td>
                      <MathFormula tex={`${simpson.errorAbsoluto.toFixed(4)}${unidadTex}`} />
                    </td>
                    <td className="text-emerald">
                      <MathFormula tex={`\\mathbf{${simpson.errorRelativo.toFixed(2)}\\%}`} />
                    </td>
                    <td>
                      <MathFormula tex={`${simpson.errorTruncamiento.toFixed(4)}${unidadTex}`} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="editorial-panel">
            <span className="panel-kicker">Resolución del Caso de Estudio</span>
            <h3>Respuestas a las Preguntas según el Planteamiento del Problema</h3>

            <div className="qa-clean-list">
              {PROBLEMA_SERVIDOR.preguntas.map((item) => (
                <div key={item.id} className="qa-clean-row">
                  <div className="qa-clean-left">
                    <span className="qa-index">Pregunta 0{item.id}</span>
                    <h4>{item.pregunta}</h4>
                    <span className="qa-pill">{item.badge}</span>
                  </div>
                  <div className="qa-clean-right">
                    <p>{item.respuesta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
