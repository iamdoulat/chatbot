import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { useSettings } from '@/lib/settings-context';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatAreaProps {
    selectedModel: string;
}

export function ChatArea({ selectedModel }: ChatAreaProps) {
    const { settings } = useSettings();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Hello! I'm ready to help you using **${selectedModel}**. How can I assist you today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update welcome message when model changes
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === 'assistant') {
            setMessages([{ role: 'assistant', content: `Hello! I'm ready to help you using **${selectedModel}**. How can I assist you today?` }]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedModel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-gemini-key': settings.apiKeys.gemini || '',
                    'x-openai-key': settings.apiKeys.openai || '',
                    'x-anthropic-key': settings.apiKeys.anthropic || '',
                    'x-openrouter-key': settings.apiKeys.openrouter || ''
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    model: selectedModel
                })
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const assistantMessage: Message = { role: 'assistant', content: data.content };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex w-full gap-4 p-6 bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-3xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={`Message ${selectedModel}...`}
                                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl pl-4 pr-32 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                disabled={isLoading}
                            />
                            <div className="absolute right-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <button
                                    type="button"
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <Mic size={20} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-xs text-gray-400">
                                AI can make mistakes. Consider checking important information.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
