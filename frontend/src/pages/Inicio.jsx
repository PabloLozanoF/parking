import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../context/LangContext.jsx';
import Reserva, { nombreParking, zonaParking } from '../components/Reserva.jsx';
import Barrera from '../components/Barrera.jsx';
import { Flecha, Icono } from '../components/Comunes.jsx';
import { TIPOS, euros, precioEstimado } from '../utils.js';

const HORAS_TARIFA = [1, 2, 4, 8, 12];
const ICONO_TIPO = { normal: 'coche', electrico: 'rayo', moto: 'moto', discapacitados: 'accesible' };
const DESC_TIPO = {
  normal: ['Para coches y furgonetas pequeñas.', 'Per a cotxes i furgonetes petites.', 'For cars and small vans.'],
  electrico: ['Plazas reservadas para vehículos eléctricos.', 'Places reservades per a vehicles elèctrics.', 'Spaces reserved for electric vehicles.'],
  moto: ['Plazas más pequeñas y más baratas para motos.', 'Places més petites i més barates per a motos.', 'Smaller, cheaper spaces for motorbikes.'],
  discapacitados: ['Plazas adaptadas para personas con movilidad reducida.', 'Places adaptades per a persones amb mobilitat reduïda.', 'Spaces adapted for people with reduced mobility.'],
};

// Fondo de la portada: vista aérea de un parking dibujada en SVG
function VistaAerea() {
  const plazas = [];
  for (let fila = 0; fila < 6; fila++) {
    for (let col = 0; col < 14; col++) {
      const x = 40 + col * 70, y = 30 + fila * 130 + (fila % 2) * 50;
      plazas.push(<rect key={`${fila}-${col}`} x={x} y={y} width="62" height="100" fill="none" stroke="rgb(255 255 255 / .35)" strokeWidth="2" />);
      if ((fila * 7 + col * 3) % 5 === 0) plazas.push(<rect key={`c${fila}-${col}`} x={x + 12} y={y + 14} width="38" height="72" rx="10" fill={col % 4 === 0 ? 'rgb(214 28 40 / .8)' : 'rgb(255 255 255 / .22)'} />);
    }
  }
  return (
    <svg className="hero-art h-full w-full" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="rotate(-8 500 400)">{plazas}</g>
    </svg>
  );
}

// Dibujo de cabecera de cada tarjeta de parking
function PlazasArt({ semilla }) {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 132" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={20 + i * 44} y="18" width="38" height="64" fill="none" stroke="rgb(255 255 255 / .3)" strokeWidth="2" />
          {(i + semilla) % 3 !== 0 && <rect x={27 + i * 44} y="28" width="24" height="44" rx="7" fill={(i + semilla) % 4 === 1 ? 'rgb(214 28 40 / .85)' : 'rgb(255 255 255 / .25)'} />}
        </g>
      ))}
      <path d="M0 108 H400" stroke="rgb(255 255 255 / .35)" strokeWidth="3" strokeDasharray="22 16" />
    </svg>
  );
}

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
      {/* ============ PORTADA (APCOA): fondo oscuro + buscador encima ============ */}
      <section id="inicio" className="hero pb-12 pt-10 sm:pt-14 lg:pb-16">
        <VistaAerea />
        <div className="wrap grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-14">
          <div className="min-w-0 lg:pt-10">
            <p className="eyebrow">{t('h.eyebrow')}</p>
            <h1 className="display h-hero mt-4"><span>{t('h.l1')}</span><br /><span className="paint">{t('h.l2')}</span></h1>
            <p className="lead mt-5">{t('h.p')}</p>
            <ul className="mt-8 grid gap-3 text-white">
              {['h.t1', 'h.t2', 'h.t3'].map((k) => (
                <li key={k} className="flex items-center gap-3 font-semibold">
                  <span className="hero-check" aria-hidden="true"><svg className="ico !h-4 !w-4" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" strokeWidth="3" /></svg></span>
                  <span>{t(k)}</span>
                </li>
              ))}
            </ul>
          </div>
          <Reserva pedido={pedido} onReservada={setUltima} />
        </div>
      </section>

      {/* ============ SIN TICKET · SIN EFECTIVO · SIN ESTRÉS (APCOA) ============ */}
      <section className="usp" aria-label={T('Ventajas', 'Avantatges', 'Benefits')}>
        <ul className="wrap grid gap-6 py-8 md:grid-cols-3">
          {[
            ['ticket', T('Sin ticket', 'Sense tiquet', 'No ticket'), T('Tu matrícula abre la barrera.', 'La teva matrícula obre la barrera.', 'Your number plate opens the barrier.')],
            ['efectivo', T('Sin efectivo', 'Sense efectiu', 'No cash'), T('Reservas y pagas online, antes de llegar.', 'Reserves i pagues en línia, abans d\'arribar.', 'Book and pay online before you arrive.')],
            ['calma', T('Sin estrés', 'Sense estrès', 'No stress'), T('Tu plaza te espera, aunque el centro esté lleno.', 'La teva plaça t\'espera, encara que el centre sigui ple.', 'Your space is waiting, even when the centre is full.')],
          ].map(([ico, h, p]) => (
            <li key={ico} className="flex items-center gap-4">
              <span className="usp-ico"><Icono nombre={ico} /></span>
              <span><span className="block font-display text-lg font-extrabold text-ink">{h}.</span><span className="text-sm">{p}</span></span>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ NUESTROS PARKINGS (Q-Park: tarjetas de ubicaciones) ============ */}
      <section id="parkings" className="band">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">{T('Nuestros parkings', 'Els nostres pàrquings', 'Our car parks')}</p>
              <h2 className="display h-sec mt-3">{T('Tres parkings, a un paso de todo.', 'Tres pàrquings, a un pas de tot.', 'Three car parks, close to everything.')}</h2>
            </div>
            <a href="#tarifas" className="more-link">{T('Ver todas las tarifas', 'Veure totes les tarifes', 'See all prices')}<Flecha /></a>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {tarifas === null && [0, 1, 2].map((i) => <div key={i} className="pcard h-[330px] animate-pulse" aria-hidden="true" />)}
            {tarifas?.map((p, i) => {
              const precios = Object.values(p.tarifas || {});
              const desde = p.tarifas?.normal ?? (precios.length ? Math.min(...precios) : null);
              return (
                <article key={p.id} className="pcard">
                  <div className="pcard-art">
                    <PlazasArt semilla={i} />
                    <span className="pcard-pin" aria-hidden="true">{(nombreParking(p, lang).split(' ').pop() || 'P')[0]}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 pt-9">
                    <h3 className="text-xl font-extrabold">{nombreParking(p, lang)}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm"><Icono nombre="pin" className="!h-4 !w-4 text-accent" />{zonaParking(p, lang)}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5" aria-label={T('Tipos de plaza', 'Tipus de plaça', 'Space types')}>
                      {Object.keys(p.tarifas || {}).map((tp) => (
                        <span key={tp} className="tag bg-sunken text-ink" title={T(...TIPOS[tp])}><Icono nombre={ICONO_TIPO[tp]} className="!h-4 !w-4" />{T(...TIPOS[tp])}</span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 border-t border-line/10 pt-4 mt-5">
                      <p className="text-sm">
                        {desde != null && <><span className="block">{T('desde', 'des de', 'from')}</span><span className="tnum font-mono text-2xl font-bold text-ink">{eur(desde)}</span><span className="text-muted">/h</span></>}
                        <span className="block text-xs text-muted">{p.total_plazas} {T('plazas', 'places', 'spaces')}</span>
                      </p>
                      <button type="button" className="btn btn-primary" onClick={() => setPedido({ slug: p.slug, n: Date.now() })}>
                        {T('Reservar aquí', 'Reservar aquí', 'Book here')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {tarifas?.length === 0 && <p className="note note-danger mt-6">{errorTarifas || T('Aún no hay parkings dados de alta.', 'Encara no hi ha pàrquings donats d\'alta.', 'No car parks have been added yet.')}</p>}
        </div>
      </section>

      {/* ============ SERVICIOS (Contipark: tarjetas de producto) ============ */}
      <section id="servicios" className="band bg-surface">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">{T('Servicios', 'Serveis', 'Services')}</p>
              <h2 className="display h-sec mt-3">{T('Una plaza para cada vehículo.', 'Una plaça per a cada vehicle.', 'A space for every vehicle.')}</h2>
            </div>
            <p className="max-w-md">{T('Elige el tipo de plaza al reservar. Precios leídos de la base de datos.', 'Tria el tipus de plaça en reservar. Preus llegits de la base de dades.', 'Choose the space type when booking. Prices read from the database.')}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.keys(TIPOS).map((tp) => {
              const precios = (tarifas || []).map((p) => p.tarifas?.[tp]).filter((x) => x != null);
              const desde = precios.length ? Math.min(...precios) : null;
              return (
                <article key={tp} className="scard">
                  <span className="usp-ico"><Icono nombre={ICONO_TIPO[tp]} /></span>
                  <h3 className="text-lg font-extrabold">{T(...TIPOS[tp])}</h3>
                  <p className="flex-1 text-sm">{T(...DESC_TIPO[tp])}</p>
                  <p className="text-sm text-muted">
                    {desde != null ? <>{T('desde', 'des de', 'from')} <span className="tnum font-mono text-base font-bold text-ink">{eur(desde)}</span>/h</> : tarifas ? T('No disponible', 'No disponible', 'Not available') : '…'}
                  </p>
                  <button type="button" className="more-link self-start" disabled={desde == null} onClick={() => setPedido({ tipo: tp, n: Date.now() })}>
                    {T('Reservar', 'Reservar', 'Book')}<Flecha />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como-funciona" className="band">
        <div className="wrap">
          <p className="eyebrow">{t('hw.k')}</p>
          <h2 className="display h-sec mt-2">{t('hw.h')}</h2>
          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="tile p-6">
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
                {tarifas === null && <tr><td colSpan={7} className="!text-left text-muted">{T('Cargando tarifas…', 'Carregant tarifes…', 'Loading prices…')}</td></tr>}
                {tarifas?.filter((p) => p.tarifas?.normal != null).map((p) => (
                  <tr key={p.id}>
                    <th scope="row">
                      <span className="block text-lg font-bold text-ink">{nombreParking(p, lang)}</span>
                      <span className="block text-sm font-normal text-muted">{zonaParking(p, lang)} · {eur(p.tarifas.normal)}/h</span>
                    </th>
                    {HORAS_TARIFA.map((h) => <td key={h} className="font-mono font-bold text-ink">{eur(precioEstimado(p.tarifas.normal, h * 60).total)}</td>)}
                    <td>
                      <button type="button" className="btn btn-ghost !min-h-[44px] !px-4 text-sm"
                        aria-label={`${T('Reservar en', 'Reservar a', 'Book at')} ${nombreParking(p, lang)}`}
                        onClick={() => setPedido({ slug: p.slug, n: Date.now() })}>
                        {T('Reservar', 'Reservar', 'Book')}
                      </button>
                    </td>
                  </tr>
                ))}
                {tarifas?.length === 0 && (
                  <tr><td colSpan={7} className="!text-left text-danger">{errorTarifas || T('Aún no hay parkings dados de alta.', 'Encara no hi ha pàrquings donats d\'alta.', 'No car parks have been added yet.')}</td></tr>
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
              <div key={n} className="tile p-5">
                <span className="usp-ico !h-11 !w-11"><Icono nombre={['candado', 'tarjeta', 'escudo', 'copia'][n - 1]} /></span>
                <h3 className="mt-4 text-lg font-extrabold">{t(`s.${n}h`)}</h3><p className="mt-1.5 text-[.95rem]">{t(`s.${n}p`)}</p>
              </div>
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
          <div className="hero flex flex-wrap items-center justify-between gap-8 rounded-2xl p-8 sm:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true"><PlazasArt semilla={2} /></div>
            <div className="relative flex min-w-0 items-center gap-6">
              <span className="sign hidden !h-20 !w-20 !rounded-2xl !text-5xl sm:grid" aria-hidden="true">P</span>
              <h2 className="display h-sec max-w-xl">{t('c.h')}</h2>
            </div>
            <Link to="/#reservar" className="btn btn-accent relative"><span>{t('c.b')}</span><Flecha /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
