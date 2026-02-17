import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function HomePage() {
    const locale = await getLocale();
    const t = await getTranslations();

    return (
        <>
            <Header />

            {/* Hero — fullscreen with background image */}
            <section className="hero">
                <div className="hero-overlay" />
                <div className="hero-inner">
                    <div className="gold-line animate-fade-in-up stagger-1" style={{ marginBottom: '28px' }}></div>
                    <h1 className="hero-title animate-fade-in-up stagger-2">
                        {t('hero.title')}
                        <br />
                        <span className="hero-title-highlight">{t('hero.titleHighlight')}</span>
                    </h1>
                    <p className="hero-subtitle animate-fade-in-up stagger-3">
                        {t('hero.subtitle')}
                    </p>
                </div>
            </section>

            {/* How It Works — minimal, single row */}
            <section id="how-it-works" className="section steps-section">
                <div className="section-inner">
                    <div className="section-header">
                        <h2 className="section-title">{t('howItWorks.title')}</h2>
                        <div className="gold-line" style={{ marginTop: '16px' }}></div>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3 className="step-title">{t('howItWorks.step1Title')}</h3>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3 className="step-title">{t('howItWorks.step2Title')}</h3>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3 className="step-title">{t('howItWorks.step3Title')}</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <h2 className="cta-title">{t('cta.title')}</h2>
                <p className="cta-subtitle">{t('cta.subtitle')}</p>
                <Link href={`/${locale}/generator`} className="btn-primary" style={{ position: 'relative' }}>
                    {t('cta.button')}
                </Link>
            </section>

            <Footer />
        </>
    );
}
