'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
} from 'docx';

interface SpeechResultProps {
    speech: string;
    onRegenerate: () => void;
    onNewSpeech: () => void;
    isLoading: boolean;
    speakerName?: string;
    coupleNames?: string;
}

export default function SpeechResult({
    speech,
    onRegenerate,
    onNewSpeech,
    isLoading,
    speakerName,
    coupleNames,
}: SpeechResultProps) {
    const t = useTranslations('result');
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(speech);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async () => {
        // Title-case helper — only used for the DOCX header display
        const LOWER_WORDS = new Set(['y', 'e', 'and', '&', 'de', 'del']);
        const toTitle = (s: string) =>
            s
                .split(' ')
                .map((word, i) =>
                    i === 0 || !LOWER_WORDS.has(word.toLowerCase())
                        ? word.charAt(0).toUpperCase() + word.slice(1)
                        : word.toLowerCase()
                )
                .join(' ');

        const displayCouple = coupleNames ? toTitle(coupleNames) : 'Wedding Speech';
        const displaySpeaker = speakerName ? toTitle(speakerName) : null;

        setDownloading(true);
        try {
            const FONT = 'Georgia';
            const GOLD = 'b8860b';   // DarkGoldenrod — rich, legible on screen and print
            const DARK = '1a1a1a';
            const GREY = '888888';

            const paragraphs: Paragraph[] = [];

            // ── Brand header: VERBO ──
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'VERBO',
                            font: FONT,
                            size: 18,       // 9pt
                            color: GOLD,
                            characterSpacing: 300,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 600, after: 120 },  // generous top breathing room
                })
            );

            // ── Gold rule ──
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '────────────────────────────────────────',
                            font: FONT,
                            size: 14,
                            color: GOLD,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 640 },  // big gap before title
                })
            );

            // ── Couple names (main title) ──
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: displayCouple,
                            font: FONT,
                            size: 40,
                            bold: true,
                            color: DARK,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 160 },
                })
            );

            // ── Speaker byline ──
            if (displaySpeaker) {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: displaySpeaker,
                                font: FONT,
                                size: 20,
                                italics: true,
                                color: GREY,
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 360 },
                    })
                );
            }

            // ── Gold ornament separator ──
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '— ✦ —',
                            font: FONT,
                            size: 22,
                            color: GOLD,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 560 },
                })
            );

            // ── Speech body ──
            const lines = speech.split('\n');
            for (const line of lines) {
                const isEmpty = line.trim() === '';
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                font: FONT,
                                size: 24,   // 12pt
                                color: DARK,
                            }),
                        ],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: {
                            line: 340,
                            after: isEmpty ? 0 : 200,
                        },
                    })
                );
            }

            // ── Bottom spacer ──
            paragraphs.push(new Paragraph({ text: '', spacing: { before: 480 } }));

            // ── Gold rule footer ──
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '────────────────────────────────────────',
                            font: FONT,
                            size: 14,
                            color: GOLD,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                })
            );

            // ── Brand footer ──
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Creado con Verbo',
                            font: FONT,
                            size: 16,
                            italics: true,
                            color: GOLD,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                })
            );

            const doc = new Document({
                sections: [
                    {
                        properties: {
                            page: {
                                margin: {
                                    top: 1440,      // 2.5 cm
                                    bottom: 1440,
                                    left: 1800,     // 3.2 cm
                                    right: 1800,
                                },
                            },
                        },
                        children: paragraphs,
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = coupleNames
                ? `verbo-speech-${coupleNames.replace(/\s+/g, '-').toLowerCase()}.docx`
                : 'verbo-speech.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="result-container animate-fade-in">
            <div className="result-header">
                <h2 className="result-title">{t('title')}</h2>
                <div className="result-actions">
                    <button className="btn-icon" onClick={handleCopy}>
                        {copied ? t('copied') : t('copy')}
                    </button>
                    <button className="btn-icon" onClick={handleDownload} disabled={downloading}>
                        {downloading ? '...' : t('download')}
                    </button>
                    <button className="btn-icon" onClick={onRegenerate} disabled={isLoading}>
                        {t('regenerate')}
                    </button>
                    <button className="btn-icon" onClick={onNewSpeech}>
                        {t('newSpeech')}
                    </button>
                </div>
            </div>

            <div className="result-text">{speech}</div>

            <div className="result-tip">
                {t('tip')}
            </div>
        </div>
    );
}
