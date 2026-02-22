'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FormData {
    relationship: string;
    relationshipTarget: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    duration: string;
    speechLang: string;
}

interface ConversationalFormProps {
    onGenerate: (data: FormData) => void;
    isLoading: boolean;
    locale: string;
}

function parseNames(s: string): [string, string] | null {
    const parts = s.trim().split(/\s*(?:&|y|and|,)\s*/i).filter(Boolean);
    return parts.length === 2 ? [parts[0], parts[1]] : null;
}

export default function ConversationalForm({ onGenerate, isLoading, locale }: ConversationalFormProps) {
    const t = useTranslations('generator');
    const lang = locale as 'en' | 'es';

    const [form, setForm] = useState<FormData>({
        relationship: '',
        relationshipTarget: '',
        coupleNames: '',
        speakerName: '',
        tone: '',
        duration: 'medium',
        speechLang: locale,
    });

    const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const parsedNames = parseNames(form.coupleNames);
    const showTarget = !!form.relationship && parsedNames !== null;

    const isValid =
        form.relationship &&
        form.coupleNames &&
        form.speakerName &&
        form.tone &&
        form.duration &&
        form.speechLang &&
        (!showTarget || form.relationshipTarget);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        onGenerate(form);
    };

    const roles = [
        { id: 'bestMan', en: 'Best Man', es: 'Padrino' },
        { id: 'maidOfHonor', en: 'Maid of Honor', es: 'Dama de Honor' },
        { id: 'father', en: 'Father', es: 'Padre' },
        { id: 'mother', en: 'Mother', es: 'Madre' },
        { id: 'sibling', en: 'Sibling', es: 'Hermano/a' },
        { id: 'friend', en: 'Close Friend', es: 'Amigo/a' },
        { id: 'other', en: 'Guest', es: 'Invitado/a' },
    ];

    const tones = [
        { id: 'heartfelt', en: 'Heartfelt', es: 'Emotivo' },
        { id: 'funny', en: 'Light & Fun', es: 'Ligero' },
        { id: 'formal', en: 'Elegant', es: 'Elegante' },
        { id: 'mix', en: 'Balanced', es: 'Equilibrado' },
        { id: 'witty', en: 'Witty', es: 'Ingenioso' },
        { id: 'straightforward', en: 'Simple', es: 'Directo' },
    ];

    const durations = [
        { id: 'short', en: '~2 min', es: '~2 min' },
        { id: 'medium', en: '~4 min', es: '~4 min' },
        { id: 'long', en: '~6 min', es: '~6 min' },
    ];

    const languages = [
        { id: 'en', en: 'English', es: 'Inglés' },
        { id: 'es', en: 'Spanish', es: 'Español' },
    ];

    return (
        <form className="speech-form" onSubmit={handleSubmit} noValidate>

            {/* Section 1 — About You */}
            <fieldset className="form-section">
                <div className="form-section-title">
                    {lang === 'es' ? 'Sobre ti' : 'About You'}
                </div>

                {/* Role */}
                <div className="form-group">
                    <label className="form-label">{t('relationshipLabel')}</label>
                    <select
                        className="form-select"
                        value={form.relationship}
                        onChange={set('relationship')}
                        required
                    >
                        <option value="" disabled>{t('relationshipPlaceholder')}</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r[lang]}</option>
                        ))}
                    </select>
                </div>

                {/* Couple names */}
                <div className="form-group">
                    <label className="form-label">{t('coupleNamesLabel')}</label>
                    <input
                        className="form-input"
                        type="text"
                        value={form.coupleNames}
                        onChange={set('coupleNames')}
                        placeholder={t('coupleNamesPlaceholder')}
                        required
                    />
                </div>

                {/* Relationship target — only when two names are parsed */}
                {showTarget && parsedNames && (
                    <div className="form-group">
                        <label className="form-label">{t('relationshipTargetHint')}</label>
                        <div className="form-radio-group">
                            {parsedNames.map(name => (
                                <label key={name} className="radio-option">
                                    <input
                                        type="radio"
                                        name="relationshipTarget"
                                        value={name}
                                        checked={form.relationshipTarget === name}
                                        onChange={() => setForm(prev => ({ ...prev, relationshipTarget: name }))}
                                    />
                                    <span className="radio-label">{name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Speaker name */}
                <div className="form-group">
                    <label className="form-label">{t('speakerNameLabel')}</label>
                    <input
                        className="form-input"
                        type="text"
                        value={form.speakerName}
                        onChange={set('speakerName')}
                        placeholder={t('speakerNamePlaceholder')}
                        required
                    />
                </div>
            </fieldset>

            {/* Section 2 — Your Speech */}
            <fieldset className="form-section">
                <div className="form-section-title">
                    {lang === 'es' ? 'Tu discurso' : 'Your Speech'}
                </div>

                {/* Tone */}
                <div className="form-group">
                    <label className="form-label">{t('toneLabel')}</label>
                    <div className="form-radio-group">
                        {tones.map(tone => (
                            <label key={tone.id} className="radio-option">
                                <input
                                    type="radio"
                                    name="tone"
                                    value={tone.id}
                                    checked={form.tone === tone.id}
                                    onChange={() => setForm(prev => ({ ...prev, tone: tone.id }))}
                                />
                                <span className="radio-label">{tone[lang]}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Duration */}
                <div className="form-group">
                    <label className="form-label">{t('durationLabel')}</label>
                    <div className="form-radio-group">
                        {durations.map(d => (
                            <label key={d.id} className="radio-option">
                                <input
                                    type="radio"
                                    name="duration"
                                    value={d.id}
                                    checked={form.duration === d.id}
                                    onChange={() => setForm(prev => ({ ...prev, duration: d.id }))}
                                />
                                <span className="radio-label">{d[lang]}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Language */}
                <div className="form-group">
                    <label className="form-label">{t('speechLangLabel')}</label>
                    <div className="form-radio-group">
                        {languages.map(l => (
                            <label key={l.id} className="radio-option">
                                <input
                                    type="radio"
                                    name="speechLang"
                                    value={l.id}
                                    checked={form.speechLang === l.id}
                                    onChange={() => setForm(prev => ({ ...prev, speechLang: l.id }))}
                                />
                                <span className="radio-label">{l[lang]}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </fieldset>

            {/* Submit */}
            <button
                type="submit"
                className="btn-generate"
                disabled={!isValid || isLoading}
            >
                {t('generate')}
            </button>
        </form>
    );
}
