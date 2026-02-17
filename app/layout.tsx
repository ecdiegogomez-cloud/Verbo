import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verbo — Personalized Wedding Speeches',
  description: 'Craft a heartfelt, personalized wedding speech in minutes. For best man, maid of honour, parents, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
