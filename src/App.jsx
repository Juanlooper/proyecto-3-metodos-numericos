import React, { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { PROBLEMA_SERVIDOR, analizarIntegracionCompleta } from './utils/mathEngine';
import MathFormula, { exprToLatex } from './components/MathFormula';
import SectionJuan from './components/SectionJuan';
import SectionNicole from './components/SectionNicole';
import SectionMiguel from './components/SectionMiguel';

const SECCIONES_EXPOSICION = [
  {
    id: 'juan',
    numero: '01',
    integrante: 'Juan Rodríguez',
    rol: 'Fundamento y Geometría',
  },
  {
    id: 'nicole',
    numero: '02',
    integrante: 'Nicole Cáceres',
    rol: 'Demostración y Errores',
  },
  {
    id: 'miguel',
    numero: '03',
    integrante: 'Miguel Oliver',
    rol: 'Código JS y Validación',
  },
];

export default function App() {
  const [seccionActiva, setSeccionActiva] = useState('juan');
  const [expresionInput, setExpresionInput] = useState(PROBLEMA_SERVIDOR.expresion);
  const [limiteA, setLimiteA] = useState(PROBLEMA_SERVIDOR.a);
  const [limiteB, setLimiteB] = useState(PROBLEMA_SERVIDOR.b);

  const esCasoServidor =
    expresionInput.replace(/\s+/g, '') === PROBLEMA_SERVIDOR.expresion.replace(/\s+/g, '') &&
    Number(limiteA) === 0 &&
    Number(limiteB) === 4;

  const resultado = useMemo(
    () => analizarIntegracionCompleta(expresionInput, limiteA, limiteB),
    [expresionInput, limiteA, limiteB]
  );

  const resultadoSeguroParaVista = useMemo(() => {
    if (resultado.ok) return resultado;
    return analizarIntegracionCompleta(
      PROBLEMA_SERVIDOR.expresion,
      PROBLEMA_SERVIDOR.a,
      PROBLEMA_SERVIDOR.b
    );
  }, [resultado]);

  const cargarProblemaServidor = () => {
    setExpresionInput(PROBLEMA_SERVIDOR.expresion);
    setLimiteA(PROBLEMA_SERVIDOR.a);
    setLimiteB(PROBLEMA_SERVIDOR.b);
  };

  const latexModeloActivo = esCasoServidor
    ? 'R(t) = 0.5t^{4} - 2t^{3} + 4t^{2} + 12 \\quad t \\in [0, 4]'
    : `f(x) = ${exprToLatex(expresionInput, 'x')} \\quad x \\in [${limiteA}, ${limiteB}]`;

  return (
    <div className="studio-app">
      <header className="studio-header">
        <div className="studio-header-top">
          <div className="studio-title-group">
            <span className="studio-kicker">
              INGENIERÍA EN SISTEMAS · MÉTODOS NUMÉRICOS · PROYECTO 3
            </span>
            <h1>Integración Numérica: Regla del Trapecio Simple y Simpson 1/3 Simple</h1>
          </div>

          <div className="studio-status-bar">
            <div className="active-model-pill">
              <span className="model-label">Modelo activo:</span>
              <MathFormula tex={latexModeloActivo} />
            </div>

            {!esCasoServidor && (
              <button
                type="button"
                className="btn-reset-top"
                onClick={cargarProblemaServidor}
                title="Restaurar datos del problema planteado"
              >
                <RotateCcw size={13} />
                <span>Setear Problema Planteado</span>
              </button>
            )}
          </div>
        </div>

        <nav className="speaker-nav" aria-label="Secciones de exposición">
          {SECCIONES_EXPOSICION.map((sec) => {
            const activo = seccionActiva === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`speaker-tab ${activo ? 'is-active' : ''}`}
                onClick={() => setSeccionActiva(sec.id)}
              >
                <span className="speaker-num">{sec.numero}</span>
                <div className="speaker-meta">
                  <strong>{sec.integrante}</strong>
                  <span>{sec.rol}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="studio-main">
        {seccionActiva === 'juan' && (
          <SectionJuan datos={resultadoSeguroParaVista} esCasoServidor={esCasoServidor} />
        )}

        {seccionActiva === 'nicole' && (
          <SectionNicole
            datos={resultadoSeguroParaVista}
            esCasoServidor={esCasoServidor}
            onCargarServidor={cargarProblemaServidor}
          />
        )}

        {seccionActiva === 'miguel' && (
          <SectionMiguel
            expresionInput={expresionInput}
            setExpresionInput={setExpresionInput}
            limiteA={limiteA}
            setLimiteA={setLimiteA}
            limiteB={limiteB}
            setLimiteB={setLimiteB}
            resultado={resultado}
            esCasoServidor={esCasoServidor}
            onCargarServidor={cargarProblemaServidor}
          />
        )}
      </main>
    </div>
  );
}
