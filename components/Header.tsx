'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function Header() {
    const t = useTranslations('header');
    const locale = useLocale();

    return (
        <header className="header">
            <div className="header-inner">
                <Link href={`/${locale}`} className="header-brand" style={{ textDecoration: 'none' }}>
                    {t('brand')}
                </Link>

                <nav className="header-nav">
                    <Link href={`/${locale}/generator`} className="header-cta">
                        {t('cta')}
                    </Link>
                    <div className="lang-switcher">
                        <Link
                            href={`/en`}
                            className={`lang-btn ${locale === 'en' ? 'active' : ''}`}
                        >
                            EN
                        </Link>
                        <Link
                            href={`/es`}
                            className={`lang-btn ${locale === 'es' ? 'active' : ''}`}
                        >
                            ES
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}
