'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface SpeechFormProps {
    onGenerate: (data: FormData) => void;
    isLoading: boolean;
}

interface FormData {
    relationship: string;
    relationshipTarget: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    duration: string;
    speechLang: string;
}

function parseNames(coupleNames: string): [string, string] | null {
    const trimmed = coupleNames.trim();
    if (!trimmed) return null;
    const separators = /\s+(?:&|y|and)\s+/i;
    const parts = trimmed.split(separators).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
        return [parts[0], parts[1]];
    }
    return null;
}

export default function SpeechForm({ onGenerate, isLoading }: SpeechFormProps) {
    const t = useTranslations('generator');

    const [form, setForm] = useState<FormData>({
        relationship: '',
        relationshipTarget: '',
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

    const parsedNames = useMemo(() => parseNames(form.coupleNames), [form.coupleNames]);
    const showTarget = !!form.relationship && parsedNames !== null;

    const handleChange = (field: keyof FormData, value: string) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            // Clear relationshipTarget if names become unparseable or relationship cleared
            if (field === 'coupleNames' || field === 'relationship') {
                const names = field === 'coupleNames' ? parseNames(value) : parsedNames;
                const rel = field === 'relationship' ? value : prev.relationship;
                if (!rel || !names) {
                    next.relationshipTarget = '';
                } else if (names && prev.relationshipTarget &&
                    prev.relationshipTarget !== names[0] && prev.relationshipTarget !== names[1]) {
                    // Names changed, old target no longer matches
                    next.relationshipTarget = '';
                }
            }
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(form);
    };

    const needsTarget = showTarget;
    const isValid = form.relationship && form.coupleNames.trim() && form.tone &&
        (!needsTarget || form.relationshipTarget);

    return (
        <form className="speech-form" onSubmit={handleSubmit}>
            {/* Section: About You */}
            <fieldset className="form-section">
                <legend className="form-section-title">{t('sectionAboutYou')}</legend>

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

                {/* Relationship Target — conditional */}
                <div className={`field-reveal ${showTarget ? 'field-reveal--visible' : ''}`}>
                    {showTarget && parsedNames && (
                        <div className="form-group">
                            <label className="form-label">
                                {t('relationshipTargetLabel', { role: t(`roles.${form.relationship}`) })}
                            </label>
                            <p className="form-hint">{t('relationshipTargetHint')}</p>
                            <div className="relationship-target-group">
                                {parsedNames.map((name) => (
                                    <div key={name} className="relationship-target-option">
                                        <input
                                            type="radio"
                                            id={`target-${name}`}
                                            name="relationshipTarget"
                                            value={name}
                                            checked={form.relationshipTarget === name}
                                            onChange={(e) => handleChange('relationshipTarget', e.target.value)}
                                        />
                                        <label htmlFor={`target-${name}`} className="relationship-target-label">
                                            {name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
            </fieldset>

            {/* Section: Your Speech */}
            <fieldset className="form-section">
                <legend className="form-section-title">{t('sectionYourSpeech')}</legend>

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
            </fieldset>

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
