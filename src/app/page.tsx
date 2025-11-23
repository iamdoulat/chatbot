'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('gemini');

  const handleNewChat = () => {
    // Logic to reset chat state would go here
    console.log('New Chat');
    window.location.reload(); // Simple reset for now
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <Sidebar
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onNewChat={handleNewChat}
      />
      <main className="flex-1 h-full relative">
        <ChatArea selectedModel={selectedModel} />
      </main>
    </div>
  );
}
