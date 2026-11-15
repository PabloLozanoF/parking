import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';

export default function Footer() {
  const { t } = useLang();
  const enlace = 'nav-link !px-0 hover:!bg-transparent hover:underline';
  return (
    <footer className="border-t-[1.5px] border-line/10 bg-surface">
      <div className="wrap grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-2xl text-ink">Tarraco <span className="text-link">Parkings</span></p>
          <p className="mt-2 max-w-xs text-sm">{t('ft.p')}</p>
        </div>
        <nav aria-label="Pie" className="grid content-start text-sm font-semibold">
          <Link to="/#reservar" className={enlace}>{t('n.book')}</Link>
          <Link to="/#tarifas" className={enlace}>{t('n.rates')}</Link>
          <Link to="/#como-funciona" className={enlace}>{t('n.how')}</Link>
          <Link to="/#faq" className={enlace}>{t('n.help')}</Link>
        </nav>
        <div className="grid content-start gap-2 text-sm">
          <p className="font-bold text-ink">{t('ft.where')}</p>
          <p>Tarragona, Catalunya</p>
          <p>{t('ft.parks')}</p>
        </div>
      </div>
      <div className="border-t-[1.5px] border-line/10">
        <p className="wrap py-5 text-xs text-muted">© {new Date().getFullYear()} Tarraco Parkings · {t('ft.copy')}</p>
      </div>
    </footer>
  );
}
