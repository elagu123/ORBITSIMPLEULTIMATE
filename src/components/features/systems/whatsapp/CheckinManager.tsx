import React, { useState, useMemo } from 'react';
import Button from '../../../ui/Button';
import Label from '../../../ui/Label';
import Textarea from '../../../ui/Textarea';
import { QrCode } from '../../../ui/Icons';

const CheckinManager: React.FC = () => {
    const [checkinMessage, setCheckinMessage] = useState('Llegue');
    const [newClientResponse, setNewClientResponse] = useState('¡Hola! 👋 ¿Es tu primera vez? Responde con tu nombre para registrarte y ganar un descuento.');
    const [knownClientResponse, setKnownClientResponse] = useState('¡Hola {nombre}! Qué bueno verte de nuevo 😊. Ya registramos tu visita. ¡En un momento te atendemos!');

    const whatsappLink = useMemo(() => {
        const phone = "5491112345678"; // Placeholder phone number
        return `https://wa.me/${phone}?text=${encodeURIComponent(checkinMessage)}`;
    }, [checkinMessage]);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(whatsappLink)}`;

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Sistema de Check-in por QR</h2>
            <p className="text-gray-500 mb-6">Configura el código QR para que tus clientes se registren al llegar a tu local.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code Display */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg text-center flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-4">Tu Código de Check-in</h3>
                    <div className="p-4 bg-white rounded-lg shadow-md">
                        <img src={qrCodeUrl} alt="WhatsApp Check-in QR Code" width="250" height="250" />
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Los clientes escanearán este código. Puedes imprimirlo y pegarlo en tu entrada o mostrador.
                    </p>
                    <Button onClick={() => window.print()} className="mt-4">Imprimir</Button>
                </div>

                {/* Configuration */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Configuración de Respuestas</h3>
                        <p className="text-sm text-gray-500">Personaliza los mensajes que enviará tu bot automáticamente.</p>
                    </div>
                    <div>
                        <Label htmlFor="newClientResponse">Respuesta para Cliente Nuevo</Label>
                        <Textarea
                            id="newClientResponse"
                            value={newClientResponse}
                            onChange={(e) => setNewClientResponse(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div>
                        <Label htmlFor="knownClientResponse">Respuesta para Cliente Existente</Label>
                        <Textarea
                            id="knownClientResponse"
                            value={knownClientResponse}
                            onChange={(e) => setKnownClientResponse(e.target.value)}
                            rows={4}
                        />
                        <p className="text-xs text-gray-500 mt-1">Usa {'{nombre}'} para insertar el nombre del cliente.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button>Guardar Cambios</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckinManager;