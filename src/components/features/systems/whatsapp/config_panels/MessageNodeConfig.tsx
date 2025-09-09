import React from 'react';
import { type Node } from 'reactflow';
import Label from '../../../../ui/Label';
import Input from '../../../../ui/Input';
import Textarea from '../../../../ui/Textarea';

interface MessageNodeConfigProps {
    node: Node;
    onUpdate: (data: Partial<Node['data']>) => void;
}

const MessageNodeConfig: React.FC<MessageNodeConfigProps> = ({ node, onUpdate }) => {
    const { title, content } = node.data;

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold">Configuración: Enviar Mensaje</h3>
            <div>
                <Label htmlFor="title">Título del Nodo</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                />
            </div>
            <div>
                <Label htmlFor="content">Contenido del Mensaje</Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    rows={6}
                    placeholder="Escribe el mensaje... Usa {{variable}} para personalizar."
                />
            </div>
        </div>
    );
};

export default MessageNodeConfig;