import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const messageData = [
    { name: 'Lun', sent: 40, received: 24 },
    { name: 'Mar', sent: 30, received: 13 },
    { name: 'Mié', sent: 50, received: 42 },
    { name: 'Jue', sent: 27, received: 19 },
    { name: 'Vie', sent: 60, received: 55 },
    { name: 'Sáb', sent: 45, received: 38 },
    { name: 'Dom', sent: 10, received: 8 },
];

const templateData = [
    { name: 'appointment_reminder', value: 400 },
    { name: 'order_confirmation', value: 300 },
    { name: 'welcome_message', value: 150 },
    { name: 'new_promo_q3', value: 200 },
];
const COLORS = ['#3b82f6', '#818cf8', '#a78bfa', '#c084fc'];

const kpiData = [
    { title: 'Conversaciones Iniciadas', value: '72' },
    { title: 'Tasa de Respuesta', value: '95%' },
    { title: 'Tiempo de Respuesta Prom.', value: '2m 15s' },
    { title: 'Ventas por WhatsApp', value: '$1,250' },
];

const WhatsAppReports: React.FC = () => {
    return (
        <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Reportes de WhatsApp</h2>
            <p className="text-gray-500 mb-6">Mide el rendimiento y el impacto de tu canal de comunicación.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpiData.map(kpi => (
                    <div key={kpi.title} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.title}</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Mensajes Enviados vs. Recibidos (Últimos 7 días)">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={messageData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700"/>
                            <XAxis dataKey="name" className="text-xs"/>
                            <YAxis className="text-xs"/>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem' }}/>
                            <Legend wrapperStyle={{fontSize: '12px'}}/>
                            <Bar dataKey="sent" fill="#3b82f6" name="Enviados" />
                            <Bar dataKey="received" fill="#818cf8" name="Recibidos" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Plantillas Más Usadas">
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={templateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {templateData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem' }}/>
                            <Legend wrapperStyle={{fontSize: '12px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

const ChartCard: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
    </div>
);


export default WhatsAppReports;