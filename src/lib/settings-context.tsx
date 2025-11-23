'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Settings {
    theme: 'dark' | 'light';
    apiKeys: {
        gemini: string;
        openai: string;
        anthropic: string;
        openrouter: string;
        grok: string;
        deepseek: string;
    };
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    updateApiKey: (provider: keyof Settings['apiKeys'], key: string) => void;
}

const defaultSettings: Settings = {
    theme: 'dark',
    apiKeys: {
        gemini: '',
        openai: '',
        anthropic: '',
        openrouter: '',
        grok: '',
        deepseek: '',
    },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('chatbot-settings');
        if (savedSettings) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
            } catch (e) {
                console.error('Failed to parse settings', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('chatbot-settings', JSON.stringify(settings));

            // Apply theme
            if (settings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [settings, isLoaded]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    const updateApiKey = (provider: keyof Settings['apiKeys'], key: string) => {
        setSettings((prev) => ({
            ...prev,
            apiKeys: { ...prev.apiKeys, [provider]: key },
        }));
    };

    if (!isLoaded) {
        return null; // Or a loading spinner
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, updateApiKey }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
