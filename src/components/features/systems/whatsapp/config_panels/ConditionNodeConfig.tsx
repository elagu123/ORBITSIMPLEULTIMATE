import React from 'react';
import { type Node } from 'reactflow';
import Label from '../../../../ui/Label';
import Input from '../../../../ui/Input';
import Select from '../../../../ui/Select';
import Button from '../../../../ui/Button';
import { Plus, Trash2 } from '../../../../ui/Icons';

interface ConditionRule {
    variable: string;
    operator: string;
    value: string;
}

interface ConditionNodeConfigProps {
    node: Node;
    onUpdate: (data: Partial<Node['data']>) => void;
}

const ConditionNodeConfig: React.FC<ConditionNodeConfigProps> = ({ node, onUpdate }) => {
    const { title, rules = [] } = node.data;

    const handleRuleChange = (index: number, field: keyof ConditionRule, value: string) => {
        const newRules = [...rules];
        newRules[index][field] = value;
        onUpdate({ rules: newRules });
    };

    const addRule = () => {
        const newRules = [...rules, { variable: '', operator: 'equals', value: '' }];
        onUpdate({ rules: newRules });
    };

    const removeRule = (index: number) => {
        const newRules = rules.filter((_: any, i: number) => i !== index);
        onUpdate({ rules: newRules });
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-bold">Configuración: Condición</h3>
            <div>
                <Label htmlFor="title">Título del Nodo</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                />
            </div>
            <div>
                <Label>Reglas</Label>
                <div className="p-3 border rounded-lg dark:border-gray-600 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <p className="text-sm">SI el cliente cumple con</p>
                        <Select value="all" className="!w-24 !text-xs !py-1">
                            <option value="all">TODAS</option>
                            <option value="any">CUALQUIERA</option>
                        </Select>
                        <p className="text-sm">de las siguientes condiciones:</p>
                    </div>
                    {rules.map((rule: ConditionRule, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded">
                            <Input placeholder="Variable (ej: tag)" value={rule.variable} onChange={e => handleRuleChange(index, 'variable', e.target.value)} className="!text-xs"/>
                            <Select value={rule.operator} onChange={e => handleRuleChange(index, 'operator', e.target.value)} className="!text-xs">
                                <option value="equals">es igual a</option>
                                <option value="contains">contiene</option>
                                <option value="not_equals">no es igual a</option>
                            </Select>
                            <Input placeholder="Valor" value={rule.value} onChange={e => handleRuleChange(index, 'value', e.target.value)} className="!text-xs"/>
                            <Button size="sm" variant="secondary" className="!p-1.5" onClick={() => removeRule(index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                        </div>
                    ))}
                     <Button size="sm" variant="secondary" onClick={addRule}><Plus className="w-4 h-4 mr-1"/> Añadir Regla</Button>
                </div>
            </div>
        </div>
    );
};

export default ConditionNodeConfig;