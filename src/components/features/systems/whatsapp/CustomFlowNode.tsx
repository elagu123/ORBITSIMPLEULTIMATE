import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import {
    MessageCircle, HelpCircle, GitBranch, Zap, UserCheck, Code, Clock, Database,
} from '../../../ui/Icons';
import { NodeType } from './nodeTypes';

// Map node types to their visual components
const nodeVisuals: Record<NodeType, { icon: React.ElementType; color: string }> = {
    message: { icon: MessageCircle, color: 'border-blue-500' },
    question: { icon: HelpCircle, color: 'border-yellow-500' },
    condition: { icon: GitBranch, color: 'border-green-500' },
    action: { icon: Zap, color: 'border-purple-500' },
    transfer: { icon: UserCheck, color: 'border-red-500' },
    api: { icon: Code, color: 'border-gray-500' },
    delay: { icon: Clock, color: 'border-teal-500' },
    database: { icon: Database, color: 'border-indigo-500' },
};


const CustomFlowNode = ({ data, isConnectable, selected }: NodeProps<{ type: NodeType, title: string, content: string }>) => {
    const { icon: Icon, color } = nodeVisuals[data.type] || nodeVisuals.message;
    
    return (
        <div className={`w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 ${color} ${selected ? 'ring-2 ring-primary-500' : ''}`}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!w-3 !h-3" />
            
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${color.replace('border-', 'text-')}`} />
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white">{data.title}</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">{data.content}</p>
            </div>
            
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!w-3 !h-3" />
        </div>
    );
};

export default memo(CustomFlowNode);