import React from 'react';
import {
    MessageCircle, HelpCircle, GitBranch, Zap, UserCheck, Code, Clock, Database,
} from '../../../ui/Icons';

export type NodeType = 'message' | 'question' | 'condition' | 'action' | 'transfer' | 'api' | 'delay' | 'database';

export const NODE_TYPES: {
  type: NodeType;
  label: string;
  icon: React.ElementType;
  data: any;
}[] = [
    { type: 'message', label: 'Enviar Mensaje', icon: MessageCircle, data: { title: 'Enviar Mensaje', content: 'Escribe el mensaje...' } },
    { type: 'question', label: 'Hacer Pregunta', icon: HelpCircle, data: { title: 'Hacer Pregunta', content: 'Define la pregunta y opciones...' } },
    { type: 'condition', label: 'Condición', icon: GitBranch, data: { title: 'Condición', content: 'Si el cliente dice "hola"...', rules: [] } },
    { type: 'action', label: 'Acción', icon: Zap, data: { title: 'Acción', content: 'Añadir etiqueta "interesado"...' } },
    { type: 'transfer', label: 'Transferir a Agente', icon: UserCheck, data: { title: 'Transferir a Agente', content: 'Equipo: Ventas' } },
    { type: 'api', label: 'Llamada API', icon: Code, data: { title: 'Llamada API', content: 'GET /api/user...', api: { method: 'GET', url: '', headers: [], body: '' } } },
    { type: 'delay', label: 'Esperar', icon: Clock, data: { title: 'Esperar', content: '5 minutos' } },
    { type: 'database', label: 'Base de Datos', icon: Database, data: { title: 'Base de Datos', content: 'Consultar stock...' } }
];