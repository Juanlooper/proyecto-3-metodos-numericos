import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Renderiza expresiones matemáticas usando KaTeX con tipografía de publicación científica.
 * @param {{ tex: string, block?: boolean, className?: string }} props
 */
export default function MathFormula({ tex, block = false, className = '' }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return tex;
    }
  }, [tex, block]);

  if (block) {
    return (
      <div
        className={`katex-block-wrapper ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`katex-inline-wrapper ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Convierte una expresión de entrada de usuario (ej. "0.5*x^4 - 2*x^3 + 4*x^2 + 12")
 * a notación LaTeX limpia para renderizarla con KaTeX.
 */
export function exprToLatex(rawExpr, varName = 'x') {
  if (!rawExpr || typeof rawExpr !== 'string') return '';
  return rawExpr
    .trim()
    .replace(/\bsqrt\(([^)]+)\)/gi, '\\sqrt{$1}')
    .replace(/\bsin\(/gi, '\\sin(')
    .replace(/\bcos\(/gi, '\\cos(')
    .replace(/\btan\(/gi, '\\tan(')
    .replace(/\bln\(/gi, '\\ln(')
    .replace(/\blog\(/gi, '\\log_{10}(')
    .replace(/\bexp\(([^)]+)\)/gi, 'e^{$1}')
    .replace(/\bpi\b/gi, '\\pi')
    .replace(/\*/g, ' \\cdot ')
    .replace(/(\d)\s*\\cdot\s*([a-zA-Z\\])/g, '$1$2')
    .replace(/\bx\b/g, varName)
    .replace(/\^(\d+)/g, '^{$1}');
}

