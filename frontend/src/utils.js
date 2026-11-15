// Utilidades comunes de formato

export const TIPOS = {
  normal: ['Normal', 'Normal'],
  moto: ['Moto', 'Moto'],
  electrico: ['Eléctrico', 'Elèctric'],
  discapacitados: ['Movilidad reducida', 'Mobilitat reduïda'],
};

export const GESTION = 0.10; // 10 % de gastos de gestión (igual que el backend)

const pad = (n) => String(n).padStart(2, '0');

// 12.5 → "12,50 €"
export const euros = (n, locale = 'es-ES') =>
  Number(n || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

// minutos desde medianoche → "09:30"
export const hhmm = (m) => pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60);

// Date → "2026-11-15" (hora local)
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const diaIso = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return isoDate(d); };

// "2026-11-15" → "dom, 15 nov"
export const fechaCorta = (iso, locale = 'es-ES') =>
  new Date(iso + 'T00:00').toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });

// ISO completo → "dom, 15 nov, 09:30"
export const fecha = (iso, locale = 'es-ES') =>
  new Date(iso).toLocaleString(locale, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const hora = (iso, locale = 'es-ES') =>
  new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

// Fecha "AAAA-MM-DD" + minutos → Date en hora local
export const aFecha = (dia, minutos) => {
  const d = new Date(dia + 'T00:00');
  d.setMinutes(minutos);
  return d;
};

export const planta = (n, T = (es) => es) =>
  n === 0 ? T('Planta baja', 'Planta baixa') : n < 0 ? T(`Sótano ${-n}`, `Soterrani ${-n}`) : T(`Planta ${n}`, `Planta ${n}`);

// Matrícula: "1234 bcd" → "1234BCD" y vuelta a "1234 BCD"
export const normMatricula = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const fmtMatricula = (v) => {
  const n = normMatricula(v);
  return /^\d{4}[A-Z]{3}$/.test(n) ? `${n.slice(0, 4)} ${n.slice(4)}` : n;
};

// Precio con la misma regla que el servidor (cuartos de hora + 10 %)
export function precioEstimado(precioHora, minutos) {
  const base = Math.round(Math.ceil(minutos / 15) * 0.25 * precioHora * 100) / 100;
  const gestion = Math.round(base * GESTION * 100) / 100;
  return { base, gestion, total: Math.round((base + gestion) * 100) / 100 };
}
