import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset } from '../../../types/index';
import { Edit, Copy, Trash, Search } from '../../ui/Icons';
import Input from '../../ui/Input';

interface Command {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset | null;
    onEdit: () => void;
    onDelete: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, asset, onEdit, onDelete }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const copyUrl = () => {
        if (!asset) return;
        navigator.clipboard.writeText(asset.url).then(() => {
            console.log('URL copied to clipboard');
            onClose();
        });
    };

    const allCommands: Command[] = asset ? [
        { id: 'edit', label: 'Edit in Visual Editor', icon: <Edit />, action: () => { onEdit(); onClose(); } },
        { id: 'copy-url', label: 'Copy Asset URL', icon: <Copy />, action: copyUrl },
        { id: 'delete', label: 'Delete Asset', icon: <Trash />, action: () => { onDelete(); onClose(); } },
    ] : [];

    const filteredCommands = allCommands.filter(cmd => 
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
            }
        }
    }, [isOpen, onClose, filteredCommands, selectedIndex]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-24"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: -20 }}
                        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative">
                            <div className="absolute top-0 left-0 mt-3 ml-4">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Type a command or search..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                autoFocus
                                className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-800 dark:text-white focus:outline-none"
                            />
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 p-2 max-h-[300px] overflow-y-auto">
                            {filteredCommands.length > 0 ? (
                                <ul>
                                    {filteredCommands.map((cmd, index) => (
                                        <li
                                            key={cmd.id}
                                            onMouseMove={() => setSelectedIndex(index)}
                                            onClick={cmd.action}
                                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                                                selectedIndex === index ? 'bg-primary-100 dark:bg-primary-900/50' : ''
                                            }`}
                                        >
                                            <span className="text-gray-500 dark:text-gray-400">{cmd.icon}</span>
                                            <span className="text-gray-800 dark:text-white">{cmd.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 p-4">No results found.</p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;