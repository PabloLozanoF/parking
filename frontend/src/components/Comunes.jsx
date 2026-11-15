import { fmtMatricula } from '../utils.js';

// Matrícula europea (franja azul con la "E")
export function Matricula({ valor, className = '' }) {
  return (
    <span className={`plate ${className}`}>
      <span className="eu" aria-hidden="true">E</span>
      <span className="num">{fmtMatricula(valor) || '— — —'}</span>
    </span>
  );
}

// Flecha de los botones (se desplaza al pasar el ratón)
export function Flecha() {
  return (
    <svg className="arr h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

// Logo: señal azul "P" + nombre
export function Logo() {
  return (
    <>
      <span className="sign" aria-hidden="true">P</span>
      <span className="display text-2xl leading-none text-ink">Tarraco <span className="text-link">Parkings</span></span>
    </>
  );
}

// Cabecera de las páginas interiores
export function Cabecera({ eyebrow, titulo, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display h-sec mt-2">{titulo}</h1>
      </div>
      {children}
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }) {
  return <p className="flex items-center gap-3 py-10 font-semibold text-muted"><span className="spinner !border-line/20 !border-t-ink" aria-hidden="true" />{texto}</p>;
}
