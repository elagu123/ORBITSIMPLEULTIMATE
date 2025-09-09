import React from 'react';
import { type Node } from 'reactflow';
import MessageNodeConfig from './config_panels/MessageNodeConfig';
import ConditionNodeConfig from './config_panels/ConditionNodeConfig';
import ApiNodeConfig from './config_panels/ApiNodeConfig';
import GenericNodeConfig from './config_panels/GenericNodeConfig';

interface NodeConfigPanelProps {
    selectedNode: Node | null;
    onUpdateNode: (data: Partial<Node['data']>) => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ selectedNode, onUpdateNode }) => {
    if (!selectedNode) {
        return (
            <div className="p-4 h-full flex items-center justify-center">
                <p className="text-sm text-gray-500 text-center">Selecciona un nodo para ver su configuración.</p>
            </div>
        );
    }

    const renderPanel = () => {
        switch (selectedNode.data.type) {
            case 'message':
                return <MessageNodeConfig node={selectedNode} onUpdate={onUpdateNode} />;
            case 'condition':
                return <ConditionNodeConfig node={selectedNode} onUpdate={onUpdateNode} />;
            case 'api':
                return <ApiNodeConfig node={selectedNode} onUpdate={onUpdateNode} />;
            default:
                return <GenericNodeConfig node={selectedNode} onUpdate={onUpdateNode} />;
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            {renderPanel()}
        </div>
    );
};

export default NodeConfigPanel;