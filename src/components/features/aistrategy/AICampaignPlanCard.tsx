import React from 'react';
import { motion } from 'framer-motion';
// FIX: Corrected import path for types to point to the new single source of truth.
import { AICampaignPlan, CampaignContent, CampaignScheduleItem } from '../../../types/index';
import Button from '../../ui/Button';
import { Users, FileText, CalendarDays, Target } from '../../ui/Icons';

interface AICampaignPlanCardProps {
    plan: AICampaignPlan;
}

const AICampaignPlanCard: React.FC<AICampaignPlanCardProps> = ({ plan }) => {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{plan.campaignName}</h2>
                <p className="text-sm text-gray-500">Plan estratégico de {plan.durationDays} días para: <span className="font-medium text-gray-700 dark:text-gray-300">{plan.goal}</span></p>
            </div>

            <PlanSection title="Audiencia" icon={Users}>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="font-semibold">{plan.audience.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Alcance estimado: {plan.audience.estimatedReach} clientes</p>
                    <Button size="sm" variant="secondary" className="mt-3">Ver Segmento</Button>
                </div>
            </PlanSection>

            <PlanSection title="Contenido a Generar" icon={FileText}>
                <div className="space-y-3">
                    {plan.content.map((item, index) => (
                        <ContentItem key={index} item={item} />
                    ))}
                </div>
            </PlanSection>

            <PlanSection title="Calendario de Publicación" icon={CalendarDays}>
                 <div className="space-y-3">
                    {plan.schedule.map((item, index) => (
                        <ScheduleItem key={index} item={item} />
                    ))}
                </div>
            </PlanSection>
            
            <div className="pt-6 border-t dark:border-gray-700 flex justify-end items-center gap-4">
                <Button variant="secondary">Solicitar Cambios</Button>
                <Button className="!py-3 text-base">
                    <Target className="w-5 h-5 mr-2"/>
                    Aprobar y Lanzar Campaña
                </Button>
            </div>
        </div>
    );
};

const PlanSection: React.FC<{ title: string, icon: React.ElementType, children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
            <Icon className="w-5 h-5" />
            {title}
        </h3>
        {children}
    </div>
);

const ContentItem: React.FC<{ item: CampaignContent }> = ({ item }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
        <div>
            <p className="font-medium text-sm">{item.title} <span className="text-xs text-gray-500">({item.channel})</span></p>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{item.contentSnippet}"</p>
        </div>
        <Button size="sm" variant="secondary">Editar</Button>
    </div>
);

const ScheduleItem: React.FC<{ item: CampaignScheduleItem }> = ({ item }) => (
     <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-bold w-10 h-10 rounded-md flex flex-col items-center justify-center text-xs leading-none">
                <span>DÍA</span>
                <span className="text-lg">{item.day}</span>
            </div>
            <div>
                 <p className="font-medium text-sm">{item.contentTitle}</p>
                 <p className="text-xs text-gray-500">Programado para las {item.time}</p>
            </div>
        </div>
        <Button size="sm" variant="secondary">Ver en Calendario</Button>
    </div>
);

export default AICampaignPlanCard;