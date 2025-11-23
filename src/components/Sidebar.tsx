import React from 'react';
import { MessageSquare, Settings, Plus, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

const models = [
  { id: 'gemini', name: 'Gemini', icon: Bot },
  { id: 'gpt-4', name: 'GPT-4', icon: MessageSquare },
  { id: 'claude-3', name: 'Claude 3', icon: MessageSquare },
  { id: 'openrouter', name: 'OpenRouter', icon: MessageSquare },
  { id: 'grok', name: 'Grok', icon: MessageSquare },
  { id: 'deepseek', name: 'DeepSeek', icon: MessageSquare },
  { id: 'mistral', name: 'Mistral', icon: MessageSquare },
];

export function Sidebar({ selectedModel, onSelectModel, onNewChat, onOpenSettings }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full border-r border-gray-800">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
            Models
          </h3>
          <div className="space-y-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors",
                  selectedModel === model.id
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                )}
              >
                <model.icon size={18} />
                <span className="text-sm font-medium">{model.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors px-2 py-2"
        >
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
}
