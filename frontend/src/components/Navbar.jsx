import { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { Logo } from './Comunes.jsx';

export default function Navbar() {
  const { session, perfil, esAdmin, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const menu = useRef(null);

  // Cierra el menú móvil al navegar, al pulsar fuera o con Escape
  useEffect(() => { if (menu.current) menu.current.open = false; }, [location]);
  useEffect(() => {
    const fuera = (e) => { if (menu.current?.open && !menu.current.contains(e.target)) menu.current.open = false; };
    const esc = (e) => { if (e.key === 'Escape' && menu.current) menu.current.open = false; };
    document.addEventListener('click', fuera);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', fuera); document.removeEventListener('keydown', esc); };
  }, []);

  const salir = async () => { await logout(); navigate('/'); };
  const nombre = perfil?.nombre || session?.user?.email || '';

  const secciones = [
    ['/#como-funciona', t('n.how')],
    ['/#tarifas', t('n.rates')],
    ['/#barrera', t('n.gate')],
    ['/#faq', t('n.help')],
  ];
  const cuenta = session
    ? [['/mis-reservas', t('n.mine')], ...(esAdmin ? [['/admin', t('n.admin')]] : []), ['/perfil', t('n.profile')]]
    : [['/login', t('n.login')], ['/registro', t('n.signup')]];

  return (
    <header className="navbar">
      <div className="wrap flex items-center justify-between gap-2 py-3 sm:gap-3">
        <Link to="/" className="flex min-h-[44px] min-w-0 items-center gap-2 sm:gap-3"><Logo /></Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Principal">
          {secciones.map(([to, txt]) => <Link key={to} to={to} className="nav-link">{txt}</Link>)}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="flex rounded-[10px] border-[1.5px] border-line/15 p-0.5" role="group" aria-label="Idioma">
            {['es', 'ca', 'en'].map((l) => (
              <button key={l} type="button" className="lang-btn" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            {session ? (
              <>
                <NavLink to="/mis-reservas" className="nav-link">{t('n.mine')}</NavLink>
                {esAdmin && <NavLink to="/admin" className="nav-link">{t('n.admin')}</NavLink>}
                <NavLink to="/perfil" className="nav-link max-w-[11rem] truncate" title={nombre}>{nombre}</NavLink>
                <button type="button" className="nav-link" onClick={salir}>{t('n.logout')}</button>
              </>
            ) : (
              <NavLink to="/login" className="nav-link">{t('n.login')}</NavLink>
            )}
          </div>

          <Link to="/#reservar" className="btn btn-accent max-sm:!hidden">{t('n.cta')}</Link>

          <details ref={menu} className="menu relative xl:hidden">
            <summary className="grid h-11 w-11 place-items-center rounded-[10px] border-[1.5px] border-line/15 text-ink" aria-label="Menú">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
            </summary>
            <nav className="absolute right-0 top-[52px] z-10 grid w-64 gap-1 rounded-2xl border-2 border-ink bg-surface p-2 shadow-xl" aria-label="Menú móvil">
              <Link to="/#reservar" className="nav-link">{t('n.book')}</Link>
              {secciones.map(([to, txt]) => <Link key={to} to={to} className="nav-link">{txt}</Link>)}
              <div className="my-1 h-px bg-line/10 lg:hidden" aria-hidden="true" />
              {cuenta.map(([to, txt]) => <NavLink key={to} to={to} className="nav-link lg:hidden">{txt}</NavLink>)}
              {session && <button type="button" className="nav-link text-left lg:hidden" onClick={salir}>{t('n.logout')}</button>}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
