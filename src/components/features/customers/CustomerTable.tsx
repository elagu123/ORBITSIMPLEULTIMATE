import React, { useState } from 'react';
// FIX: Corrected import path for types to point to the new single source of truth.
import { EnhancedCustomer } from '../../../types/index';

interface CustomerTableProps {
  customers: EnhancedCustomer[];
}

const LifecycleBadge: React.FC<{ lifecycle: EnhancedCustomer['business']['lifecycle'] }> = ({ lifecycle }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full capitalize";
    const styles = {
        lead: 'bg-gray-200 text-gray-800',
        prospect: 'bg-indigo-200 text-indigo-800',
        customer: 'bg-blue-200 text-blue-800',
        vip: 'bg-yellow-200 text-yellow-800',
        lost: 'bg-red-200 text-red-800',
    };
    return <span className={`${baseClasses} ${styles[lifecycle]}`}>{lifecycle}</span>;
};


const CustomerTable: React.FC<CustomerTableProps> = ({ customers }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = new Set(customers.map(c => c.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">
              <input 
                type="checkbox"
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                onChange={handleSelectAll}
                checked={selectedIds.size === customers.length && customers.length > 0}
              />
            </th>
            <th scope="col" className="py-3 px-6">Name</th>
            <th scope="col" className="py-3 px-6">Status</th>
            <th scope="col" className="py-3 px-6">Total Spent</th>
            <th scope="col" className="py-3 px-6">Last Purchase</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td className="w-4 p-4">
                <input 
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  onChange={() => handleSelectOne(customer.id)}
                  checked={selectedIds.has(customer.id)}
                />
              </td>
              <td scope="row" className="flex items-center py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                <img className="w-10 h-10 rounded-full" src={customer.avatar} alt={`${customer.personal.firstName} avatar`} />
                <div className="pl-3">
                  <div className="text-base font-semibold">{customer.personal.firstName} {customer.personal.lastName}</div>
                  <div className="font-normal text-gray-500">{customer.personal.email}</div>
                </div>
              </td>
              <td className="py-4 px-6">
                <LifecycleBadge lifecycle={customer.business.lifecycle} />
              </td>
              <td className="py-4 px-6">
                ${customer.transactions.totalSpent.toFixed(2)}
              </td>
              <td className="py-4 px-6">
                {customer.transactions.lastPurchaseDate}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;