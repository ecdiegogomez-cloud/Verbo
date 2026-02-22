'use client';

import { useState, useRef, use } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConversationalForm from '@/components/ConversationalForm';
import SpeechResult from '@/components/SpeechResult';
import InterviewChat from '@/components/InterviewChat';

interface FormData {
    relationship: string;
    relationshipTarget: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    duration: string;
    speechLang: string;
}

type Phase = 'form' | 'interview' | 'result';

export default function GeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('generator');
    const ti = useTranslations('interview');

    const [phase, setPhase] = useState<Phase>('form');
    const [formData, setFormData] = useState<FormData | null>(null);
    const [speech, setSpeech] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const resultRef = useRef<HTMLDivElement>(null);
    const lastTranscriptRef = useRef<string>('');

    // Fase 1 → Fase 2: user submitted the form
    const handleFormSubmit = (data: FormData) => {
        setFormData(data);
        setPhase('interview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate speech from a transcript
    const generateFromTranscript = async (transcript: string) => {
        if (!formData) return;
        setPhase('result');
        setIsLoading(true);
        setError('');
        setSpeech('');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const payload = { ...formData, anecdotes: transcript };

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
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

            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    // Fase 2 → Fase 3: interview complete, generate speech
    const handleInterviewComplete = async (transcript: string) => {
        lastTranscriptRef.current = transcript;
        await generateFromTranscript(transcript);
    };

    const handleRegenerate = () => {
        if (lastTranscriptRef.current) {
            generateFromTranscript(lastTranscriptRef.current);
        }
    };

    const handleNewSpeech = () => {
        setPhase('form');
        setFormData(null);
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
                        <div className="gold-line" style={{ marginBottom: '24px' }} />
                        <h1 className="generator-title">
                            {phase === 'form' && t('title')}
                            {phase === 'interview' && ti('title')}
                            {phase === 'result' && t('title')}
                        </h1>
                        <p className="generator-subtitle">
                            {phase === 'form' && t('subtitle')}
                            {phase === 'interview' && ti('subtitle')}
                            {phase === 'result' && ''}
                        </p>
                    </div>

                    {/* Fase 1 — Conversational Form */}
                    {phase === 'form' && (
                        <ConversationalForm onGenerate={handleFormSubmit} isLoading={false} locale={locale} />
                    )}

                    {/* Fase 2 — Interview */}
                    {phase === 'interview' && formData && (
                        <InterviewChat
                            formData={formData}
                            onComplete={handleInterviewComplete}
                        />
                    )}

                    {/* Fase 3 — Generating / Result */}
                    {phase === 'result' && (
                        <>
                            {isLoading && (
                                <div className="generating-indicator">
                                    <div className="generating-spinner" />
                                    <p className="generating-label">{ti('generating')}</p>
                                </div>
                            )}

                            {error && (
                                <div style={{
                                    marginTop: '24px',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                    color: '#fca5a5',
                                    fontSize: '0.9rem',
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
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}