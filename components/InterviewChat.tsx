'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChatMessage, MAX_AI_TURNS, transcriptToAnecdotes } from '@/lib/interview-prompts';

interface InterviewFormData {
    relationship: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    duration: string;
    speechLang: string;
}

interface InterviewChatProps {
    formData: InterviewFormData;
    onComplete: (transcript: string) => void;
}

export default function InterviewChat({ formData, onComplete }: InterviewChatProps) {
    const t = useTranslations('interview');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState('');
    const [aiTurnCount, setAiTurnCount] = useState(0);
    const aiTurnCountRef = useRef(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const hasStarted = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isAiTyping]);

    const fetchAiResponse = useCallback(
        async (currentMessages: ChatMessage[]) => {
            setIsAiTyping(true);
            setError('');

            try {
                const response = await fetch('/api/interview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: currentMessages, formData }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Interview request failed');
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error('No response stream');

                const decoder = new TextDecoder();
                let aiText = '';

                // Add a placeholder AI message to stream into
                setMessages((prev) => [...prev, { role: 'model', content: '' }]);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    aiText += chunk;

                    setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'model', content: aiText };
                        return updated;
                    });
                }

                aiTurnCountRef.current += 1;
                setAiTurnCount(aiTurnCountRef.current);

                // Mark as complete after the last AI turn
                if (aiTurnCountRef.current >= MAX_AI_TURNS) {
                    setIsComplete(true);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
                // Remove the empty placeholder if it was added
                setMessages((prev) =>
                    prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev
                );
            } finally {
                setIsAiTyping(false);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        },
        [formData]
    );

    // Kick off the first question on mount
    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        fetchAiResponse([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSend = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isAiTyping || isComplete) return;

        const userMessage: ChatMessage = { role: 'user', content: trimmed };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue('');

        await fetchAiResponse(newMessages);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleComplete = () => {
        onComplete(transcriptToAnecdotes(messages));
    };

    const currentQuestion = Math.max(1, aiTurnCount);
    const totalQuestions = MAX_AI_TURNS;

    return (
        <div className="interview-chat">
            {/* Progress bar */}
            <div className="interview-progress">
                <span className="interview-progress-label">
                    {t('progress', { current: Math.min(currentQuestion, totalQuestions), total: totalQuestions })}
                </span>
                <div className="interview-progress-bar">
                    <div
                        className="interview-progress-fill"
                        style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Message bubbles */}
            <div className="interview-messages">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`interview-bubble-wrap ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}
                    >
                        {msg.role === 'model' && (
                            <div className="bubble-avatar">V</div>
                        )}
                        <div className={`interview-bubble ${msg.role === 'user' ? 'bubble-user-inner' : 'bubble-ai-inner'}`}>
                            {msg.content || (isAiTyping && idx === messages.length - 1 ? (
                                <span className="typing-dots">
                                    <span />
                                    <span />
                                    <span />
                                </span>
                            ) : null)}
                        </div>
                    </div>
                ))}

                {/* Typing indicator when AI hasn't added a bubble yet */}
                {isAiTyping && messages.length === 0 && (
                    <div className="interview-bubble-wrap bubble-ai">
                        <div className="bubble-avatar">V</div>
                        <div className="interview-bubble bubble-ai-inner">
                            <span className="typing-dots">
                                <span />
                                <span />
                                <span />
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="interview-error">
                    {error}
                    <button
                        className="interview-retry"
                        onClick={() => fetchAiResponse(messages)}
                    >
                        {t('retry')}
                    </button>
                </div>
            )}

            {/* Input area or Complete CTA */}
            {isComplete ? (
                <div className="interview-complete">
                    <button className="btn-generate interview-cta" onClick={handleComplete}>
                        {t('continueButton')}
                    </button>
                </div>
            ) : (
                <div className="interview-input-row">
                    <textarea
                        ref={inputRef}
                        className="interview-input"
                        placeholder={t('inputPlaceholder')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isAiTyping}
                        rows={2}
                    />
                    <button
                        className="interview-send"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isAiTyping}
                        aria-label={t('send')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
