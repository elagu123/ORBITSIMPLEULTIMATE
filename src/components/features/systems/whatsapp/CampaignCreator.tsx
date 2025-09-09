import React, { useState } from 'react';
import { Target, Users, FileText, CalendarDays, CheckCircle } from '../../../ui/Icons';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Label from '../../../ui/Label';

type Step = 'setup' | 'segment' | 'content' | 'schedule' | 'review';

const STEPS: { id: Step; label:string; icon: React.ElementType }[] = [
    { id: 'setup', label: 'Configuración', icon: Target },
    { id: 'segment', label: 'Segmentación', icon: Users },
    { id: 'content', label: 'Contenido', icon: FileText },
    { id: 'schedule', label: 'Programación', icon: CalendarDays },
    { id: 'review', label: 'Revisar', icon: CheckCircle }
];

const CampaignCreator: React.FC = () => {
    const [activeStep, setActiveStep] = useState<Step>('setup');

    const nextStep = () => {
        const currentIndex = STEPS.findIndex(s => s.id === activeStep);
        if (currentIndex < STEPS.length - 1) {
            setActiveStep(STEPS[currentIndex + 1].id);
        }
    };

    const prevStep = () => {
        const currentIndex = STEPS.findIndex(s => s.id === activeStep);
        if (currentIndex > 0) {
            setActiveStep(STEPS[currentIndex - 1].id);
        }
    };
    
    const renderStepContent = () => {
        switch (activeStep) {
            case 'setup': return <SetupStep />;
            case 'segment': return <SegmentStep />;
            case 'content': return <ContentStep />;
            case 'schedule': return <ScheduleStep />;
            case 'review': return <ReviewStep />;
        }
    }

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Crear Nueva Campaña</h2>
            <p className="text-gray-500 mb-6">Sigue los pasos para lanzar tu campaña de WhatsApp.</p>

            <div className="flex items-center justify-center mb-8">
                {STEPS.map((step, index) => {
                    const isActive = STEPS.findIndex(s => s.id === activeStep) >= index;
                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-primary-500 border-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                                    <step.icon className="w-5 h-5" />
                                </div>
                                <p className={`text-xs mt-2 font-medium ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>{step.label}</p>
                            </div>
                            {index < STEPS.length - 1 && <div className={`flex-1 h-0.5 mt-5 mx-4 ${isActive ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>}
                        </React.Fragment>
                    )
                })}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg min-h-[300px]">
                {renderStepContent()}
            </div>
            
            <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={prevStep} disabled={activeStep === 'setup'}>Anterior</Button>
                {activeStep !== 'review' ? (
                    <Button onClick={nextStep}>Siguiente</Button>
                ) : (
                    <Button>Lanzar Campaña</Button>
                )}
            </div>
        </div>
    );
};

// -- Step Components --

const StepCard: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const SetupStep: React.FC = () => (
    <StepCard title="1. Configuración de la Campaña">
        <div>
            <Label htmlFor="campaign-name">Nombre de la Campaña</Label>
            <Input id="campaign-name" placeholder="Ej: Promo Día de la Madre" />
        </div>
        <div>
            <Label htmlFor="campaign-type">Tipo de Campaña</Label>
            <select id="campaign-type" className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 mt-1">
                <option>Broadcast (Mensaje Masivo)</option>
                <option>Drip (Goteo)</option>
                <option>Flash Sale (Oferta Rápida)</option>
            </select>
        </div>
    </StepCard>
);

const SegmentStep: React.FC = () => (
     <StepCard title="2. ¿A quién le enviaremos esto?">
        <div className="border dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Clientes que</p>
                <select className="p-1 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600"><option>cumplen con TODO</option><option>cumplen con CUALQUIERA</option></select>
                <p className="text-sm">de las siguientes condiciones:</p>
            </div>
            <div className="space-y-2 mt-3 pl-4 border-l-2 dark:border-gray-600">
                <div className="flex items-center gap-2 text-sm">
                    <p>Etiqueta</p>
                    <select className="p-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"><option>es</option></select>
                    <Input className="!w-32 !py-1" value="VIP"/>
                </div>
                 <div className="flex items-center gap-2 text-sm">
                    <p className="font-semibold">Y</p>
                    <p>Última compra</p>
                    <select className="p-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"><option>hace menos de</option></select>
                    <Input className="!w-16 !py-1" value="30"/>
                    <p>días</p>
                </div>
            </div>
             <Button size="sm" variant="secondary" className="mt-3">+ Añadir Condición</Button>
        </div>
        <p className="text-sm font-semibold">Destinatarios estimados: <span className="text-primary-500">124 clientes</span></p>
    </StepCard>
);

const ContentStep: React.FC = () => (
     <StepCard title="3. ¿Qué mensaje enviaremos?">
        <Label htmlFor="template-select">Seleccionar Plantilla de Mensaje</Label>
        <select id="template-select" className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 mt-1">
            <option>order_confirmation (Aprobada)</option>
            <option>appointment_reminder (Aprobada)</option>
            <option>welcome_message (Aprobada)</option>
        </select>
         <p className="text-xs text-gray-500">Solo se muestran las plantillas aprobadas por Meta.</p>
    </StepCard>
);

const ScheduleStep: React.FC = () => (
     <StepCard title="4. ¿Cuándo lo enviaremos?">
        <div className="space-y-3">
             <div className="p-3 border rounded-lg dark:border-gray-700"><input type="radio" name="schedule" id="now" className="mr-2" defaultChecked/> <Label htmlFor="now" className="!inline !mb-0">Enviar ahora</Label></div>
             <div className="p-3 border rounded-lg dark:border-gray-700"><input type="radio" name="schedule" id="later" className="mr-2"/> <Label htmlFor="later" className="!inline !mb-0">Programar para después</Label></div>
             <div className="p-3 border rounded-lg bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-500/50">
                 <input type="radio" name="schedule" id="ai" className="mr-2"/>
                 <Label htmlFor="ai" className="!inline !mb-0 font-semibold text-primary-600 dark:text-primary-300">Optimización por IA (Recomendado)</Label>
                 <p className="text-xs text-gray-500 ml-5">La IA enviará el mensaje en el mejor horario para cada contacto individualmente.</p>
            </div>
        </div>
    </StepCard>
);

const ReviewStep: React.FC = () => (
    <StepCard title="5. Revisa y Lanza tu Campaña">
        <div className="space-y-3 text-sm">
            <p><strong>Nombre:</strong> Promo Día de la Madre</p>
            <p><strong>Audiencia:</strong> 124 clientes (VIPs activos)</p>
            <p><strong>Mensaje:</strong> Plantilla 'new_promo_q3'</p>
            <p><strong>Envío:</strong> Optimización por IA</p>
        </div>
        <p className="text-xs text-gray-500 mt-4">La campaña se enviará en las próximas 24 horas según los horarios óptimos para cada destinatario.</p>
    </StepCard>
);

export default CampaignCreator;