import React, { useState } from 'react';
import Button from '../../../ui/Button';
import { WhatsAppIcon } from '../../../ui/Icons';
import Input from '../../../ui/Input';
import Label from '../../../ui/Label';

interface WhatsAppConnectProps {
    onConnect: () => void;
}

const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ onConnect }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConnectClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            // Simulate API call to connect
            onConnect();
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
                <WhatsAppIcon className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Conecta tu WhatsApp Business</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Integra la API de WhatsApp Business para automatizar mensajes, gestionar conversaciones y vender directamente desde Orbit MKT.
            </p>
            
            <div className="mt-8 max-w-sm mx-auto text-left space-y-4">
                 <div>
                    <Label htmlFor="phoneNumber">Tu número de WhatsApp Business</Label>
                    <Input id="phoneNumber" type="tel" placeholder="+54 9 11 1234-5678" />
                </div>
                 <Button className="w-full" onClick={handleConnectClick} disabled={isLoading}>
                    {isLoading ? 'Conectando...' : 'Conectar Cuenta'}
                </Button>
            </div>

            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                <p>Al conectar, aceptas los términos de servicio de Meta y Orbit MKT.</p>
                <a href="#" className="text-primary-500 hover:underline">Aprende más sobre la API de WhatsApp Business.</a>
            </div>
        </div>
    );
};

export default WhatsAppConnect;