'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChatMessage, MAX_AI_TURNS, transcriptToAnecdotes } from '@/lib/interview-prompts';

interface InterviewFormData {
    relationship: string;
    relationshipTarget: string;
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
        <div className="clean-interview">
            {/* Progreso minimalista - sin números */}
            <div className="clean-progress">
                <div className="clean-progress-line">
                    <div className="clean-progress-fill"
                        style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Mensajes */}
            <div className="clean-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className="clean-message">
                        {msg.role === 'model' ? (
                            <div className="clean-message-ai-wrapper">
                                <div className="clean-avatar">V</div>
                                <div className="clean-message-content clean-message-ai">
                                    {msg.content}
                                </div>
                            </div>
                        ) : (
                            <div className="clean-message-content clean-message-user">
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {isAiTyping && messages[messages.length - 1]?.content === '' && (
                    <div className="clean-message">
                        <div className="clean-message-ai-wrapper">
                            <div className="clean-avatar">V</div>
                            <div className="clean-typing">
                                <span>.</span>
                                <span>.</span>
                                <span>.</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Typing indicator when AI hasn't added a message yet */}
                {isAiTyping && messages.length === 0 && (
                    <div className="clean-message">
                        <div className="clean-message-ai-wrapper">
                            <div className="clean-avatar">V</div>
                            <div className="clean-typing">
                                <span>.</span>
                                <span>.</span>
                                <span>.</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="clean-error">
                    {error}
                    <button className="clean-retry" onClick={() => fetchAiResponse(messages)}>
                        {t('retry')}
                    </button>
                </div>
            )}

            {/* Input o CTA */}
            {isComplete ? (
                <div className="clean-complete">
                    <button className="clean-complete-btn" onClick={handleComplete}>
                        {t('continueButton')}
                    </button>
                </div>
            ) : (
                <div className="clean-input-wrapper">
                    <textarea
                        ref={inputRef}
                        className="clean-input"
                        placeholder={t('inputPlaceholder')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isAiTyping}
                        rows={2}
                    />
                    <button
                        className="clean-send-btn"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isAiTyping}
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}
