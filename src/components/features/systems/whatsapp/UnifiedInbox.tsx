import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { WhatsAppConversation, WhatsAppMessage } from '../../../../types/index';
import { Check, Search, PaperclipIcon, SendIcon } from '../../../ui/Icons';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';

const MOCK_CONVERSATIONS: WhatsAppConversation[] = [
    {
        id: 'convo-1',
        customerName: 'Jane Smith',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        lastMessage: '¡Perfecto, muchas gracias! Lo compro.',
        timestamp: '10:45 AM',
        unreadCount: 1,
        messages: [
            { id: 'msg-1-1', sender: 'user', content: 'Hola, ¿tienen stock del producto X?', timestamp: '10:40 AM', status: 'read' },
            { id: 'msg-1-2', sender: 'business', content: '¡Hola Jane! Sí, nos queda uno en stock.', timestamp: '10:42 AM', status: 'read' },
            { id: 'msg-1-3', sender: 'user', content: '¡Perfecto, muchas gracias! Lo compro.', timestamp: '10:45 AM', status: 'delivered' }
        ]
    },
    {
        id: 'convo-2',
        customerName: 'John Doe',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        lastMessage: '¿Podrían recordarme el horario del sábado?',
        timestamp: '9:30 AM',
        unreadCount: 0,
        messages: [
            { id: 'msg-2-1', sender: 'user', content: '¿Podrían recordarme el horario del sábado?', timestamp: '9:30 AM', status: 'read' }
        ]
    },
    {
        id: 'convo-3',
        customerName: 'Alice Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
        lastMessage: 'Gracias por la rápida respuesta.',
        timestamp: 'Ayer',
        unreadCount: 0,
        messages: [
            { id: 'msg-3-1', sender: 'business', content: 'Tu pedido ha sido enviado.', timestamp: 'Ayer', status: 'read' },
            { id: 'msg-3-2', sender: 'user', content: 'Gracias por la rápida respuesta.', timestamp: 'Ayer', status: 'read' }
        ]
    }
];


const UnifiedInbox: React.FC = () => {
    const [conversations, setConversations] = useState<WhatsAppConversation[]>(MOCK_CONVERSATIONS);
    const [activeConvoId, setActiveConvoId] = useState<string | null>(MOCK_CONVERSATIONS[0]?.id || null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConvoId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    useEffect(scrollToBottom, [activeConversation?.messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !activeConvoId) return;

        const message: WhatsAppMessage = {
            id: `msg-${Date.now()}`,
            sender: 'business',
            content: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
        };

        setConversations(prev => prev.map(convo => {
            if (convo.id === activeConvoId) {
                return {
                    ...convo,
                    messages: [...convo.messages, message],
                    lastMessage: newMessage,
                    timestamp: message.timestamp,
                }
            }
            return convo;
        }));
        setNewMessage('');
    };

    return (
        <div className="flex h-full">
            {/* Conversation List */}
            <div className="w-1/4 border-r dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="relative">
                        <Input placeholder="Buscar conversación..." className="pl-10"/>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(convo => (
                        <ConversationItem key={convo.id} convo={convo} isActive={convo.id === activeConvoId} onClick={() => setActiveConvoId(convo.id)} />
                    ))}
                </div>
            </div>

            {/* Message Panel */}
            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <>
                        <header className="p-4 border-b dark:border-gray-700 flex items-center">
                            <img src={activeConversation.avatar} alt={activeConversation.customerName} className="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">{activeConversation.customerName}</h3>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900/50">
                            {activeConversation.messages.map(msg => (
                                <MessageBubble key={msg.id} msg={msg} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" className="!p-2 rounded-full h-10 w-10"><PaperclipIcon className="w-5 h-5"/></Button>
                                <Input 
                                    placeholder="Escribe un mensaje..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button size="sm" className="!p-2 rounded-full h-10 w-10" onClick={handleSendMessage}><SendIcon className="w-5 h-5" /></Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                        <p className="text-gray-500">Selecciona una conversación para empezar a chatear.</p>
                    </div>
                )}
            </div>

            {/* Contextual Info Panel */}
            <div className="w-1/4 border-l dark:border-gray-700 p-4 overflow-y-auto">
                {activeConversation ? (
                    <div className="text-center">
                        <img src={activeConversation.avatar} alt={activeConversation.customerName} className="w-20 h-20 rounded-full mx-auto" />
                        <h3 className="font-bold text-lg mt-3">{activeConversation.customerName}</h3>
                        <p className="text-sm text-gray-500">Cliente VIP</p>
                        <hr className="my-4 dark:border-gray-700"/>
                        <p className="text-xs text-left">Aquí irían los detalles del cliente desde el CRM, historial de compras, etc.</p>
                    </div>
                ): (
                     <div className="flex-1 flex items-center justify-center text-center">
                        <p className="text-sm text-gray-500">Detalles del cliente aparecerán aquí.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Components for Inbox ---

const ConversationItem: React.FC<{convo: WhatsAppConversation, isActive: boolean, onClick: () => void}> = ({convo, isActive, onClick}) => (
    <div onClick={onClick} className={`p-4 flex items-start gap-3 cursor-pointer border-l-4 ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
        <img src={convo.avatar} alt={convo.customerName} className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm truncate text-gray-800 dark:text-white">{convo.customerName}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{convo.timestamp}</p>
            </div>
            <div className="flex justify-between items-start mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{convo.lastMessage}</p>
                {convo.unreadCount > 0 && <span className="flex-shrink-0 ml-2 w-5 h-5 text-xs bg-primary-500 text-white rounded-full flex items-center justify-center">{convo.unreadCount}</span>}
            </div>
        </div>
    </div>
);


const MessageBubble: React.FC<{msg: WhatsAppMessage}> = ({msg}) => (
    <div className={`flex items-end gap-2 ${msg.sender === 'business' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === 'business' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
            <p className="text-sm">{msg.content}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
                <p className={`text-xs ${msg.sender === 'business' ? 'text-white/70' : 'text-gray-400'}`}>{msg.timestamp}</p>
                {msg.sender === 'business' && <MessageStatusIcon status={msg.status} />}
            </div>
        </div>
    </div>
);

const MessageStatusIcon: React.FC<{status: WhatsAppMessage['status']}> = ({status}) => {
    const color = status === 'read' ? 'text-blue-400' : 'text-white/70';
    return <Check className={`w-4 h-4 ${color}`} />;
}

export default UnifiedInbox;