'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpeechForm from '@/components/SpeechForm';
import SpeechResult from '@/components/SpeechResult';

interface FormData {
    relationship: string;
    coupleNames: string;
    speakerName: string;
    personality: string;
    tone: string;
    anecdotes: string;
    duration: string;
    speechLang: string;
}

export default function GeneratorPage() {
    const t = useTranslations('generator');
    const [speech, setSpeech] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const lastFormData = useRef<FormData | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const generateSpeech = async (formData: FormData) => {
        lastFormData.current = formData;
        setIsLoading(true);
        setError('');
        setSpeech('');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate speech');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response stream');

            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                setSpeech(fullText);
            }

            // Scroll to result
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = () => {
        if (lastFormData.current) {
            generateSpeech(lastFormData.current);
        }
    };

    const handleNewSpeech = () => {
        setSpeech('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Header />
            <div className="generator-page">
                <div className="generator-container">
                    <div className="generator-header">
                        <div className="gold-line" style={{ marginBottom: '24px' }}></div>
                        <h1 className="generator-title">
                            {t('title')}
                        </h1>
                        <p className="generator-subtitle">{t('subtitle')}</p>
                    </div>

                    <SpeechForm onGenerate={generateSpeech} isLoading={isLoading} />

                    {error && (
                        <div style={{
                            marginTop: '24px',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.15)',
                            color: '#fca5a5',
                            fontSize: '0.9rem',
                            letterSpacing: '0.01em',
                        }}>
                            {error}
                        </div>
                    )}

                    {speech && (
                        <div ref={resultRef}>
                            <SpeechResult
                                speech={speech}
                                onRegenerate={handleRegenerate}
                                onNewSpeech={handleNewSpeech}
                                isLoading={isLoading}
                            />
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
