import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, RotateCcw, Trash2, CornerDownLeft } from 'lucide-react';
import {
  PROBLEMA_SERVIDOR,
  compilarFuncionSegura,
  analizarIntegracionCompleta,
  fmt,
} from '../utils/mathEngine';

const BANNER_INICIAL = [
  {
    tipo: 'header',
    texto:
      '══════════════════════════════════════════════════════════════════════════════\n' +
      '  PROYECTO 3 - MÉTODOS NUMÉRICOS (INGENIERÍA EN SISTEMAS)\n' +
      '  Integración Numérica: Método del Trapecio Simple y Simpson 1/3 Simple\n' +
      '  Integrantes: Nicole Caceres | Juan Rodriguez | Miguel Oliver\n' +
      '══════════════════════════════════════════════════════════════════════════════',
  },
];

const TEXTO_MENU =
  '\nSeleccione una opción del menú:\n' +
  '  [1] Cargar Problema Planteado (Ingeniería en Sistemas: Tráfico en Servidor)\n' +
  '  [2] Introducir datos personalizados (cualquier función f(x) y límites [a, b])\n' +
  '  [3] Ejecutar demostración automática del Control de Errores\n' +
  '  [4] Limpiar pantalla';

export default function InteractiveTerminal({ onSincronizarDatos }) {
  const [historial, setHistorial] = useState([
    ...BANNER_INICIAL,
    { tipo: 'menu', texto: TEXTO_MENU },
  ]);
  const [fase, setFase] = useState('MENU'); // 'MENU' | 'PEDIR_FN' | 'PEDIR_A' | 'PEDIR_B' | 'PAUSA'
  const [entradaActual, setEntradaActual] = useState('');
  const [tempFn, setTempFn] = useState('');
  const [tempA, setTempA] = useState('');

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al fondo cada vez que se agrega salida en la terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historial, fase]);

  const enfocarInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const agregarLineas = (...nuevas) => {
    setHistorial((prev) => [...prev, ...nuevas]);
  };

  const formatearSalidaCompleta = (res, titulo, esServidor) => {
    const unidad = esServidor ? 'GB' : 'u²';
    const bloques = [];

    if (res.invertido) {
      bloques.push({
        tipo: 'warn',
        texto: `\n⚠ Advertencia: El límite inferior a (${res.a}) es mayor que b (${res.b}). Por propiedad de integrales definidas, el signo se invierte.`,
      });
    }

    bloques.push({
      tipo: 'info',
      texto:
        `\n▶ CASO ANALIZADO: ${titulo}\n` +
        `  • Función a integrar : f(x) = ${res.expresion}\n` +
        `  • Intervalo [a, b]   : [${res.a}, ${res.b}]\n` +
        `  • Valor Exacto (I)   : ${res.valorExacto.toFixed(4)} ${unidad}`,
    });

    bloques.push({
      tipo: 'amber',
      texto:
        `\n──────────────────────────────────────────────────────────────────────────────\n` +
        `1. DEMOSTRACIÓN PASO A PASO — MÉTODO DEL TRAPECIO SIMPLE\n` +
        `   Fórmula: I ≈ (b - a) * [f(a) + f(b)] / 2\n` +
        `──────────────────────────────────────────────────────────────────────────────\n` +
        `   Paso 1 (Ancho del intervalo): b - a = ${res.b} - (${res.a}) = ${fmt(res.trapecio.h)}\n` +
        `   Paso 2 (Evaluar en extremos): f(${fmt(res.nodos.x0)}) = ${fmt(res.nodos.fx0)}  |  f(${fmt(res.nodos.x2)}) = ${fmt(res.nodos.fx2)}\n` +
        `   Paso 3 (Sustituir fórmula)  : I ≈ (${fmt(res.trapecio.h)}) * [${fmt(res.nodos.fx0)} + ${fmt(res.nodos.fx2)}] / 2\n` +
        `   Paso 4 (Resultado Trapecio) : I ≈ ${fmt(res.trapecio.h)} * (${fmt(res.trapecio.sumaExtremos)} / 2) = ${res.trapecio.integral.toFixed(4)} ${unidad}\n\n` +
        `   • Error Verdadero Absoluto |Ev|  : |${res.valorExacto.toFixed(4)} - ${res.trapecio.integral.toFixed(4)}| = ${res.trapecio.errorAbsoluto.toFixed(4)} ${unidad}\n` +
        `   • Error Relativo Porcentual (εt) : ${res.trapecio.errorRelativo.toFixed(2)}%\n` +
        `   • Error de Truncamiento (Et)     : -((b-a)³/12)*f''(ξ) = ${res.trapecio.errorTruncamiento.toFixed(4)} ${unidad}`,
    });

    bloques.push({
      tipo: 'emerald',
      texto:
        `\n──────────────────────────────────────────────────────────────────────────────\n` +
        `2. DEMOSTRACIÓN PASO A PASO — MÉTODO DE SIMPSON 1/3 SIMPLE\n` +
        `   Fórmula: I ≈ (h / 3) * [f(x0) + 4*f(x1) + f(x2)]   donde h = (b - a) / 2\n` +
        `──────────────────────────────────────────────────────────────────────────────\n` +
        `   Paso 1 (Tamaño de paso h)   : h = (${res.b} - (${res.a})) / 2 = ${fmt(res.simpson.h)}\n` +
        `   Paso 2 (Nodos x0, x1, x2)   : x0 = ${fmt(res.nodos.x0)},  x1 = ${fmt(res.nodos.x1)},  x2 = ${fmt(res.nodos.x2)}\n` +
        `   Paso 3 (Evaluar función)    : f(x0) = ${fmt(res.nodos.fx0)}  |  f(x1) = ${fmt(res.nodos.fx1)}  |  f(x2) = ${fmt(res.nodos.fx2)}\n` +
        `   Paso 4 (Suma ponderada 141) : S = ${fmt(res.nodos.fx0)} + 4*(${fmt(res.nodos.fx1)}) + ${fmt(res.nodos.fx2)} = ${fmt(res.simpson.sumaPonderada)}\n` +
        `   Paso 5 (Resultado Simpson)  : I ≈ (${fmt(res.simpson.h)} / 3) * ${fmt(res.simpson.sumaPonderada)} = ${res.simpson.integral.toFixed(4)} ${unidad}\n\n` +
        `   • Error Verdadero Absoluto |Ev|  : |${res.valorExacto.toFixed(4)} - ${res.simpson.integral.toFixed(4)}| = ${res.simpson.errorAbsoluto.toFixed(4)} ${unidad}\n` +
        `   • Error Relativo Porcentual (εt) : ${res.simpson.errorRelativo.toFixed(2)}%\n` +
        `   • Error de Truncamiento (Et)     : -((b-a)⁵/2880)*f⁽⁴⁾(ξ) = ${res.simpson.errorTruncamiento.toFixed(4)} ${unidad}\n` +
        `   • Verificación Exacta (I + Et)   : ${res.simpson.integral.toFixed(4)} + (${res.simpson.errorTruncamiento.toFixed(4)}) = ${(res.simpson.integral + res.simpson.errorTruncamiento).toFixed(4)} ${unidad}`,
    });

    if (esServidor) {
      bloques.push({
        tipo: 'info',
        texto:
          `\n──────────────────────────────────────────────────────────────────────────────\n` +
          `3. RESPUESTAS A LAS PREGUNTAS DEL PLANTEAMIENTO DEL PROBLEMA\n` +
          `──────────────────────────────────────────────────────────────────────────────\n` +
          PROBLEMA_SERVIDOR.preguntas
            .map((p) => `  • ${p.pregunta}\n    R/: ${p.respuesta}`)
            .join('\n\n'),
      });
    }

    return bloques;
  };

  const generarBateriaErrores = () => {
    const casos = [
      { nombre: 'Caso 1: Expresión vacía', expr: '   ', a: '0', b: '4' },
      { nombre: 'Caso 2: Paréntesis desbalanceados', expr: '0.5*(x^4 - 2*x^3 + 12', a: '0', b: '4' },
      { nombre: 'Caso 3: Operadores consecutivos inválidos', expr: 'x^2 + * 4*x', a: '0', b: '4' },
      { nombre: 'Caso 4: Función desconocida / código externo', expr: 'alert(x) + 5', a: '0', b: '4' },
      { nombre: 'Caso 5: Límites iguales (a = b = 3)', expr: 'x^2 + 4', a: '3', b: '3' },
      { nombre: 'Caso 6: Límite no numérico', expr: 'x^2 + 4', a: 'abc', b: '4' },
      { nombre: 'Caso 7: División por cero en [0, 4]', expr: '10 / (x - 2)', a: '0', b: '4' },
      { nombre: 'Caso 8: Raíz cuadrada negativa en [0, 4]', expr: 'sqrt(x - 5)', a: '0', b: '4' },
      { nombre: 'Caso 9: Logaritmo natural fuera de dominio (x <= 0)', expr: 'ln(x)', a: '0', b: '4' },
    ];

    const lineas = casos.map((c) => {
      const r = analizarIntegracionCompleta(c.expr, c.a, c.b);
      return (
        `▶ Probando ${c.nombre}:\n` +
        `  Entrada: f(x) = "${c.expr}"  |  a = "${c.a}"  |  b = "${c.b}"\n` +
        `  ✔ Capturado [${r.tipoError}]: ${r.error}`
      );
    });

    return {
      tipo: 'emerald',
      texto:
        `\n══════════════════════════════════════════════════════════════════════════════\n` +
        `  BATERÍA DE PRUEBAS DE CONTROL DE ERRORES Y VALIDACIONES\n` +
        `══════════════════════════════════════════════════════════════════════════════\n\n` +
        lineas.join('\n\n') +
        `\n\n✔ Todas las validaciones respondieron correctamente sin bloquear el programa.`,
    };
  };

  const procesarEntrada = (valorRaw) => {
    const val = valorRaw.trim();

    if (fase === 'PAUSA') {
      agregarLineas({ tipo: 'menu', texto: TEXTO_MENU });
      setFase('MENU');
      setEntradaActual('');
      return;
    }

    if (fase === 'MENU') {
      agregarLineas({ tipo: 'cmd', texto: `➤ Ingrese su opción (1-4): ${val}` });

      if (val === '1') {
        const res = analizarIntegracionCompleta(
          PROBLEMA_SERVIDOR.expresion,
          PROBLEMA_SERVIDOR.a,
          PROBLEMA_SERVIDOR.b
        );
        if (onSincronizarDatos) {
          onSincronizarDatos(PROBLEMA_SERVIDOR.expresion, PROBLEMA_SERVIDOR.a, PROBLEMA_SERVIDOR.b);
        }
        agregarLineas(...formatearSalidaCompleta(res, PROBLEMA_SERVIDOR.titulo, true));
        setFase('PAUSA');
      } else if (val === '2') {
        agregarLineas({
          tipo: 'info',
          texto:
            '\n─── MODO PERSONALIZADO: INTRODUCCIÓN DE DATOS ───\n' +
            'Ejemplos válidos: 0.5*x^4 - 2*x^3 + 4*x^2 + 12  |  sin(x) + x^2  |  exp(x)  |  sqrt(x + 1)',
        });
        setFase('PEDIR_FN');
      } else if (val === '3') {
        agregarLineas(generarBateriaErrores());
        setFase('PAUSA');
      } else if (val === '4' || val.toLowerCase() === 'clear') {
        setHistorial([...BANNER_INICIAL, { tipo: 'menu', texto: TEXTO_MENU }]);
        setFase('MENU');
      } else {
        agregarLineas({
          tipo: 'error',
          texto: `✖ Opción inválida "${val}". Por favor ingrese un número entre 1 y 4.`,
        });
        setFase('PAUSA');
      }
      setEntradaActual('');
      return;
    }

    if (fase === 'PEDIR_FN') {
      agregarLineas({ tipo: 'cmd', texto: `1. Ingrese la función f(x): ${valorRaw}` });
      const comp = compilarFuncionSegura(valorRaw);
      if (!comp.ok) {
        agregarLineas({
          tipo: 'error',
          texto: `\n✖ [ERROR DE SINTAXIS · ${comp.tipoError}]\n  ${comp.error}`,
        });
        setFase('PAUSA');
      } else {
        setTempFn(valorRaw);
        setFase('PEDIR_A');
      }
      setEntradaActual('');
      return;
    }

    if (fase === 'PEDIR_A') {
      agregarLineas({ tipo: 'cmd', texto: `2. Ingrese el límite inferior (a): ${valorRaw}` });
      const numA = Number(String(valorRaw).trim().replace(',', '.'));
      if (String(valorRaw).trim() === '' || Number.isNaN(numA) || !Number.isFinite(numA)) {
        agregarLineas({
          tipo: 'error',
          texto: `\n✖ [ERROR DE LÍMITE INFERIOR]\n  El valor "${valorRaw}" no es un número real finito válido.`,
        });
        setFase('PAUSA');
      } else {
        setTempA(valorRaw.trim());
        setFase('PEDIR_B');
      }
      setEntradaActual('');
      return;
    }

    if (fase === 'PEDIR_B') {
      agregarLineas({ tipo: 'cmd', texto: `3. Ingrese el límite superior (b): ${valorRaw}` });
      const res = analizarIntegracionCompleta(tempFn, tempA, valorRaw.trim());
      if (!res.ok) {
        agregarLineas({
          tipo: 'error',
          texto: `\n✖ [ERROR DE DOMINIO / LÍMITES · ${res.tipoError}]\n  ${res.error}`,
        });
        setFase('PAUSA');
      } else {
        if (onSincronizarDatos) {
          onSincronizarDatos(tempFn, tempA, valorRaw.trim());
        }
        agregarLineas(
          ...formatearSalidaCompleta(res, 'Problema Personalizado Ingresado en Terminal', false)
        );
        setFase('PAUSA');
      }
      setEntradaActual('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    procesarEntrada(entradaActual);
  };

  const obtenerPromptLabel = () => {
    switch (fase) {
      case 'MENU':
        return '➤ Ingrese su opción (1-4):';
      case 'PEDIR_FN':
        return '1. Ingrese la función f(x):';
      case 'PEDIR_A':
        return '2. Ingrese el límite inferior (a):';
      case 'PEDIR_B':
        return '3. Ingrese el límite superior (b):';
      case 'PAUSA':
        return 'Presione ENTER para volver al menú principal...';
      default:
        return '➤';
    }
  };

  const reiniciarConsola = () => {
    setHistorial([...BANNER_INICIAL, { tipo: 'menu', texto: TEXTO_MENU }]);
    setFase('MENU');
    setEntradaActual('');
    enfocarInput();
  };

  return (
    <div className="live-terminal-card" onClick={enfocarInput}>
      {/* Barra superior de la ventana de terminal */}
      <div className="live-terminal-bar">
        <div className="live-terminal-left">
          <TerminalIcon size={15} />
          <span>Terminal Interactiva en Vivo — node cli/integracion_terminal.js</span>
        </div>

        <div className="live-terminal-actions" onClick={(e) => e.stopPropagation()}>
          {fase === 'MENU' && (
            <>
              <button
                type="button"
                className="term-quick-btn"
                onClick={() => procesarEntrada('1')}
                title="Ejecutar opción 1"
              >
                [1] Caso Servidor
              </button>
              <button
                type="button"
                className="term-quick-btn"
                onClick={() => procesarEntrada('2')}
                title="Ejecutar opción 2"
              >
                [2] Ingresar Datos
              </button>
              <button
                type="button"
                className="term-quick-btn"
                onClick={() => procesarEntrada('3')}
                title="Ejecutar opción 3"
              >
                [3] Test Errores
              </button>
            </>
          )}
          {fase === 'PAUSA' && (
            <button
              type="button"
              className="term-quick-btn term-btn-highlight"
              onClick={() => procesarEntrada('')}
            >
              Volver al Menú ↵
            </button>
          )}
          <button
            type="button"
            className="term-quick-btn"
            onClick={reiniciarConsola}
            title="Limpiar y reiniciar terminal"
          >
            <RotateCcw size={12} /> Reiniciar
          </button>
        </div>
      </div>

      {/* Área de historial desplazable */}
      <div className="live-terminal-Viewport" ref={scrollRef}>
        {historial.map((bloque, idx) => (
          <pre key={idx} className={`term-line term-${bloque.tipo}`}>
            {bloque.texto}
          </pre>
        ))}

        {/* Línea de comando activa donde el usuario escribe en vivo */}
        <form onSubmit={handleSubmit} className="term-prompt-form">
          <span className="term-prompt-label">{obtenerPromptLabel()}</span>
          <input
            ref={inputRef}
            type="text"
            value={entradaActual}
            onChange={(e) => setEntradaActual(e.target.value)}
            className="term-live-input"
            placeholder={
              fase === 'MENU'
                ? 'Escriba 1, 2, 3 o 4 y presione Enter...'
                : fase === 'PEDIR_FN'
                  ? 'Ej: 0.5*x^4 - 2*x^3 + 4*x^2 + 12 (y presione Enter)'
                  : fase === 'PAUSA'
                    ? 'Presione Enter...'
                    : 'Escriba el valor y presione Enter...'
            }
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit" className="term-enter-btn" title="Enviar comando (Enter)">
            <CornerDownLeft size={14} /> Enter
          </button>
        </form>
      </div>
    </div>
  );
}

