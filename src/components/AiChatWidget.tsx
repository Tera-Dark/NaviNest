import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Settings, Send, Bot, User, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import config from '../data/config.json';
import { useTranslation } from '../hooks/useTranslation';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiChatWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(config.aiConfig.baseUrl);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize greeting on mount/lang change
    if (messages.length === 0) {
        setMessages([{ role: 'assistant', content: t('aiGreeting') }]);
    }
  }, [t]);

  useEffect(() => {
    const storedKey = localStorage.getItem('navinest_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSaveSettings = () => {
    localStorage.setItem('navinest_api_key', apiKey);
    setShowSettings(false);
  };

  const processBaseUrl = (url: string) => {
      // Remove trailing slash if present to avoid double slashes
      const cleanUrl = url.replace(/\/$/, '');
      if (!cleanUrl.endsWith('/v1')) {
          return `${cleanUrl}/v1`;
      }
      return cleanUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: t('aiApiKeyMissing') }]);
        return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
        const finalBaseUrl = processBaseUrl(baseUrl);
        const response = await fetch(`${finalBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: config.aiConfig.model,
                messages: [
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: userMessage }
                ],
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    const data = line.trim().slice(6);
                    if (data === '[DONE]') break;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content || '';
                        assistantMessage += content;
                        
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1].content = assistantMessage;
                            return newMessages;
                        });
                    } catch (e) {
                        console.error('Error parsing stream', e);
                    }
                }
            }
        }

    } catch (error: any) {
        setMessages(prev => [...prev, { role: 'assistant', content: t('aiError') }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!config.aiConfig.enabled) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 w-[90vw] sm:w-96 h-[60vh] sm:h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
            <div className="p-4 bg-indigo-600 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                    <Bot size={20} />
                    <span className="font-semibold">{t('aiAssistant')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-indigo-500 rounded transition-colors">
                        <Settings size={18} />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-indigo-500 rounded transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Settings or Chat */}
            {showSettings ? (
                <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">{t('settings')}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('apiKey')}</label>
                            <input 
                                type="password" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="sk-..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Stored locally in your browser.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('baseUrl')}</label>
                            <input 
                                type="text" 
                                value={baseUrl} 
                                disabled
                                className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Configured in config.json</p>
                        </div>
                        <button 
                            onClick={handleSaveSettings}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            {t('saveAndReturn')}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    msg.role === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                                )}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={clsx(
                                    "p-3 rounded-2xl max-w-[80%] text-sm break-words",
                                    msg.role === 'user' 
                                        ? "bg-indigo-600 text-white rounded-br-none" 
                                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('typeMessage')}
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40 hover:bg-indigo-700 hover:scale-105 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </>
  );
};
