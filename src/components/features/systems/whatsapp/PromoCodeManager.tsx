import React, { useState } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { WhatsAppPromoCode } from '../../../../types/index';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Label from '../../../ui/Label';
import Modal from '../../../ui/Modal';
import { Plus, CheckCircle, Clock } from '../../../ui/Icons';

const MOCK_PROMO_CODES: WhatsAppPromoCode[] = [
    { id: '1', code: 'BIENVENIDA20', type: 'percentage', value: 20, uses: 5, maxUses: 100, isActive: true },
    { id: '2', code: 'VERANO500', type: 'fixed', value: 500, uses: 12, maxUses: 50, isActive: true },
    { id: '3', code: 'INVIERNO15', type: 'percentage', value: 15, uses: 25, maxUses: 25, isActive: false, expiresAt: '2024-06-30' }
];

const PromoCodeManager: React.FC = () => {
    const [codes, setCodes] = useState<WhatsAppPromoCode[]>(MOCK_PROMO_CODES);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateCode = (newCode: Omit<WhatsAppPromoCode, 'id' | 'uses' | 'isActive'>) => {
        const createdCode: WhatsAppPromoCode = {
            id: `promo-${Date.now()}`,
            uses: 0,
            isActive: true,
            ...newCode
        };
        setCodes(prev => [createdCode, ...prev]);
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Gestor de Códigos Promocionales</h2>
                    <p className="text-gray-500">Crea y administra códigos de descuento para tus clientes de WhatsApp.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Crear Código</Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Código</th>
                            <th scope="col" className="py-3 px-6">Descuento</th>
                            <th scope="col" className="py-3 px-6">Usos</th>
                            <th scope="col" className="py-3 px-6">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codes.map(code => (
                            <tr key={code.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="py-4 px-6 font-mono font-bold text-primary-600 dark:text-primary-300">{code.code}</td>
                                <td className="py-4 px-6">{code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}</td>
                                <td className="py-4 px-6">{code.uses} / {code.maxUses || '∞'}</td>
                                <td className="py-4 px-6">
                                    {code.isActive ? (
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle className="w-4 h-4" /> Activo</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-500"><Clock className="w-4 h-4" /> Expirado</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <CreateCodeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateCode} />
        </div>
    );
};

// --- Create Code Modal ---

interface CreateCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (code: Omit<WhatsAppPromoCode, 'id' | 'uses' | 'isActive'>) => void;
}
const CreateCodeModal: React.FC<CreateCodeModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState(10);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ code: code.toUpperCase(), type, value });
        onClose();
        setCode('');
        setValue(10);
    };

    return (
        <Modal title="Crear Nuevo Código Promocional" isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="code">Código</Label>
                    <Input id="code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="EJ: VERANO25" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="type">Tipo de Descuento</Label>
                        <select id="type" value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 mt-1">
                            <option value="percentage">Porcentaje</option>
                            <option value="fixed">Monto Fijo</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="value">Valor</Label>
                        <Input id="value" type="number" value={value} onChange={e => setValue(Number(e.target.value))} required />
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Crear Código</Button>
                </div>
            </form>
        </Modal>
    );
}

export default PromoCodeManager;