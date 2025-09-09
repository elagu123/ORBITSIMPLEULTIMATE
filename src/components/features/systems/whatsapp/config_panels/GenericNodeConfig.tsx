import React from 'react';
import { type Node } from 'reactflow';
import Label from '../../../../ui/Label';
import Input from '../../../../ui/Input';
import Textarea from '../../../../ui/Textarea';

interface GenericNodeConfigProps {
    node: Node;
    onUpdate: (data: Partial<Node['data']>) => void;
}

const GenericNodeConfig: React.FC<GenericNodeConfigProps> = ({ node, onUpdate }) => {
    const { title, content, type } = node.data;

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold capitalize">Configuración: {type.replace(/_/g, ' ')}</h3>
            <div>
                <Label htmlFor="title">Título del Nodo</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                />
            </div>
            <div>
                <Label htmlFor="content">Descripción / Lógica</Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    rows={4}
                />
            </div>
        </div>
    );
};

export default GenericNodeConfig;