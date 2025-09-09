import React from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { EnhancedCustomer } from '../../../types/index';

interface CustomerKanbanViewProps {
  customers: EnhancedCustomer[];
}

const CustomerKanbanView: React.FC<CustomerKanbanViewProps> = ({ customers }) => {
  
  const columns: EnhancedCustomer['business']['lifecycle'][] = ['lead', 'prospect', 'customer', 'vip', 'lost'];
  
  const customersByLifecycle = columns.reduce((acc, stage) => {
    acc[stage] = customers.filter(c => c.business.lifecycle === stage);
    return acc;
  }, {} as Record<EnhancedCustomer['business']['lifecycle'], EnhancedCustomer[]>);

  return (
    <div className="flex space-x-4 overflow-x-auto p-2">
      {columns.map(stage => (
        <div key={stage} className="flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <h3 className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize border-b-2 border-gray-200 dark:border-gray-700">{stage} ({customersByLifecycle[stage].length})</h3>
          <div className="p-2 space-y-3 overflow-y-auto h-[60vh]">
            {customersByLifecycle[stage].map(customer => (
              <div key={customer.id} className="bg-white dark:bg-gray-800 p-3 rounded-md shadow">
                <div className="flex items-center space-x-3">
                  <img src={customer.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{customer.personal.firstName} {customer.personal.lastName}</p>
                    <p className="text-xs text-gray-500">{customer.personal.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerKanbanView;