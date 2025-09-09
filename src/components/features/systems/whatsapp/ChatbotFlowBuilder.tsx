import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    MiniMap,
    Background,
    useReactFlow,
    type Connection,
    type Edge,
    type Node,
} from 'reactflow';
import CustomFlowNode from './CustomFlowNode';
import {
    Save, Share2, Check, ChevronLeft, ChevronRight, ZoomIn, Minus, Grid,
} from '../../../ui/Icons';
import Button from '../../../ui/Button';
import { NodeType, NODE_TYPES } from './nodeTypes';
import NodeConfigPanel from './NodeConfigPanel';
import { motion, AnimatePresence } from 'framer-motion';

// Initial state for the canvas
const initialNodes: Node[] = [
    { id: '1', type: 'custom', position: { x: 250, y: 5 }, data: { type: 'message', title: 'Welcome Message', content: 'Hello! 👋 Welcome to Orbit. How can I help you today?' } },
    { id: '2', type: 'custom', position: { x: 250, y: 180 }, data: { type: 'question', title: 'Identify Intent', content: 'Options: "View Products", "Get Support", "Talk to a human"' } },
    { id: '3', type: 'custom', position: { x: 50, y: 360 }, data: { type: 'condition', title: "If chooses 'Products'", content: 'Show product catalog...', rules: [{ variable: 'last_message', operator: 'contains', value: 'products' }] } },
    { id: '4', type: 'custom', position: { x: 450, y: 360 }, data: { type: 'condition', title: "If chooses 'Support'", content: 'Search FAQ articles...', rules: [] } },
    { id: '5', type: 'custom', position: { x: 450, y: 540 }, data: { type: 'transfer', title: 'Transfer to Agent', content: 'Agent: [Support Tier 1]' } },
    { id: '6', type: 'custom', position: { x: 50, y: 540 }, data: { type: 'api', title: 'Fetch Products', content: 'GET /api/products', api: { method: 'GET', url: 'https://api.example.com/products', headers: [], body: '' } } }
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true },
    { id: 'e2-4', source: '2', target: '4', animated: true },
    { id: 'e4-5', source: '4', target: '5', animated: true },
    { id: 'e3-6', source: '3', target: '6', animated: true }
];

let id = 7;
const getId = () => `${id++}`;

const Toolbar: React.FC = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    return (
        <div className="absolute top-24 right-4 z-10 flex flex-col gap-1 p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg">
            <Button title="Zoom In" variant="secondary" size="sm" className="!p-2" onClick={() => zoomIn()}><ZoomIn className="w-4 h-4" /></Button>
            <Button title="Zoom Out" variant="secondary" size="sm" className="!p-2" onClick={() => zoomOut()}><Minus className="w-4 h-4" /></Button>
            <Button title="Fit View" variant="secondary" size="sm" className="!p-2" onClick={() => fitView()}><Grid className="w-4 h-4" /></Button>
        </div>
    );
};

const ChatbotFlowBuilderContent: React.FC = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(initialNodes[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(true);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow') as NodeType;
            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });
            
            const nodeTemplate = NODE_TYPES.find(n => n.type === type);
            if (!nodeTemplate) return;

            const newNode: Node = {
                id: getId(),
                type: 'custom',
                position,
                data: { type, ...nodeTemplate.data },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onDoubleClick = useCallback((event: React.MouseEvent) => {
        if (!reactFlowWrapper.current || !reactFlowInstance) return;
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
            id: getId(),
            type: 'custom',
            position,
            data: { type: 'message', title: 'New Message', content: '...' }
        };
        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setIsConfigOpen(true); // Open config panel when a node is clicked
    }, []);
    
    const onPaneClick = () => {
        setSelectedNode(null);
    };
    
    const handleNodeConfigChange = useCallback((newData: Partial<Node['data']>) => {
        if (!selectedNode) return;
        
        const updatedData = { ...selectedNode.data, ...newData };

        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === selectedNode.id) {
              return { ...node, data: updatedData };
            }
            return node;
          })
        );
        setSelectedNode(prev => prev ? {...prev, data: updatedData } : null);
    }, [selectedNode, setNodes]);


    const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleSave = () => {
        setIsSaving(true);
        setSaveSuccess(false);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000); // Reset after 2 seconds
        }, 1000);
    };

    const customNodeTypes = useMemo(() => ({ custom: CustomFlowNode }), []);

    return (
        <div className="flex h-full">
            {/* Node Palette */}
            <AnimatePresence>
                {isPaletteOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 288, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-r dark:border-gray-700 flex flex-col overflow-hidden"
                    >
                        <div className="p-4 w-72">
                            <h3 className="text-lg font-bold mb-1">Workflow Builder</h3>
                            <p className="text-xs text-gray-500 mb-4">Drag nodes onto the canvas to start.</p>
                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {NODE_TYPES.map(node => (
                                    <div key={node.type} onDragStart={(event) => onDragStart(event, node.type)} draggable
                                        className="p-2 border dark:border-gray-600 rounded-lg flex items-center gap-3 cursor-grab bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                                        <node.icon className={`w-5 h-5 text-gray-500`} />
                                        <span className="text-sm font-medium">{node.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flow Canvas */}
            <div className="flex-1 flex flex-col relative" ref={reactFlowWrapper}>
                 <button onClick={() => setIsPaletteOpen(!isPaletteOpen)} className="absolute top-20 left-0 z-10 p-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-r-md">
                    <ChevronRight className={`w-4 h-4 transition-transform ${isPaletteOpen ? 'rotate-180' : ''}`} />
                </button>
                 <button onClick={() => setIsConfigOpen(!isConfigOpen)} className="absolute top-20 right-0 z-10 p-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-l-md">
                    <ChevronLeft className={`w-4 h-4 transition-transform ${isConfigOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                     <div>
                        <h2 className="text-xl font-bold">New Customer Onboarding</h2>
                        <p className="text-xs text-gray-500">Active - Last edited: 5 min ago</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            <img className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" src="https://picsum.photos/seed/user1/100" alt="User 1" />
                            <img className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" src="https://picsum.photos/seed/user2/100" alt="User 2" />
                        </div>
                        <Button size="sm" variant="secondary"><Share2 className="w-4 h-4 mr-2"/> Share</Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving || saveSuccess}>
                            {saveSuccess ? <Check className="w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
                        </Button>
                    </div>
                </div>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onDoubleClick={onDoubleClick}
                    nodeTypes={customNodeTypes}
                    fitView
                    className="bg-gray-100 dark:bg-gray-900/50"
                >
                    <Toolbar />
                    <Controls />
                    <MiniMap />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>

            {/* Configuration Panel */}
            <AnimatePresence>
            {isConfigOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 384, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-l dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
                >
                    <div className="w-96 h-full">
                        <NodeConfigPanel 
                            key={selectedNode ? selectedNode.id : 'no-node'}
                            selectedNode={selectedNode}
                            onUpdateNode={handleNodeConfigChange}
                        />
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

const ChatbotFlowBuilder: React.FC = () => (
    <ReactFlowProvider>
        <ChatbotFlowBuilderContent />
    </ReactFlowProvider>
);

export default ChatbotFlowBuilder;