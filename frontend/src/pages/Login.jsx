import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { Flecha } from '../components/Comunes.jsx';

// Caja centrada común a Entrar y Crear cuenta
export function CajaCuenta({ eyebrow, titulo, children }) {
  return (
    <section className="band">
      <div className="wrap grid place-items-center">
        <div className="booking w-full max-w-md p-6 sm:p-8">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-2 text-5xl leading-none">{titulo}</h1>
          {children}
        </div>
      </div>
    </section>
  );
}

export default function Login() {
  const { login } = useAuth();
  const { T } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const desde = location.state?.desde || '/';

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    const { error } = await login(email, password);
    setEnviando(false);
    if (error) {
      return setError(error.message === 'Invalid login credentials'
        ? T('Email o contraseña incorrectos.', 'Correu o contrasenya incorrectes.') : error.message);
    }
    navigate(desde, { replace: true });
  };

  return (
    <CajaCuenta eyebrow={T('Tu cuenta', 'El teu compte')} titulo={T('Entrar', 'Entrar')}>
      {desde.includes('reservar') && (
        <p className="note note-warn mt-4">{T('Tu reserva está guardada. Entra y la confirmas en un clic.', 'La teva reserva està desada. Entra i la confirmes amb un clic.')}</p>
      )}
      <form className="mt-6 grid gap-4" onSubmit={enviar}>
        <label className="label">Email
          <input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="label">{T('Contraseña', 'Contrasenya')}
          <input className="field" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="note note-danger" role="alert">{error}</p>}
        <button className="btn btn-accent w-full" disabled={enviando}>
          {enviando ? <><span className="spinner" />{T('Entrando…', 'Entrant…')}</> : <><span>{T('Entrar', 'Entrar')}</span><Flecha /></>}
        </button>
      </form>
      <p className="mt-5 text-sm">
        {T('¿No tienes cuenta?', 'No tens compte?')}{' '}
        <Link to="/registro" state={location.state} className="font-bold text-link underline underline-offset-4">{T('Créala en un minuto', 'Crea-la en un minut')}</Link>
      </p>
    </CajaCuenta>
  );
}
