'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, Download, RefreshCw, PlusCircle } from 'lucide-react';

interface SpeechResultProps {
    speech: string;
    onRegenerate: () => void;
    onNewSpeech: () => void;
    isLoading: boolean;
}

export default function SpeechResult({ speech, onRegenerate, onNewSpeech, isLoading }: SpeechResultProps) {
    const t = useTranslations('result');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(speech);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([speech], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding-speech.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="result-container animate-fade-in">
            <div className="result-header">
                <h2 className="result-title">💍 {t('title')}</h2>
                <div className="result-actions">
                    <button className="btn-icon" onClick={handleCopy}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? t('copied') : t('copy')}
                    </button>
                    <button className="btn-icon" onClick={handleDownload}>
                        <Download size={16} />
                        {t('download')}
                    </button>
                    <button className="btn-icon" onClick={onRegenerate} disabled={isLoading}>
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        {t('regenerate')}
                    </button>
                    <button className="btn-icon" onClick={onNewSpeech}>
                        <PlusCircle size={16} />
                        {t('newSpeech')}
                    </button>
                </div>
            </div>

            <div className="result-text">{speech}</div>

            <div className="result-tip">
                💡 {t('tip')}
            </div>
        </div>
    );
}
