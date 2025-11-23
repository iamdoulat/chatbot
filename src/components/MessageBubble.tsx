import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div
            className={cn(
                "flex w-full gap-4 p-6",
                isUser ? "bg-transparent" : "bg-gray-50/50 dark:bg-gray-800/30"
            )}
        >
            <div className="flex-shrink-0">
                <div
                    className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isUser ? "bg-gray-200 dark:bg-gray-700" : "bg-blue-600"
                    )}
                >
                    {isUser ? (
                        <User size={18} className="text-gray-600 dark:text-gray-300" />
                    ) : (
                        <Bot size={18} className="text-white" />
                    )}
                </div>
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
