import React, { useState } from 'react';
import { FileText, Plus, Image, Video, CheckCircle, Clock, XCircle, Search, Edit } from '../../../ui/Icons';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Textarea from '../../../ui/Textarea';

type TemplateStatus = 'approved' | 'pending' | 'rejected';

const MOCK_TEMPLATES = [
    { id: 't1', name: 'order_confirmation', category: 'Transactional', status: 'approved' as TemplateStatus },
    { id: 't2', name: 'appointment_reminder', category: 'Transactional', status: 'approved' as TemplateStatus },
    { id: 't3', name: 'new_promo_q3', category: 'Marketing', status: 'pending' as TemplateStatus },
    { id: 't4', name: 'welcome_message', category: 'Customer Service', status: 'approved' as TemplateStatus },
    { id: 't5', name: 'abandoned_cart', category: 'Marketing', status: 'rejected' as TemplateStatus },
];

const TemplateBuilder: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(MOCK_TEMPLATES[0]);
    const [headerType, setHeaderType] = useState('text');
    const [bodyText, setBodyText] = useState('Hola {{1}}! ✅ Tu pedido #{{2}} fue confirmado.');
    const [footerText, setFooterText] = useState('Gracias por tu compra.');
    const [buttons, setButtons] = useState(['Ver detalles', 'Cancelar']);

    return (
        <div className="flex h-full">
            {/* Template List */}
            <div className="w-1/4 border-r dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold">Plantillas</h3>
                    <Button size="sm"><Plus className="w-4 h-4 mr-1"/> Nueva</Button>
                </div>
                <div className="p-4"><Input placeholder="Buscar plantilla..." className="pl-8" /><Search className="absolute left-7 top-7 w-4 h-4 text-gray-400"/></div>
                <div className="flex-1 overflow-y-auto">
                    {MOCK_TEMPLATES.map(t => <TemplateListItem key={t.id} template={t} isActive={t.id === selectedTemplate.id} onClick={() => setSelectedTemplate(t)} />)}
                </div>
            </div>

            {/* Editor Panel */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-2xl font-bold mb-4">{selectedTemplate.name}</h2>
                <div className="space-y-6">
                    <EditorSection title="Encabezado">
                        <select value={headerType} onChange={e => setHeaderType(e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600">
                            <option value="none">Ninguno</option>
                            <option value="text">Texto</option>
                            <option value="image">Imagen</option>
                            <option value="video">Video</option>
                        </select>
                        {headerType === 'text' && <Input placeholder="Tu encabezado aquí..." className="mt-2"/>}
                    </EditorSection>
                    
                    <EditorSection title="Cuerpo del Mensaje">
                        <Textarea value={bodyText} onChange={e => setBodyText(e.target.value)} rows={6} placeholder="Escribe tu mensaje... Usa {{1}}, {{2}} para variables."/>
                        <p className="text-xs text-gray-500 mt-1">Variables detectadas: <span className="font-mono text-primary-500">{'{{1}}'}</span> <span className="font-mono text-primary-500">{'{{2}}'}</span></p>
                    </EditorSection>
                    
                    <EditorSection title="Pie de Página">
                        <Input value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="Texto corto opcional..."/>
                    </EditorSection>

                    <EditorSection title="Botones">
                        <div className="space-y-2">
                        {buttons.map((btn, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input value={btn} onChange={e => setButtons(btns => btns.map((b, i) => i === index ? e.target.value : b))} />
                                <Button variant="secondary" size="sm" className="!p-2"><XCircle className="w-4 h-4 text-red-500"/></Button>
                            </div>
                        ))}
                        </div>
                        <Button size="sm" variant="secondary" className="mt-2" onClick={() => setButtons(b => [...b, 'Nuevo Botón'])}>Añadir Botón</Button>
                    </EditorSection>
                </div>
            </div>

            {/* Preview Panel */}
            <div className="w-1/3 bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">
                <PhoneMockup {...{headerType, bodyText, footerText, buttons}}/>
            </div>
        </div>
    );
};


// --- Sub-components ---

const TemplateListItem: React.FC<{template: any, isActive: boolean, onClick: () => void}> = ({ template, isActive, onClick }) => {
    const statusInfo = {
        approved: { icon: CheckCircle, color: 'text-green-500' },
        pending: { icon: Clock, color: 'text-yellow-500' },
        rejected: { icon: XCircle, color: 'text-red-500' },
    };
    const StatusIcon = statusInfo[template.status].icon;

    return (
        <div onClick={onClick} className={`p-3 mx-2 my-1 rounded-lg flex items-center gap-3 cursor-pointer ${isActive ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
                <p className="font-medium text-sm truncate">{template.name}</p>
                <p className="text-xs text-gray-500">{template.category}</p>
            </div>
            <StatusIcon className={`w-5 h-5 flex-shrink-0 ${statusInfo[template.status].color}`} />
        </div>
    )
}

const EditorSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h4 className="font-semibold mb-2">{title}</h4>
        {children}
    </div>
)

const PhoneMockup: React.FC<{headerType: string, bodyText: string, footerText: string, buttons: string[]}> = (props) => {
    const name = "Cliente Ejemplo";
    const number = "+54 9 11 5555-1234";

    return (
        <div className="w-[320px] h-[640px] bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl border-8 border-gray-900 dark:border-gray-600 overflow-hidden flex flex-col">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <div className="ml-2">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-gray-500">{number}</p>
                </div>
            </div>
            <div className="flex-1 bg-green-50 dark:bg-green-900/10 p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow max-w-[85%]">
                    {props.headerType === 'image' && <div className="h-32 bg-gray-200 rounded-t-md flex items-center justify-center"><Image className="w-8 h-8 text-gray-400"/></div>}
                    {props.headerType === 'video' && <div className="h-32 bg-gray-200 rounded-t-md flex items-center justify-center"><Video className="w-8 h-8 text-gray-400"/></div>}
                    <div className="p-2">
                        <p className="text-sm whitespace-pre-wrap">{props.bodyText.replace(/\{\{1\}\}/g, name.split(' ')[0]).replace(/\{\{2\}\}/g, "A123")}</p>
                        <p className="text-xs text-gray-400 mt-1">{props.footerText}</p>
                    </div>
                </div>
                 <div className="mt-2 space-y-1">
                    {props.buttons.map((btn, i) => (
                        <div key={i} className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow text-center text-sm text-blue-500 font-medium">{btn}</div>
                    ))}
                 </div>
            </div>
        </div>
    )
}


export default TemplateBuilder;