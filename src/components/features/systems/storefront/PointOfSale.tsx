import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { POSItem, CartItem } from '../../../../types/index';
import { Close, ShoppingCart, Trash, Plus, Minus, CheckCircle, Search } from '../../../ui/Icons';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';

interface PointOfSaleProps {
    onClose: () => void;
}

const MOCK_SERVICES: POSItem[] = [
    { id: 'serv-1', name: 'Corte', price: 2000, type: 'service' },
    { id: 'serv-2', name: 'Color', price: 5000, type: 'service' },
    { id: 'serv-3', name: 'Brushing', price: 1500, type: 'service' },
    { id: 'serv-4', name: 'Tratamiento', price: 2500, type: 'service' },
    { id: 'serv-5', name: 'Manicura', price: 1800, type: 'service' },
    { id: 'serv-6', name: 'Pedicura', price: 2200, type: 'service' },
];

const MOCK_PRODUCTS: POSItem[] = [
    { id: 'prod-1', name: 'Shampoo', price: 1200, type: 'product', category: 'Cuidado Capilar' },
    { id: 'prod-2', name: 'Acondicionador', price: 1200, type: 'product', category: 'Cuidado Capilar' },
    { id: 'prod-3', name: 'Tratamiento Capilar', price: 2500, type: 'product', category: 'Cuidado Capilar' },
    { id: 'prod-4', name: 'Esmalte de Uñas', price: 800, type: 'product', category: 'Uñas' },
    { id: 'prod-5', name: 'Crema de Manos', price: 950, type: 'product', category: 'Cuidado de Piel' },
];

const PointOfSale: React.FC<PointOfSaleProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckout, setIsCheckout] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const addToCart = (item: POSItem) => {
        setCart(prev => {
            const existingItem = prev.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prev.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
        setCart(prev => {
            if (newQuantity <= 0) {
                return prev.filter(item => item.id !== itemId);
            }
            return prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
        });
    };
    
    const clearCart = () => setCart([]);
    const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    
    const itemsToShow = useMemo(() => activeTab === 'services' ? MOCK_SERVICES : MOCK_PRODUCTS, [activeTab]);
    const productCategories = useMemo(() => ['All', ...new Set(MOCK_PRODUCTS.map(p => p.category).filter(Boolean) as string[])], []);

    const filteredItems = useMemo(() => {
        return itemsToShow.filter(item => {
            const categoryMatch = activeTab === 'services' || activeCategory === 'All' || item.category === activeCategory;
            const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [itemsToShow, activeCategory, searchQuery, activeTab]);

    useEffect(() => {
        setActiveCategory('All');
        setSearchQuery('');
    }, [activeTab]);

    const handleSuccessfulSale = () => {
        clearCart();
        setIsCheckout(false);
    }

    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 animate-fade-in">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Punto de Venta</h1>
                <Button variant="secondary" onClick={onClose} className="!p-2 h-9 w-9"><Close className="h-5 w-5"/></Button>
            </header>
            <main className="grid grid-cols-3 gap-6 p-6 h-[calc(100%-72px)]">
                {/* Catalog */}
                <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
                    <div className="p-4 border-b dark:border-gray-700">
                        <div className="flex gap-2">
                            <button onClick={() => setActiveTab('services')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === 'services' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Servicios</button>
                            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === 'products' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Productos</button>
                        </div>
                        <div className="mt-4 relative">
                            <Input 
                                placeholder={`Buscar ${activeTab === 'services' ? 'servicio' : 'producto'}...`}
                                className="pl-10" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {activeTab === 'products' && (
                            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                {productCategories.map(cat => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 overflow-y-auto">
                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredItems.map(item => (
                                    <motion.div key={item.id} whileTap={{ scale: 0.95 }} onClick={() => addToCart(item)} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                                        <p className="font-semibold text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 text-gray-500">
                                <p>No se encontraron resultados.</p>
                                <p className="text-sm">Intenta con otra búsqueda o filtro.</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Cart */}
                <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
                    <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Carrito</h2>
                        <Button variant="secondary" size="sm" onClick={clearCart} disabled={cart.length === 0}><Trash className="w-4 h-4 mr-1"/> Vaciar</Button>
                    </div>
                    {cart.length > 0 ? (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" size="sm" className="!p-1 h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-4 h-4"/></Button>
                                        <span className="w-6 text-center">{item.quantity}</span>
                                        <Button variant="secondary" size="sm" className="!p-1 h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-4 h-4"/></Button>
                                    </div>
                                    <p className="w-16 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600"/>
                            <p className="mt-2 text-sm text-gray-500">El carrito está vacío</p>
                        </div>
                    )}
                    <div className="p-4 border-t dark:border-gray-700 space-y-3">
                        <div className="flex justify-between font-bold text-xl">
                            <span>TOTAL:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <Button className="w-full text-lg !py-3" disabled={cart.length === 0} onClick={() => setIsCheckout(true)}>Registrar Venta</Button>
                    </div>
                </div>
            </main>
            <AnimatePresence>
                {isCheckout && <CheckoutModal total={total} onSuccessfulSale={handleSuccessfulSale} onClose={() => setIsCheckout(false)} />}
            </AnimatePresence>
        </div>
    );
};

const CheckoutModal: React.FC<{total: number, onClose: () => void, onSuccessfulSale: () => void}> = ({ total, onClose, onSuccessfulSale }) => {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');

    const handlePayment = (method: string) => {
        setPaymentMethod(method);
        setStep(2);
        setTimeout(() => {
            onSuccessfulSale();
        }, 2000);
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6 text-center">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h2 className="text-2xl font-bold">Total a Registrar</h2>
                            <p className="text-5xl font-bold my-4 text-primary-500">${total.toFixed(2)}</p>
                            <p className="mb-6">¿Cómo pagó el cliente?</p>
                            <div className="grid grid-cols-2 gap-4">
                                <Button className="!py-4" onClick={() => handlePayment('Efectivo')}>Efectivo</Button>
                                <Button className="!py-4" onClick={() => handlePayment('Tarjeta')}>Tarjeta</Button>
                                <Button className="!py-4" onClick={() => handlePayment('Transferencia')}>Transferencia</Button>
                                <Button className="!py-4" onClick={() => handlePayment('MercadoPago')}>MercadoPago</Button>
                            </div>
                            <Button variant="secondary" className="mt-6" onClick={onClose}>Cancelar</Button>
                        </motion.div>
                    ) : (
                        <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2}} className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-16 h-16"/>
                            </motion.div>
                            <h2 className="text-2xl font-bold mt-4">¡Venta Registrada!</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">La venta por ${total.toFixed(2)} con {paymentMethod} fue registrada exitosamente.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}


export default PointOfSale;