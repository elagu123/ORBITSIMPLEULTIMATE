import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Close, Search, Users, UserPlus, ArrowRight } from '../../../ui/Icons';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Label from '../../../ui/Label';

// Mock data, as it's not provided by the app data context for this isolated view
const MOCK_CUSTOMERS = [
    { id: '1', name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: '2', name: 'Jane Smith', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: '3', name: 'Alice Johnson', avatar: 'https://randomuser.me/api/portraits/women/31.jpg' },
    { id: '4', name: 'Robert Brown', avatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
    { id: '5', name: 'Emily Davis', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

type KioskStep = 'welcome' | 'search' | 'new' | 'confirm';

interface KioskModeProps {
    onClose: () => void;
}

const stepVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 }
};

const KioskMode: React.FC<KioskModeProps> = ({ onClose }) => {
    const [step, setStep] = useState<KioskStep>('welcome');
    const [confirmedUser, setConfirmedUser] = useState<{ name: string } | null>(null);

    // Auto-reset after confirmation
    useEffect(() => {
        if (step === 'confirm') {
            const timer = setTimeout(() => {
                setStep('welcome');
                setConfirmedUser(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleConfirm = (name: string) => {
        setConfirmedUser({ name });
        setStep('confirm');
    };

    const renderStep = () => {
        switch (step) {
            case 'welcome':
                return <WelcomeStep key="welcome" setStep={setStep} />;
            case 'search':
                return <SearchStep key="search" onConfirm={handleConfirm} onBack={() => setStep('welcome')} />;
            case 'new':
                return <NewCustomerStep key="new" onConfirm={handleConfirm} onBack={() => setStep('welcome')} />;
            case 'confirm':
                return <ConfirmationStep key="confirm" name={confirmedUser?.name || 'Guest'} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 animate-fade-in flex flex-col items-center justify-center p-8">
            <Button variant="secondary" onClick={onClose} className="absolute top-6 right-6 !p-2 h-10 w-10"><Close className="h-6 w-6" /></Button>
            <div className="w-full max-w-2xl text-center">
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Step Components ---

const WelcomeStep: React.FC<{ setStep: (step: KioskStep) => void }> = ({ setStep }) => (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-white">¡Bienvenido!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Por favor, regístrate para que sepamos que llegaste.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
            <BigButton icon={Users} label="Soy Cliente" onClick={() => setStep('search')} />
            <BigButton icon={UserPlus} label="Primera Vez" onClick={() => setStep('new')} />
        </div>
        <button onClick={() => alert('Visitante registrado')} className="mt-4 text-gray-500 hover:text-primary-500">Solo vine a preguntar</button>
    </motion.div>
);

const SearchStep: React.FC<{ onConfirm: (name: string) => void; onBack: () => void; }> = ({ onConfirm, onBack }) => {
    const [query, setQuery] = useState('');
    const filteredCustomers = useMemo(() =>
        MOCK_CUSTOMERS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
        [query]
    );

    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit">
            <h2 className="text-4xl font-bold mb-6">Busca tu nombre</h2>
            <div className="relative max-w-md mx-auto mb-6">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Escribe tu nombre..." className="text-lg !py-3 !pl-12" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                {filteredCustomers.map(customer => (
                    <div key={customer.id} onClick={() => onConfirm(customer.name)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-all">
                        <img src={customer.avatar} alt={customer.name} className="w-24 h-24 rounded-full mx-auto" />
                        <p className="font-semibold mt-3">{customer.name}</p>
                    </div>
                ))}
            </div>
            <Button variant="secondary" onClick={onBack} className="mt-8">Volver</Button>
        </motion.div>
    );
};

const NewCustomerStep: React.FC<{ onConfirm: (name: string) => void; onBack: () => void; }> = ({ onConfirm, onBack }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone) {
            onConfirm(name);
        }
    };
    return (
        <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-md mx-auto">
            <h2 className="text-4xl font-bold mb-6">Registro Rápido</h2>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div>
                    <Label htmlFor="kiosk-name" className="!text-lg">Nombre</Label>
                    <Input id="kiosk-name" value={name} onChange={e => setName(e.target.value)} className="!text-lg !py-3" required />
                </div>
                <div>
                    <Label htmlFor="kiosk-phone" className="!text-lg">Celular</Label>
                    <Input id="kiosk-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="!text-lg !py-3" required />
                </div>
                <div className="flex gap-4 pt-4">
                    <Button variant="secondary" onClick={onBack} className="w-full !py-3">Volver</Button>
                    <Button type="submit" className="w-full !py-3">Confirmar</Button>
                </div>
            </form>
        </motion.div>
    );
};


const ConfirmationStep: React.FC<{ name: string }> = ({ name }) => (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" exit="exit">
        <h2 className="text-4xl font-bold">¡Gracias por registrarte, {name}!</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Te atenderemos en un momento.</p>
    </motion.div>
);

const BigButton: React.FC<{ icon: React.ElementType, label: string, onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-4 hover:shadow-2xl transition-shadow">
        <Icon className="w-16 h-16 text-primary-500" />
        <span className="text-2xl font-semibold">{label}</span>
    </motion.button>
);


export default KioskMode;