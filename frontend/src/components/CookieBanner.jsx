import { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';

// Aviso de cookies. De momento NO guarda ni bloquea nada:
// el botón solo cierra el aviso (vuelve a salir al recargar la página).
// Cuando se añadan cookies de analítica, aquí se guardará la elección.
export default function CookieBanner() {
  const { t } = useLang();
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="cookie-bar panel-in p-4 sm:p-5" role="region" aria-label={t('ck.link')}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <p className="min-w-0 flex-1 basis-64 text-sm text-ink">
          <span className="mr-1 font-bold">{t('ck.link')}.</span>{t('ck.p')}
        </p>
        <div className="flex flex-wrap gap-2 max-sm:w-full">
          <button type="button" className="btn btn-ghost !min-h-[44px] !px-4 !text-sm max-sm:flex-1" onClick={() => {}}>
            {t('ck.more')}
          </button>
          <button type="button" className="btn btn-accent !min-h-[44px] !px-4 !text-sm max-sm:flex-1" onClick={() => setVisible(false)}>
            {t('ck.ok')}
          </button>
        </div>
      </div>
    </div>
  );
}
