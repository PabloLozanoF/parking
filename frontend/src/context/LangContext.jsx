import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TEXTOS } from '../textos.js';

// Idioma (castellano / catalán) y avisos emergentes ("toasts")
const LangContext = createContext(null);

function idiomaGuardado() {
  try {
    const l = localStorage.getItem('tp-lang');
    if (l === 'es' || l === 'ca') return l;
  } catch { /* sin almacenamiento: castellano */ }
  return 'es';
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(idiomaGuardado);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('tp-lang', l); } catch { /* nada */ }
  }, []);

  const avisar = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast({ msg, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const valor = useMemo(() => {
    const ca = lang === 'ca';
    return {
      lang,
      setLang,
      avisar,
      // t('clave') → texto del diccionario; T('es', 'ca') → texto suelto
      t: (k) => (TEXTOS[k] ? TEXTOS[k][ca ? 1 : 0] : k),
      T: (es, cat) => (ca ? cat : es),
      locale: ca ? 'ca-ES' : 'es-ES',
    };
  }, [lang, setLang, avisar]);

  return (
    <LangContext.Provider value={valor}>
      {children}
      <div className="toasts pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toast && <div key={toast.id} className="toast show pointer-events-auto">{toast.msg}</div>}
      </div>
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
