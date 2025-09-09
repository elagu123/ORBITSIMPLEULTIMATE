import React from 'react';
import { type Node } from 'reactflow';
import Label from '../../../../ui/Label';
import Input from '../../../../ui/Input';
import Select from '../../../../ui/Select';
import Textarea from '../../../../ui/Textarea';
import Button from '../../../../ui/Button';
import { Plus, Trash2 } from '../../../../ui/Icons';

interface Header {
    key: string;
    value: string;
}

interface ApiData {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers: Header[];
    body: string;
}

interface ApiNodeConfigProps {
    node: Node;
    onUpdate: (data: Partial<Node['data']>) => void;
}

const ApiNodeConfig: React.FC<ApiNodeConfigProps> = ({ node, onUpdate }) => {
    const { title, api = { method: 'GET', url: '', headers: [], body: '' } } = node.data;
    const { method, url, headers, body }: ApiData = api;

    const handleApiChange = (field: keyof ApiData, value: any) => {
        onUpdate({ api: { ...api, [field]: value } });
    };

    const handleHeaderChange = (index: number, field: keyof Header, value: string) => {
        const newHeaders = [...headers];
        newHeaders[index][field] = value;
        handleApiChange('headers', newHeaders);
    };

    const addHeader = () => {
        handleApiChange('headers', [...headers, { key: '', value: '' }]);
    };
    
    const removeHeader = (index: number) => {
        handleApiChange('headers', headers.filter((_: any, i: number) => i !== index));
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold">Configuración: Llamada API</h3>
            <div>
                <Label htmlFor="title">Título del Nodo</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                />
            </div>
            <div>
                <Label htmlFor="endpoint-url">Endpoint</Label>
                <div className="flex gap-2">
                    <Select value={method} onChange={e => handleApiChange('method', e.target.value)} className="!w-24">
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </Select>
                    <Input id="endpoint-url" placeholder="https://api.example.com/data" value={url} onChange={e => handleApiChange('url', e.target.value)}/>
                </div>
            </div>
            <div>
                <Label>Headers</Label>
                <div className="space-y-2 p-2 border dark:border-gray-600 rounded-lg">
                    {headers.map((header: Header, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input placeholder="Key" value={header.key} onChange={e => handleHeaderChange(index, 'key', e.target.value)} className="!text-sm" />
                            <Input placeholder="Value" value={header.value} onChange={e => handleHeaderChange(index, 'value', e.target.value)} className="!text-sm" />
                            <Button size="sm" variant="secondary" className="!p-1.5" onClick={() => removeHeader(index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                        </div>
                    ))}
                    <Button size="sm" variant="secondary" onClick={addHeader}><Plus className="w-4 h-4 mr-1"/> Añadir Header</Button>
                </div>
            </div>
            <div>
                <Label htmlFor="api-body">Body (JSON)</Label>
                <Textarea id="api-body" value={body} onChange={e => handleApiChange('body', e.target.value)} rows={5} placeholder={`{\n  "key": "value"\n}`}/>
            </div>
        </div>
    );
};

export default ApiNodeConfig;