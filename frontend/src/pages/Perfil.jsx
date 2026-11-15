import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { CajaCuenta } from './Login.jsx';

export default function Perfil() {
  const { perfil, setPerfil } = useAuth();
  const { T, avisar } = useLang();
  const [nombre, setNombre] = useState(perfil?.nombre || '');
  const [telefono, setTelefono] = useState(perfil?.telefono || '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      setPerfil(await api.actualizarPerfil({ nombre, telefono }));
      avisar(T('Datos guardados', 'Dades desades', 'Details saved'));
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <CajaCuenta eyebrow={T('Tu cuenta', 'El teu compte', 'Your account')} titulo={T('Mi perfil', 'El meu perfil', 'My profile')}>
      <form className="mt-6 grid gap-4" onSubmit={guardar}>
        <label className="label">Email<input className="field" value={perfil?.email || ''} disabled /></label>
        <label className="label">{T('Nombre', 'Nom', 'Name')}<input className="field" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
        <label className="label">{T('Teléfono', 'Telèfon', 'Phone')}<input className="field" type="tel" autoComplete="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} /></label>
        {error && <p className="note note-danger" role="alert">{error}</p>}
        <button className="btn btn-accent w-full" disabled={guardando}>
          {guardando ? <><span className="spinner" />{T('Guardando…', 'Desant…', 'Saving…')}</> : T('Guardar cambios', 'Desar canvis', 'Save changes')}
        </button>
      </form>
    </CajaCuenta>
  );
}
