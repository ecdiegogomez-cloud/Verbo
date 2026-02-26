import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Texto directo para asegurar que siempre se vea
    const heroTitle = locale === 'es'
        ? { main: 'Encuentra las Palabras', highlight: 'Entrega el Momento' }
        : { main: 'Find the Words', highlight: 'Deliver the Moment' };

    const heroSubtitle = locale === 'es'
        ? 'Tú pones los recuerdos, nosotros escribimos el discurso. Sin plantillas, sin páginas en blanco.'
        : 'You provide the memories, we craft the speech. No templates, no blank pages.';

    const howItWorks = locale === 'es' ? 'Cómo Funciona' : 'How It Works';
    const step1 = locale === 'es' ? 'Comparte Tu Historia' : 'Share Your Story';
    const step2 = locale === 'es' ? 'Lo Escribimos' : 'We Write It';
    const step3 = locale === 'es' ? 'Hazlo Tuyo' : 'Make It Yours';
    const ctaTitle = locale === 'es' ? '¿Listo Para Comenzar?' : 'Ready to Begin?';
    const ctaSubtitle = locale === 'es'
        ? 'Tu discurso perfecto está a solo unos detalles de distancia.'
        : 'Your perfect speech is just a few details away.';

    return (
        <>
            <Header />

            {/* Hero — fullscreen with background image */}
            <section className="hero">
                <div className="hero-overlay" />
                <div className="hero-inner">
                    <div className="gold-line" style={{ marginBottom: '28px', opacity: '1' }}></div>
                    <h1 className="hero-title" style={{ opacity: '1' }}>
                        {heroTitle.main}
                        <br />
                        <span className="hero-title-highlight">{heroTitle.highlight}</span>
                    </h1>
                    <p className="hero-subtitle" style={{ opacity: '1' }}>
                        {heroSubtitle}
                    </p>
                </div>
            </section>

            {/* How It Works — minimal, single row */}
            <section id="how-it-works" className="section steps-section">
                <div className="section-inner">
                    <div className="section-header">
                        <h2 className="section-title">{howItWorks}</h2>
                        <div className="gold-line" style={{ marginTop: '16px' }}></div>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3 className="step-title">{step1}</h3>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3 className="step-title">{step2}</h3>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3 className="step-title">{step3}</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <h2 className="cta-title">{ctaTitle}</h2>
                <p className="cta-subtitle">{ctaSubtitle}</p>
            </section>

            <Footer />
        </>
    );
}
