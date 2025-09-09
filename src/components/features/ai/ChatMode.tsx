import React, { useState, useRef, useEffect } from 'react';
import QuickAIActions from './QuickAIActions';
import CreativeBriefCard from './CreativeBriefCard';
import { Sparkles } from '../../ui/Icons';
import Button from '../../ui/Button';
// FIX: Corrected import path for types to point to the new single source of truth.
import { AppContextState, CreativeBrief, ContextualSuggestion } from '../../../types/index';
import { useProfile } from '../../../store/profileContext';
import { aiService } from '../../../services/aiService';

type MessageStatus = 'idle' | 'researching' | 'briefing' | 'writing';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text?: string;
  brief?: CreativeBrief; // New: for the creative brief
  status?: MessageStatus; // For loading states
}

interface ChatModeProps {
  appContext: AppContextState;
}

const ChatMode: React.FC<ChatModeProps> = ({ appContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState<MessageStatus>('idle');
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  useEffect(() => {
    // Set initial contextual message
    let initialMessage = '¡Hola! 👋 Soy Orbit, tu asistente de marketing. ¿En qué puedo ayudarte hoy?';
    if (appContext.entityName) {
        if (appContext.page === 'Customers') {
             initialMessage = `¡Hola! Veo que estás en el perfil de ${appContext.entityName}. ¿Necesitas ayuda con algo relacionado a este cliente?`;
        } else {
             initialMessage = `Veo que estás trabajando en "${appContext.entityName}". ¿Cómo puedo ayudarte?`;
        }
    } else if (appContext.page !== 'Dashboard') {
        initialMessage = `¡Hola! ¿Necesitas ayuda con la sección de ${appContext.page}?`;
    }
    setMessages([{ id: 1, sender: 'ai', text: initialMessage }]);
    setHasInteracted(false); // Reset interaction state on context change
  }, [appContext]);

  useEffect(() => {
    if (!profile) return;
    const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const result = await aiService.generateContextualSuggestions(appContext, profile);
            setSuggestions(result);
        } catch (e) {
            console.error("Failed to load AI suggestions", e);
            setSuggestions([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };
    fetchSuggestions();
  }, [appContext, profile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isAiTyping]);

  const addMessage = (sender: 'user' | 'ai', text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), sender, text }]);
  };

  const handleSend = () => {
    if (input.trim() === '' || !profile) return;
    const userMessage = input;
    addMessage('user', userMessage);
    setInput('');
    processCommand(userMessage);
    setHasInteracted(true);
  };
  
  const handleQuickAction = (prompt: string) => {
    addMessage('user', prompt);
    processCommand(prompt);
    setHasInteracted(true);
  };

  const processCommand = async (command: string) => {
    if (!profile) return;
    setIsAiTyping('researching');
    try {
      const brief = await aiService.getCreativeBrief(command, profile, appContext);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', brief }]);
      setIsAiTyping('briefing');
    } catch (error) {
      console.error(error);
      addMessage('ai', 'Lo siento, tuve un problema al investigar esa solicitud. Por favor, inténtalo de nuevo.');
      setIsAiTyping('idle');
    }
  };

  const handleGenerateFromBrief = async (brief: CreativeBrief) => {
    if (!profile) return;
    setIsAiTyping('writing');
    try {
        const finalContent = await aiService.generatePostFromBrief(brief, profile, appContext);
        addMessage('ai', finalContent);
    } catch (error) {
        console.error(error);
        addMessage('ai', 'Tuve un problema al generar el contenido final. Inténtalo de nuevo.');
    } finally {
        setIsAiTyping('idle');
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary-500" />
              </div>
            )}
            <div className={`max-w-[85%] p-3 rounded-2xl animate-slide-up ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
              {msg.brief && <CreativeBriefCard brief={msg.brief} onGenerate={handleGenerateFromBrief} />}
            </div>
          </div>
        ))}
        {isAiTyping !== 'idle' && (
             <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                </div>
                <div className="max-w-[85%] p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                    {isAiTyping === 'researching' && <p className="text-sm italic">Investigando tendencias y analizando tu marca...</p>}
                    {isAiTyping === 'writing' && <p className="text-sm italic">Redactando el contenido final...</p>}
                    {(isAiTyping === 'researching' || isAiTyping === 'writing') && <div className="ai-typing-indicator"><span></span><span></span><span></span></div>}
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t dark:border-gray-700">
        {!hasInteracted && (
          <QuickAIActions
            actions={suggestions}
            onActionClick={handleQuickAction}
            isLoading={isLoadingSuggestions}
          />
        )}
        <div className={`flex items-center space-x-2 ${!hasInteracted ? 'mt-2' : ''}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pide a la IA que cree contenido..."
            disabled={isAiTyping !== 'idle'}
            className="flex-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
          />
          <Button onClick={handleSend} className="rounded-full !p-2 w-10 h-10" disabled={isAiTyping !== 'idle'}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMode;