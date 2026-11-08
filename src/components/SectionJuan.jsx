import React, { useState } from 'react';
import AnimatedGraph, { ETAPAS_GEOMETRICAS } from './AnimatedGraph';
import MathFormula from './MathFormula';

export default function SectionJuan({ datos, esCasoServidor }) {
  const [etapa, setEtapa] = useState(5);
  const unidad = esCasoServidor ? '\\text{ GB}' : '\\text{ u}^2';
  const etapaActivaObj =
    ETAPAS_GEOMETRICAS.find((item) => item.id === etapa) || ETAPAS_GEOMETRICAS[0];

  return (
    <div className="section-view">
      <div className="section-intro">
        <div className="section-meta-row">
          <span className="speaker-tag">SECCIÓN 01 · EXPOSITOR: JUAN RODRÍGUEZ</span>
          <span className="section-topic">Fundamento Teórico y Análisis Geométrico</span>
        </div>
        <h2>Fórmulas Cerradas de Newton-Cotes: Interpolación Lineal vs. Parabólica</h2>
        <p>
          La integración numérica reemplaza una función continua por un polinomio interpolador de
          Lagrange <MathFormula tex="P_n(x)" /> sobre nodos equidistantes. A continuación se
          contrasta geométricamente el{' '}
          <strong>
            Método del Trapecio Simple <MathFormula tex="(n = 1)" />
          </strong>{' '}
          frente al{' '}
          <strong>
            Método de Simpson 1/3 Simple <MathFormula tex="(n = 2)" />
          </strong>
          .
        </p>
      </div>

      {/* Tarjetas de las dos fórmulas maestras apiladas limpiamente sin desbordar */}
      <div className="clean-two-col">
        <div className="formula-showcase-card showcase-amber">
          <div className="showcase-header">
            <span className="showcase-badge">NEWTON-COTES GRADO 1 (2 NODOS)</span>
            <strong>Método del Trapecio Simple</strong>
          </div>
          <div className="showcase-math-stack">
            <div className="showcase-math-item">
              <span className="math-mini-label">Fórmula de Integración:</span>
              <MathFormula
                block
                tex="I_{\text{trapecio}} \approx (b - a)\,\frac{f(a) + f(b)}{2}"
              />
            </div>
            <div className="showcase-math-item">
              <span className="math-mini-label">Error de Truncamiento:</span>
              <MathFormula block tex="E_t = -\frac{(b - a)^3}{12}\,f''(\xi)" />
            </div>
          </div>
        </div>

        <div className="formula-showcase-card showcase-emerald">
          <div className="showcase-header">
            <span className="showcase-badge">NEWTON-COTES GRADO 2 (3 NODOS)</span>
            <strong>Método de Simpson 1/3 Simple</strong>
          </div>
          <div className="showcase-math-stack">
            <div className="showcase-math-item">
              <span className="math-mini-label">
                Fórmula de Integración (<MathFormula tex="h = \frac{b-a}{2}" />
                ):
              </span>
              <MathFormula
                block
                tex="I_{\text{simpson}} \approx \frac{h}{3}\Big[f(x_0) + 4f(x_1) + f(x_2)\Big]"
              />
            </div>
            <div className="showcase-math-item">
              <span className="math-mini-label">Error de Truncamiento:</span>
              <MathFormula block tex="E_t = -\frac{(b - a)^5}{2880}\,f^{(4)}(\xi)" />
            </div>
          </div>
        </div>
      </div>

      <div className="juan-workspace-grid">
        <aside className="steps-rail">
          <div className="rail-header">
            <span>Secuencia de Construcción Geométrica</span>
            <small>5 etapas</small>
          </div>

          <div className="rail-list">
            {ETAPAS_GEOMETRICAS.map((item) => {
              const activo = etapa === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`rail-step-card ${activo ? 'is-active' : ''}`}
                  onClick={() => setEtapa(item.id)}
                >
                  <div className="rail-step-top">
                    <span className="rail-num">{item.codigo}</span>
                    <strong className="rail-title">{item.titulo}</strong>
                  </div>
                  <div className="rail-formula">
                    <MathFormula tex={item.formulaTex} />
                  </div>
                  {activo && <p className="rail-desc">{item.explicacion}</p>}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="juan-canvas-column">
          <div className="active-stage-banner">
            <div className="stage-banner-left">
              <span className="stage-num-badge">PASO {etapaActivaObj.codigo}</span>
              <div>
                <h4>{etapaActivaObj.titulo}</h4>
                <p>{etapaActivaObj.explicacion}</p>
              </div>
            </div>
            <div className="stage-banner-math">
              <MathFormula block tex={etapaActivaObj.formulaTex} />
            </div>
          </div>

          <AnimatedGraph
            datos={datos}
            esCasoServidor={esCasoServidor}
            etapa={etapa}
            setEtapa={setEtapa}
          />

          <div className="summary-strip-3">
            <div className="summary-cell">
              <span className="cell-label">Integral Analítica Exacta</span>
              <div className="cell-value">
                <MathFormula tex={`I = ${datos.valorExacto.toFixed(4)}${unidad}`} />
              </div>
              <p className="cell-note">
                Área exacta bajo la curva en <MathFormula tex={`[${datos.a}, ${datos.b}]`} />
              </p>
            </div>

            <div className="summary-cell">
              <span className="cell-label">Trapecio Simple (Grado 1)</span>
              <div className="cell-value text-amber">
                <MathFormula
                  tex={`I_{\\text{trap}} = ${datos.trapecio.integral.toFixed(4)}${unidad}`}
                />
              </div>
              <p className="cell-note">
                Usa 2 nodos ·{' '}
                <MathFormula tex={`\\varepsilon_t = ${datos.trapecio.errorRelativo.toFixed(2)}\\%`} />
              </p>
            </div>

            <div className="summary-cell">
              <span className="cell-label">Simpson 1/3 Simple (Grado 2)</span>
              <div className="cell-value text-emerald">
                <MathFormula
                  tex={`I_{\\text{simpson}} = ${datos.simpson.integral.toFixed(4)}${unidad}`}
                />
              </div>
              <p className="cell-note">
                Usa 3 nodos ·{' '}
                <MathFormula tex={`\\varepsilon_t = ${datos.simpson.errorRelativo.toFixed(2)}\\%`} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
