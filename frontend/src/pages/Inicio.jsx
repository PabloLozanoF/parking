import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import Reserva, { nombreParking, zonaParking } from '../components/Reserva.jsx';
import Barrera from '../components/Barrera.jsx';
import { Flecha } from '../components/Comunes.jsx';
import { euros, precioEstimado } from '../utils.js';

const HORAS_TARIFA = [1, 2, 4, 8, 12];

export default function Inicio() {
  const { t, T, lang, locale } = useLang();
  const location = useLocation();
  const [pedido, setPedido] = useState(null);       // parking elegido desde la tabla de tarifas
  const [ultima, setUltima] = useState(null);       // última reserva hecha (para la barrera)
  const [tarifas, setTarifas] = useState(null);
  const [errorTarifas, setErrorTarifas] = useState('');

  // Lleva a la sección del enlace (/#tarifas, /#reservar…)
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [location.key, location.hash]);

  useEffect(() => {
    api.parkings().then(setTarifas).catch((e) => { setTarifas([]); setErrorTarifas(e.message); });
  }, []);

  const eur = (n) => euros(n, locale);

  return (
    <>
      {/* ============ HERO = RESERVA ============ */}
      <section id="inicio" className="pb-14 pt-8 sm:pt-14 lg:pb-20">
        <div className="wrap grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-14">
          <div className="min-w-0 lg:pt-6">
            <p className="eyebrow">{t('h.eyebrow')}</p>
            <h1 className="display h-hero mt-3"><span>{t('h.l1')}</span><br /><span className="paint">{t('h.l2')}</span></h1>
            <p className="lead mt-5">{t('h.p')}</p>
            <ul className="mt-7 hidden gap-3 text-ink lg:grid">
              {['h.t1', 'h.t2', 'h.t3'].map((k) => (
                <li key={k} className="flex items-center gap-3 font-semibold"><span className="tag tag-ok" aria-hidden="true">✓</span><span>{t(k)}</span></li>
              ))}
            </ul>
          </div>
          <Reserva pedido={pedido} onReservada={setUltima} />
        </div>
      </section>

      <div className="wrap"><div className="bay-line" aria-hidden="true" /></div>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="band">
        <div className="wrap">
          <p className="eyebrow">{t('hw.k')}</p>
          <h2 className="display h-sec mt-2">{t('hw.h')}</h2>
          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="border-t-4 border-ink pt-5">
                <span className="how-n" aria-hidden="true">{n}</span>
                <h3 className="mt-4 text-xl font-bold">{t(`hw.${n}h`)}</h3>
                <p className="mt-2">{t(`hw.${n}p`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ TARIFAS (desde la base de datos) ============ */}
      <section id="tarifas" className="band bg-surface">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">{t('t.k')}</p>
              <h2 className="display h-sec mt-2">{t('t.h')}</h2>
            </div>
            <p className="max-w-md">{t('t.p')}</p>
          </div>
          <div className="relative mt-8 overflow-x-auto rounded-2xl border-[1.5px] border-line/10">
            <table className="rates tnum">
              <thead>
                <tr>
                  <th scope="col">Parking</th>
                  {HORAS_TARIFA.map((h) => <th key={h} scope="col">{h} h</th>)}
                  <th scope="col"><span className="sr-only">{t('t.act')}</span></th>
                </tr>
              </thead>
              <tbody>
                {tarifas === null && <tr><td colSpan={7} className="!text-left text-muted">{T('Cargando tarifas…', 'Carregant tarifes…')}</td></tr>}
                {tarifas?.filter((p) => p.tarifas?.normal != null).map((p) => (
                  <tr key={p.id}>
                    <th scope="row">
                      <span className="block text-lg font-bold text-ink">{nombreParking(p, lang)}</span>
                      <span className="block text-sm font-normal text-muted">{zonaParking(p, lang)} · {eur(p.tarifas.normal)}/h</span>
                    </th>
                    {HORAS_TARIFA.map((h) => <td key={h} className="font-mono font-bold text-ink">{eur(precioEstimado(p.tarifas.normal, h * 60).total)}</td>)}
                    <td>
                      <button type="button" className="btn btn-ghost !min-h-[44px] !px-4 text-sm"
                        aria-label={`${T('Reservar en', 'Reservar a')} ${nombreParking(p, lang)}`}
                        onClick={() => setPedido({ slug: p.slug, n: Date.now() })}>
                        {T('Reservar', 'Reservar')}
                      </button>
                    </td>
                  </tr>
                ))}
                {tarifas?.length === 0 && (
                  <tr><td colSpan={7} className="!text-left text-danger">{errorTarifas || T('Aún no hay parkings dados de alta.', 'Encara no hi ha pàrquings donats d\'alta.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted">{t('t.note')}</p>
        </div>
      </section>

      {/* ============ PRUEBA LA BARRERA ============ */}
      <section id="barrera" className="band">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="min-w-0">
            <p className="eyebrow">{t('g.k')}</p>
            <h2 className="display h-sec mt-2">{t('g.h')}</h2>
            <p className="lead mt-4">{t('g.p')}</p>
            <ul className="mt-6 grid gap-3">
              <li className="flex items-start gap-3"><span className="tag tag-ok mt-0.5">{t('g.t1')}</span><span>{t('g.l1')}</span></li>
              <li className="flex items-start gap-3"><span className="tag tag-danger mt-0.5">{t('g.t2')}</span><span>{t('g.l2')}</span></li>
              <li className="flex items-start gap-3"><span className="tag tag-warn mt-0.5">{t('g.t3')}</span><span>{t('g.l3')}</span></li>
            </ul>
          </div>
          <Barrera matricula={ultima?.matricula} version={ultima?.id} />
        </div>
      </section>

      {/* ============ SEGURIDAD ============ */}
      <section className="band bg-surface">
        <div className="wrap">
          <p className="eyebrow">{t('s.k')}</p>
          <h2 className="display h-sec mt-2">{t('s.h')}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="tile p-5"><h3 className="text-lg font-bold">{t(`s.${n}h`)}</h3><p className="mt-1.5 text-[.95rem]">{t(`s.${n}p`)}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ OPINIONES (ilustrativas, avisado en la página) ============ */}
      <section id="opiniones" className="band">
        <div className="wrap">
          <p className="eyebrow">{t('o.k')}</p>
          <h2 className="display h-sec mt-2">{t('o.h')}</h2>
          <p className="note note-warn mt-5 max-w-2xl">{t('o.disc')}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <figure key={n} className="tile flex flex-col p-6">
                <blockquote className="flex-1 text-lg text-ink">{t(`o.${n}q`)}</blockquote>
                <figcaption className="mt-5 border-t-[1.5px] border-line/10 pt-4 text-sm">
                  <span className="block font-bold text-ink">{t(`o.${n}w`)}</span>
                  <span className="text-muted">{t(`o.ex${n}`)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AYUDA / FAQ ============ */}
      <section id="faq" className="band bg-surface">
        <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{t('f.k')}</p>
            <h2 className="display h-sec mt-2">{t('f.h')}</h2>
          </div>
          <div className="min-w-0 border-t-[1.5px] border-line/15">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <details key={n} className="faq" open={n === 1}>
                <summary><span>{t(`f.${n}q`)}</span><span className="pm" aria-hidden="true">+</span></summary>
                <p>{t(`f.${n}a`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="band">
        <div className="wrap">
          <div className="flex flex-wrap items-center justify-between gap-8 rounded-3xl bg-primary p-8 text-on-primary sm:p-12">
            <div className="flex min-w-0 items-center gap-6">
              <span className="display hidden text-[7rem] leading-[.8] sm:block" aria-hidden="true">P</span>
              <h2 className="display h-sec !text-on-primary">{t('c.h')}</h2>
            </div>
            <Link to="/#reservar" className="btn btn-accent"><span>{t('c.b')}</span><Flecha /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
