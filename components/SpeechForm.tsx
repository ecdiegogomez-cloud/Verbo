'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
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

interface ChatMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
}

type ChatStep = 'relationship' | 'coupleNames' | 'relationshipTarget' | 'speakerName' | 'tone' | 'duration' | 'language' | 'complete';

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

    const [currentStep, setCurrentStep] = useState<ChatStep>('relationship');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showOptions, setShowOptions] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const roles = ['bestMan', 'maidOfHonor', 'father', 'mother', 'sibling', 'friend', 'other'];
    const tones = ['heartfelt', 'funny', 'formal', 'mix', 'witty', 'straightforward', 'celebratory'];
    const durations = ['short', 'medium', 'long'];
    const speechLangs = ['en', 'es'];

    const parsedNames = useMemo(() => parseNames(form.coupleNames), [form.coupleNames]);
    const showTargetStep = form.relationship && parsedNames !== null;

    const steps: ChatStep[] = ['relationship', 'coupleNames'];
    if (showTargetStep) steps.push('relationshipTarget');
    steps.push('speakerName', 'tone', 'duration', 'language', 'complete');

    const currentStepIndex = steps.indexOf(currentStep);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showOptions]);

    useEffect(() => {
        if (showOptions && (currentStep === 'coupleNames' || currentStep === 'speakerName')) {
            inputRef.current?.focus();
        }
    }, [showOptions, currentStep]);

    const addMessage = (role: 'assistant' | 'user', content: string) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString() + Math.random(),
            role,
            content,
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleRelationshipSelect = (value: string) => {
        addMessage('user', t(`roles.${value}`));
        setForm((prev) => ({ ...prev, relationship: value }));
        setCurrentStep('coupleNames');
        setShowOptions(false);
        setTimeout(() => setShowOptions(true), 300);
    };

    const handleCoupleNamesSubmit = () => {
        if (parsedNames) {
            addMessage('user', form.coupleNames);
            setCurrentStep(showTargetStep ? 'relationshipTarget' : 'speakerName');
            setShowOptions(false);
            setTimeout(() => setShowOptions(true), 300);
        }
    };

    const handleRelationshipTargetSelect = (value: string) => {
        addMessage('user', value);
        setForm((prev) => ({ ...prev, relationshipTarget: value }));
        setCurrentStep('speakerName');
        setShowOptions(false);
        setTimeout(() => setShowOptions(true), 300);
    };

    const handleSpeakerNameSubmit = () => {
        if (inputValue.trim()) {
            addMessage('user', inputValue);
            setForm((prev) => ({ ...prev, speakerName: inputValue }));
            setCurrentStep('tone');
            setInputValue('');
            setShowOptions(false);
            setTimeout(() => setShowOptions(true), 300);
        }
    };

    const handleToneSelect = (value: string) => {
        addMessage('user', t(`tones.${value}`));
        setForm((prev) => ({ ...prev, tone: value }));
        setCurrentStep('duration');
        setShowOptions(false);
        setTimeout(() => setShowOptions(true), 300);
    };

    const handleDurationSelect = (value: string) => {
        addMessage('user', t(`durations.${value}`));
        setForm((prev) => ({ ...prev, duration: value }));
        setCurrentStep('language');
        setShowOptions(false);
        setTimeout(() => setShowOptions(true), 300);
    };

    const handleLanguageSelect = (value: string) => {
        addMessage('user', t(`speechLangs.${value}`));
        setForm((prev) => ({ ...prev, speechLang: value }));
        setCurrentStep('complete');
        setShowOptions(false);
        setTimeout(() => setShowOptions(true), 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(form);
    };

    const getAssistantMessage = (): string => {
        switch (currentStep) {
            case 'relationship':
                return t('chatQuestionRole');
            case 'coupleNames':
                return t('chatQuestionCouple');
            case 'relationshipTarget':
                return t('chatQuestionTarget', {
                    role: t(`roles.${form.relationship}`),
                    name1: parsedNames?.[0] || '',
                    name2: parsedNames?.[1] || '',
                });
            case 'speakerName':
                return t('chatQuestionSpeaker');
            case 'tone':
                return t('chatQuestionTone');
            case 'duration':
                return t('chatQuestionDuration');
            case 'language':
                return t('chatQuestionLanguage');
            case 'complete':
                return t('chatQuestionComplete', { name: form.speakerName || '' });
            default:
                return '';
        }
    };

    return (
        <div className="chat-form-container">
            <form className="chat-form" onSubmit={handleSubmit}>
                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message-bubble ${msg.role === 'assistant' ? 'assistant' : 'user'}`}
                        >
                            {msg.content}
                        </div>
                    ))}

                    {/* Current assistant message */}
                    <div className="chat-message-bubble assistant">
                        {getAssistantMessage()}
                    </div>

                    {/* Show options after assistant message */}
                    {showOptions && currentStep === 'relationship' && (
                        <div className="chat-options-bubbles">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    className="chat-option-bubble"
                                    onClick={() => handleRelationshipSelect(role)}
                                >
                                    {t(`roles.${role}`)}
                                </button>
                            ))}
                        </div>
                    )}

                    {showOptions && currentStep === 'coupleNames' && (
                        <div className="chat-input-wrapper">
                            <input
                                ref={inputRef}
                                type="text"
                                className="chat-input-field"
                                placeholder={t('chatPlaceholderCouple')}
                                value={form.coupleNames}
                                onChange={(e) => setForm((prev) => ({ ...prev, coupleNames: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCoupleNamesSubmit();
                                }}
                            />
                            <button
                                type="button"
                                className="chat-send-button"
                                onClick={handleCoupleNamesSubmit}
                                disabled={!parsedNames}
                            >
                                {t('chatContinue')}
                            </button>
                        </div>
                    )}

                    {showOptions && currentStep === 'relationshipTarget' && parsedNames && (
                        <div className="chat-options-bubbles">
                            {parsedNames.map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    className="chat-option-bubble"
                                    onClick={() => handleRelationshipTargetSelect(name)}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}

                    {showOptions && currentStep === 'speakerName' && (
                        <div className="chat-input-wrapper">
                            <input
                                ref={inputRef}
                                type="text"
                                className="chat-input-field"
                                placeholder={t('chatPlaceholderSpeaker')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSpeakerNameSubmit();
                                }}
                            />
                            <button
                                type="button"
                                className="chat-send-button"
                                onClick={handleSpeakerNameSubmit}
                                disabled={!inputValue.trim()}
                            >
                                {t('chatContinue')}
                            </button>
                        </div>
                    )}

                    {showOptions && currentStep === 'tone' && (
                        <div className="chat-options-bubbles">
                            {tones.map((tone) => (
                                <button
                                    key={tone}
                                    type="button"
                                    className="chat-option-bubble"
                                    onClick={() => handleToneSelect(tone)}
                                >
                                    {t(`tones.${tone}`)}
                                </button>
                            ))}
                        </div>
                    )}

                    {showOptions && currentStep === 'duration' && (
                        <div className="chat-options-bubbles">
                            {durations.map((dur) => (
                                <button
                                    key={dur}
                                    type="button"
                                    className="chat-option-bubble"
                                    onClick={() => handleDurationSelect(dur)}
                                >
                                    {t(`durations.${dur}`)}
                                </button>
                            ))}
                        </div>
                    )}

                    {showOptions && currentStep === 'language' && (
                        <div className="chat-options-bubbles">
                            {speechLangs.map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    className="chat-option-bubble"
                                    onClick={() => handleLanguageSelect(lang)}
                                >
                                    {t(`speechLangs.${lang}`)}
                                </button>
                            ))}
                        </div>
                    )}

                    {showOptions && currentStep === 'complete' && (
                        <button
                            type="submit"
                            className="chat-submit-final"
                            disabled={isLoading}
                        >
                            {isLoading ? t('generating') : t('chatStartInterview')}
                        </button>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </form>
        </div>
    );
}
