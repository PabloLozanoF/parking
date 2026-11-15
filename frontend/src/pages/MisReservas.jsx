import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import { Cabecera, Cargando, Flecha, Matricula } from '../components/Comunes.jsx';
import { nombreParking } from '../components/Reserva.jsx';
import { euros, fecha, hora } from '../utils.js';

const ESTADOS = {
  confirmada: ['tag-ok', 'Confirmada', 'Confirmada'],
  completada: ['tag-warn', 'Completada', 'Completada'],
  cancelada: ['tag-danger', 'Cancelada', 'Cancel·lada'],
};

export default function MisReservas() {
  const { T, lang, locale, avisar } = useLang();
  const [reservas, setReservas] = useState(null);
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(null); // id de la reserva que se va a cancelar
  const [cancelando, setCancelando] = useState(false);

  const cargar = () => api.misReservas().then(setReservas).catch((e) => setError(e.message));
  useEffect(() => { cargar(); }, []);

  const cancelar = async (id) => {
    setCancelando(true);
    try {
      await api.cancelarReserva(id);
      avisar(T('Reserva cancelada', 'Reserva cancel·lada'));
      setConfirmando(null);
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelando(false);
    }
  };

  const ahora = new Date();
  const proximas = (reservas || []).filter((r) => r.estado === 'confirmada' && new Date(r.fin) > ahora);
  const historial = (reservas || []).filter((r) => !proximas.includes(r));

  const Tarjeta = ({ r }) => {
    const [cls, es, ca] = ESTADOS[r.estado] || ESTADOS.confirmada;
    const cancelable = r.estado === 'confirmada' && new Date(r.inicio) > ahora;
    return (
      <article className="card grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-widest text-ink">{r.codigo || `#${r.id}`}</span>
            <span className={`tag ${cls}`}>{T(es, ca)}</span>
          </div>
          <p className="mt-1 font-bold text-ink">{nombreParking(r.plaza?.parking, lang) || 'Parking'} · {T('plaza', 'plaça')} {r.plaza?.codigo}</p>
          <p className="tnum text-sm">{fecha(r.inicio, locale)} – {hora(r.fin, locale)}</p>
          <Matricula valor={r.matricula} className="mt-2 text-sm" />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
          <span className="tnum font-mono text-2xl font-bold text-ink">{euros(r.precio_total, locale)}</span>
          {cancelable && confirmando !== r.id && (
            <button type="button" className="btn btn-ghost !min-h-[44px] !px-4 text-sm" onClick={() => setConfirmando(r.id)}>{T('Cancelar', 'Cancel·lar')}</button>
          )}
        </div>
        {confirmando === r.id && (
          <div className="note note-danger flex flex-wrap items-center justify-between gap-3 sm:col-span-2" role="alert">
            <span className="font-semibold">{T('¿Cancelar esta reserva? Quedará en tu historial.', 'Cancel·lar aquesta reserva? Quedarà al teu historial.')}</span>
            <span className="flex gap-2">
              <button type="button" className="btn btn-ghost !min-h-[44px] !px-4 text-sm" onClick={() => setConfirmando(null)}>{T('No', 'No')}</button>
              <button type="button" className="btn btn-primary !min-h-[44px] !px-4 text-sm" disabled={cancelando} onClick={() => cancelar(r.id)}>{T('Sí, cancelar', 'Sí, cancel·lar')}</button>
            </span>
          </div>
        )}
      </article>
    );
  };

  return (
    <section className="band">
      <div className="wrap max-w-4xl">
        <Cabecera eyebrow={T('Tu cuenta', 'El teu compte')} titulo={T('Mis reservas', 'Les meves reserves')}>
          <Link to="/#reservar" className="btn btn-accent"><span>{T('Nueva reserva', 'Nova reserva')}</span><Flecha /></Link>
        </Cabecera>
        {error && <p className="note note-danger mt-6" role="alert">{error}</p>}
        {!reservas && !error && <Cargando texto={T('Cargando…', 'Carregant…')} />}
        {reservas?.length === 0 && (
          <div className="card mt-8 p-6">
            <p className="text-lg font-semibold text-ink">{T('Todavía no tienes reservas.', 'Encara no tens reserves.')}</p>
            <p className="mt-1">{T('Elige parking y horas: en un minuto la tienes.', 'Tria pàrquing i hores: en un minut la tens.')}</p>
          </div>
        )}
        {proximas.length > 0 && (
          <>
            <h2 className="legend mt-10">{T('Próximas', 'Properes')}</h2>
            <div className="mt-4 grid gap-3">{proximas.map((r) => <Tarjeta key={r.id} r={r} />)}</div>
          </>
        )}
        {historial.length > 0 && (
          <>
            <h2 className="legend mt-10">{T('Historial', 'Historial')}</h2>
            <div className="mt-4 grid gap-3">{historial.map((r) => <Tarjeta key={r.id} r={r} />)}</div>
          </>
        )}
      </div>
    </section>
  );
}
