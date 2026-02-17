'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('footer');
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-inner">
                <div>
                    <div className="footer-brand">{t('brand')}</div>
                </div>
                <div className="footer-rights">
                    © {year} {t('brand')}. {t('rights')}
                </div>
            </div>
        </footer>
    );
}
