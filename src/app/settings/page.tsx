import React, { useState, useEffect, ReactNode } from 'react';
import { useProfile } from '../../store/profileContext';
// FIX: Corrected import path for types to point to the new single source of truth.
import { BusinessProfile } from '../../types/index';
import Button from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Palette, Link, Brain, Bell, CreditCard } from '../../components/ui/Icons';
import AIStrategySettings from '../../components/features/settings/AIStrategySettings';

type SectionKey = 'business' | 'branding' | 'integrations' | 'ai' | 'notifications' | 'billing';

// FIX: Completed the settingsSections object with missing icons to resolve type error.
const settingsSections: Record<SectionKey, { name: string; icon: React.ElementType }> = {
    business: { name: 'My Business', icon: Store },
    branding: { name: 'Branding', icon: Palette },
    ai: { name: 'AI Strategy', icon: Brain },
    integrations: { name: 'Integrations', icon: Link },
    notifications: { name: 'Notifications', icon: Bell },
    billing: { name: 'Billing', icon: CreditCard },
};

// FIX: Exported SettingsCard to be used by child components like AIStrategySettings. This resolves an import error.
export const SettingsCard: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-3">{title}</h3>
        {children}
    </div>
);


const SettingsPage: React.FC = () => {
    const { profile, saveProfile } = useProfile();
    const [activeSection, setActiveSection] = useState<SectionKey>('ai');
    const [formData, setFormData] = useState<BusinessProfile | null>(profile);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    const handleSave = () => {
        if (formData) {
            setIsSaving(true);
            saveProfile(formData);
            setTimeout(() => setIsSaving(false), 1000);
        }
    };

    const renderContent = () => {
        if (!formData) return <div>Loading profile...</div>;

        switch (activeSection) {
            case 'ai':
                return <AIStrategySettings formData={formData} setFormData={setFormData} />;
            // Add other cases for other sections here
            default:
                return (
                    <SettingsCard title="General Settings">
                        <p>Settings for {settingsSections[activeSection].name} coming soon.</p>
                    </SettingsCard>
                );
        }
    };

    return (
         <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-8rem)] bg-transparent gap-6">
            <aside className="w-full lg:w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex-shrink-0">
                <nav className="flex lg:flex-col gap-1 overflow-x-auto">
                    {Object.entries(settingsSections).map(([key, { name, icon: Icon }]) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key as SectionKey)}
                            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 ${
                                activeSection === key
                                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            <span>{name}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 min-h-0">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full overflow-y-auto"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
                 <div className="mt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;