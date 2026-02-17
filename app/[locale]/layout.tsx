import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Inter, Cormorant_Garamond, Raleway, Great_Vibes } from 'next/font/google';
import '../globals.css';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

const cormorant = Cormorant_Garamond({
    variable: '--font-cormorant',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
});

const raleway = Raleway({
    variable: '--font-raleway',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
});

const greatVibes = Great_Vibes({
    variable: '--font-great-vibes',
    subsets: ['latin'],
    weight: ['400'],
});

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as 'en' | 'es')) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className={`${inter.variable} ${cormorant.variable} ${raleway.variable} ${greatVibes.variable}`}>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
