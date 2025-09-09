import React, { useState } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { Integration } from '../../../../types/index';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Label from '../../../ui/Label';

interface ConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    integration: Integration | null;
    onConnectSuccess: (id: string) => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose, integration, onConnectSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    if (!integration) return null;

    const handleConnect = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onConnectSuccess(integration.id);
            onClose();
        }, 1500); // Simulate API call
    };

    return (
        <Modal title={`Connect to ${integration.name}`} isOpen={isOpen} onClose={onClose}>
            <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <integration.icon className="w-8 h-8 text-primary-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    You are about to connect your Orbit MKT account to {integration.name}.
                </p>
            </div>
            <div className="mt-6 space-y-4">
                <div>
                    <Label htmlFor="api_key">API Key (for demo)</Label>
                    <Input id="api_key" placeholder="paste_your_api_key_here" />
                </div>
                 <Button className="w-full" onClick={handleConnect} disabled={isLoading}>
                    {isLoading ? 'Connecting...' : `Connect to ${integration.name}`}
                </Button>
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                This is a simulation. No real connection will be made.
            </p>
        </Modal>
    );
};

export default ConnectionModal;