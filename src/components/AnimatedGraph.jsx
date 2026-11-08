import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { fmt } from '../utils/mathEngine';
import MathFormula from './MathFormula';

export const ETAPAS_GEOMETRICAS = [
  {
    id: 1,
    codigo: '01',
    titulo: 'Función continua y área exacta',
    formulaTex: 'I = \\int_{a}^{b} f(x)\\,dx',
    explicacion:
      'Se traza la función real en el intervalo [a, b]. El área sombreada bajo la curva representa el volumen exacto acumulado.',
    color: '#3b82f6',
  },
  {
    id: 2,
    codigo: '02',
    titulo: 'Discretización en nodos equidistantes',
    formulaTex: 'x_0 = a,\\quad x_1 = \\frac{a+b}{2},\\quad x_2 = b',
    explicacion:
      'El Trapecio Simple evalúa únicamente los 2 extremos (x₀, x₂), mientras que Simpson 1/3 Simple incorpora el punto medio x₁.',
    color: '#8b5cf6',
  },
  {
    id: 3,
    codigo: '03',
    titulo: 'Regla del Trapecio Simple (Grado 1)',
    formulaTex: 'I_{\\text{trap}} \\approx (b - a)\\,\\frac{f(a) + f(b)}{2}',
    explicacion:
      'Interpola una recta secante entre (a, f(a)) y (b, f(b)). La región rayada en rojo evidencia el error por exceso ante la concavidad de la curva.',
    color: '#d97706',
  },
  {
    id: 4,
    codigo: '04',
    titulo: 'Regla de Simpson 1/3 Simple (Grado 2)',
    formulaTex: 'I_{\\text{simpson}} \\approx \\frac{h}{3}\\Big[f(x_0) + 4f(x_1) + f(x_2)\\Big]',
    explicacion:
      'Interpola un polinomio cuadrático de Lagrange (parábola) que pasa por los tres nodos, adaptándose a la curvatura real de la función.',
    color: '#10b981',
  },
  {
    id: 5,
    codigo: '05',
    titulo: 'Superposición y contraste de precisión',
    formulaTex: 'f(x) \\;\\text{vs.}\\; P_1(x) \\;\\text{vs.}\\; P_2(x)',
    explicacion:
      'Vista comparativa final. Desplace el cursor sobre el lienzo para inspeccionar los valores puntuales de cada aproximación.',
    color: '#e11d48',
  },
];

export default function AnimatedGraph({ datos, esCasoServidor, etapa, setEtapa }) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progresoTrazo, setProgresoTrazo] = useState(1);
  const [hoverX, setHoverX] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    setProgresoTrazo(0);
    let frameId;
    const inicio = performance.now();
    const duracion = 650;

    const animar = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgresoTrazo(eased);
      if (t < 1) {
        frameId = requestAnimationFrame(animar);
      }
    };
    frameId = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(frameId);
  }, [etapa, datos.expresion, datos.a, datos.b]);

  useEffect(() => {
    if (!reproduciendo) return;
    const timer = setInterval(() => {
      setEtapa((prev) => {
        if (prev >= 5) {
          setReproduciendo(false);
          return 5;
        }
        return prev + 1;
      });
    }, 3400);
    return () => clearInterval(timer);
  }, [reproduciendo, setEtapa]);

  const iniciarSecuencia = () => {
    setEtapa(1);
    setReproduciendo(true);
  };

  const width = 780;
  const height = 400;
  const pad = { top: 34, right: 38, bottom: 50, left: 62 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const minX = Math.min(datos.a, datos.b);
  const maxX = Math.max(datos.a, datos.b);
  const spanX = maxX - minX || 1;

  const N = 120;
  const puntosReal = [];
  const puntosTrap = [];
  const puntosSimp = [];

  let minY = 0;
  let maxY = -Infinity;

  for (let i = 0; i <= N; i++) {
    const x = minX + (spanX * i) / N;
    const yr = datos.fn(x);
    const yt = datos.evaluarRectaTrapecio(x);
    const ys = datos.evaluarParabolaSimpson(x);

    puntosReal.push({ x, y: yr });
    puntosTrap.push({ x, y: yt });
    puntosSimp.push({ x, y: ys });

    minY = Math.min(minY, yr, yt, ys);
    maxY = Math.max(maxY, yr, yt, ys);
  }

  const margenY = (maxY - minY || 10) * 0.15;
  const yMin = minY < 0 ? minY - margenY : 0;
  const yMax = maxY + margenY;
  const spanY = yMax - yMin || 1;

  const toSvgX = (x) => pad.left + ((x - minX) / spanX) * plotW;
  const toSvgY = (y) => pad.top + plotH - ((y - yMin) / spanY) * plotH;
  const baseZeroY = toSvgY(0);

  const maxIdx = Math.max(2, Math.floor(N * progresoTrazo));
  const subReal = puntosReal.slice(0, maxIdx + 1);
  const subTrap = puntosTrap.slice(0, maxIdx + 1);
  const subSimp = puntosSimp.slice(0, maxIdx + 1);

  const construirLinea = (pts) =>
    pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y).toFixed(2)}`)
      .join(' ');

  const construirArea = (pts) => {
    if (pts.length === 0) return '';
    const primero = pts[0];
    const ultimo = pts[pts.length - 1];
    return `${construirLinea(pts)} L ${toSvgX(ultimo.x).toFixed(2)} ${baseZeroY.toFixed(2)} L ${toSvgX(primero.x).toFixed(2)} ${baseZeroY.toFixed(2)} Z`;
  };

  const construirPoligonoError = (ptsA, ptsB) => {
    if (ptsA.length === 0) return '';
    const ida = ptsA
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y).toFixed(2)}`)
      .join(' ');
    const vuelta = [...ptsB]
      .reverse()
      .map((p) => `L ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y).toFixed(2)}`)
      .join(' ');
    return `${ida} ${vuelta} Z`;
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    if (relX < pad.left || relX > width - pad.right) {
      setHoverX(null);
      return;
    }
    const valorX = minX + ((relX - pad.left) / plotW) * spanX;
    setHoverX(Math.max(minX, Math.min(maxX, valorX)));
  };

  const { x0, x1, x2, fx0, fx1, fx2 } = datos.nodos;
  const marcasY = 5;
  const lineasY = Array.from({ length: marcasY + 1 }, (_, i) => yMin + (spanY * i) / marcasY);
  const marcasX = 4;
  const lineasX = Array.from({ length: marcasX + 1 }, (_, i) => minX + (spanX * i) / marcasX);

  return (
    <div className="plot-wrapper">
      <div className="plot-toolbar">
        <div className="plot-legend-inline">
          <span className="legend-item">
            <span className="swatch swatch-blue" />
            <MathFormula tex={`I_{\\text{exacta}} = ${datos.valorExacto.toFixed(4)}`} />
          </span>
          <span className="legend-item">
            <span className="swatch swatch-amber" />
            <MathFormula tex={`I_{\\text{trap}} = ${datos.trapecio.integral.toFixed(4)}`} />
          </span>
          <span className="legend-item">
            <span className="swatch swatch-emerald" />
            <MathFormula tex={`I_{\\text{simpson}} = ${datos.simpson.integral.toFixed(4)}`} />
          </span>
        </div>

        <div className="transport-Buttons">
          <button
            type="button"
            className="btn-quiet"
            onClick={() => {
              setReproduciendo(false);
              setEtapa((p) => (p > 1 ? p - 1 : 5));
            }}
            title="Etapa anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            className={`btn-primary-sm ${reproduciendo ? 'is-playing' : ''}`}
            onClick={() => (reproduciendo ? setReproduciendo(false) : iniciarSecuencia())}
          >
            {reproduciendo ? <Pause size={14} /> : <Play size={14} />}
            <span>{reproduciendo ? 'Pausar secuencia' : 'Reproducir secuencia'}</span>
          </button>

          <button
            type="button"
            className="btn-quiet"
            onClick={() => {
              setReproduciendo(false);
              setEtapa((p) => (p < 5 ? p + 1 : 1));
            }}
            title="Siguiente etapa"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="btn-quiet"
            onClick={() => {
              setReproduciendo(false);
              setProgresoTrazo(0);
              setTimeout(() => setProgresoTrazo(1), 25);
            }}
            title="Repetir trazo"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="svg-frame">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="engineering-svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverX(null)}
        >
          <defs>
            <linearGradient id="fillReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="fillTrap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="fillSimp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
            <pattern
              id="hatchError"
              width="8"
              height="8"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeOpacity="0.38"
              />
            </pattern>
          </defs>

          {lineasY.map((valY, idx) => {
            const py = toSvgY(valY);
            return (
              <g key={`gy-${idx}`}>
                <line
                  x1={pad.left}
                  y1={py}
                  x2={width - pad.right}
                  y2={py}
                  stroke="#1f2430"
                  strokeWidth="1"
                />
                <text
                  x={pad.left - 10}
                  y={py + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {valY.toFixed(1)}
                </text>
              </g>
            );
          })}

          {lineasX.map((valX, idx) => {
            const px = toSvgX(valX);
            return (
              <g key={`gx-${idx}`}>
                <line
                  x1={px}
                  y1={pad.top}
                  x2={px}
                  y2={height - pad.bottom}
                  stroke="#1f2430"
                  strokeWidth="1"
                />
                <text
                  x={px}
                  y={height - pad.bottom + 20}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {fmt(valX, 2)}
                </text>
              </g>
            );
          })}

          <line
            x1={pad.left}
            y1={baseZeroY}
            x2={width - pad.right}
            y2={baseZeroY}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line
            x1={pad.left}
            y1={pad.top}
            x2={pad.left}
            y2={height - pad.bottom}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {(etapa === 1 || etapa === 5) && <path d={construirArea(subReal)} fill="url(#fillReal)" />}

          {etapa === 3 && (
            <>
              <path d={construirArea(subTrap)} fill="url(#fillTrap)" />
              <path d={construirPoligonoError(subTrap, subReal)} fill="url(#hatchError)" />
            </>
          )}

          {etapa === 4 && (
            <>
              <path d={construirArea(subSimp)} fill="url(#fillSimp)" />
              <path
                d={construirPoligonoError(subSimp, subReal)}
                fill="rgba(16, 185, 129, 0.18)"
              />
            </>
          )}

          <path
            d={construirLinea(subReal)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.75"
            strokeLinecap="round"
          />

          {(etapa === 3 || etapa === 5) && (
            <path
              d={construirLinea(subTrap)}
              fill="none"
              stroke="#d97706"
              strokeWidth="2.25"
              strokeDasharray="7 5"
            />
          )}

          {(etapa === 4 || etapa === 5) && (
            <path d={construirLinea(subSimp)} fill="none" stroke="#10b981" strokeWidth="2.5" />
          )}

          {etapa >= 2 &&
            [
              { x: x0, y: fx0, color: '#3b82f6', mostrar: true },
              { x: x1, y: fx1, color: '#10b981', mostrar: etapa !== 3 },
              { x: x2, y: fx2, color: '#3b82f6', mostrar: true },
            ]
              .filter((n) => n.mostrar)
              .map((nodo, i) => {
                const cx = toSvgX(nodo.x);
                const cy = toSvgY(nodo.y);
                return (
                  <g key={`n-${i}`}>
                    <line
                      x1={cx}
                      y1={baseZeroY}
                      x2={cx}
                      y2={cy}
                      stroke={nodo.color}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="5.5"
                      fill="#0b0d11"
                      stroke={nodo.color}
                      strokeWidth="2.5"
                    />
                    <rect
                      x={cx - 42}
                      y={cy - 30}
                      width="84"
                      height="20"
                      rx="4"
                      fill="#12151c"
                      stroke="#2a303c"
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 16}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10.5"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      ({fmt(nodo.x, 2)}, {fmt(nodo.y, 2)})
                    </text>
                  </g>
                );
              })}

          {hoverX !== null && (
            <g>
              <line
                x1={toSvgX(hoverX)}
                y1={pad.top}
                x2={toSvgX(hoverX)}
                y2={height - pad.bottom}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle cx={toSvgX(hoverX)} cy={toSvgY(datos.fn(hoverX))} r="4.5" fill="#3b82f6" />
              {(etapa === 3 || etapa === 5) && (
                <circle
                  cx={toSvgX(hoverX)}
                  cy={toSvgY(datos.evaluarRectaTrapecio(hoverX))}
                  r="4.5"
                  fill="#d97706"
                />
              )}
              {(etapa === 4 || etapa === 5) && (
                <circle
                  cx={toSvgX(hoverX)}
                  cy={toSvgY(datos.evaluarParabolaSimpson(hoverX))}
                  r="4.5"
                  fill="#10b981"
                />
              )}
            </g>
          )}

          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11.5"
          >
            {esCasoServidor ? 'Tiempo t (horas)' : 'Variable independiente x'}
          </text>
          <text
            x={16}
            y={height / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11.5"
            transform={`rotate(-90 16 ${height / 2})`}
          >
            {esCasoServidor ? 'Tasa R(t) [GB/h]' : 'f(x)'}
          </text>
        </svg>
      </div>

      <div className="plot-footer-bar">
        <MathFormula
          tex={`\\text{Intervalo: } [${datos.a}, ${datos.b}] \\quad\\cdot\\quad x_0=${fmt(
            x0
          )},\\; x_1=${fmt(x1)},\\; x_2=${fmt(x2)}`}
        />
        {hoverX !== null ? (
          <div className="readout-group">
            <MathFormula
              tex={`x = ${hoverX.toFixed(2)} \\;\\big|\\; f(x) = ${datos
                .fn(hoverX)
                .toFixed(2)} \\;\\big|\\; P_1(x) = ${datos
                .evaluarRectaTrapecio(hoverX)
                .toFixed(2)} \\;\\big|\\; P_2(x) = ${datos
                .evaluarParabolaSimpson(hoverX)
                .toFixed(2)}`}
            />
          </div>
        ) : (
          <span className="muted-hint">
            Desplace el cursor sobre la gráfica para inspeccionar valores
          </span>
        )}
      </div>
    </div>
  );
}
