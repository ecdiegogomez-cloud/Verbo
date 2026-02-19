'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface SpeechFormProps {
    onGenerate: (data: FormData) => void;
    isLoading: boolean;
}

interface FormData {
    relationship: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    duration: string;
    speechLang: string;
}

export default function SpeechForm({ onGenerate, isLoading }: SpeechFormProps) {
    const t = useTranslations('generator');

    const [form, setForm] = useState<FormData>({
        relationship: '',
        coupleNames: '',
        speakerName: '',
        tone: '',
        duration: 'medium',
        speechLang: 'en',
    });

    const roles = ['bestMan', 'maidOfHonor', 'father', 'mother', 'sibling', 'friend', 'other'];
    const tones = ['heartfelt', 'funny', 'formal', 'mix', 'witty', 'straightforward', 'celebratory'];
    const durations = ['short', 'medium', 'long'];
    const speechLangs = ['en', 'es'];

    const handleChange = (field: keyof FormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(form);
    };

    const isValid = form.relationship && form.coupleNames.trim() && form.tone;

    return (
        <form className="speech-form" onSubmit={handleSubmit}>
            {/* Relationship */}
            <div className="form-group">
                <label className="form-label">{t('relationshipLabel')}</label>
                <select
                    className="form-select"
                    value={form.relationship}
                    onChange={(e) => handleChange('relationship', e.target.value)}
                >
                    <option value="">{t('relationshipPlaceholder')}</option>
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {t(`roles.${role}`)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Couple Names */}
            <div className="form-group">
                <label className="form-label">{t('coupleNamesLabel')}</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder={t('coupleNamesPlaceholder')}
                    value={form.coupleNames}
                    onChange={(e) => handleChange('coupleNames', e.target.value)}
                />
            </div>

            {/* Speaker Name */}
            <div className="form-group">
                <label className="form-label">{t('speakerNameLabel')}</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder={t('speakerNamePlaceholder')}
                    value={form.speakerName}
                    onChange={(e) => handleChange('speakerName', e.target.value)}
                />
            </div>

            {/* Tone */}
            <div className="form-group">
                <label className="form-label">{t('toneLabel')}</label>
                <div className="form-radio-group">
                    {tones.map((tone) => (
                        <div key={tone} className="radio-option">
                            <input
                                type="radio"
                                id={`tone-${tone}`}
                                name="tone"
                                value={tone}
                                checked={form.tone === tone}
                                onChange={(e) => handleChange('tone', e.target.value)}
                            />
                            <label htmlFor={`tone-${tone}`} className="radio-label">
                                {t(`tones.${tone}`)}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Duration + Speech Language */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">{t('durationLabel')}</label>
                    <div className="form-radio-group">
                        {durations.map((dur) => (
                            <div key={dur} className="radio-option">
                                <input
                                    type="radio"
                                    id={`dur-${dur}`}
                                    name="duration"
                                    value={dur}
                                    checked={form.duration === dur}
                                    onChange={(e) => handleChange('duration', e.target.value)}
                                />
                                <label htmlFor={`dur-${dur}`} className="radio-label">
                                    {t(`durations.${dur}`)}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">{t('speechLangLabel')}</label>
                    <div className="form-radio-group">
                        {speechLangs.map((lang) => (
                            <div key={lang} className="radio-option">
                                <input
                                    type="radio"
                                    id={`lang-${lang}`}
                                    name="speechLang"
                                    value={lang}
                                    checked={form.speechLang === lang}
                                    onChange={(e) => handleChange('speechLang', e.target.value)}
                                />
                                <label htmlFor={`lang-${lang}`} className="radio-label">
                                    {t(`speechLangs.${lang}`)}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="btn-generate"
                disabled={!isValid || isLoading}
            >
                {isLoading ? t('generating') : t('generate')}
            </button>
        </form>
    );
}
